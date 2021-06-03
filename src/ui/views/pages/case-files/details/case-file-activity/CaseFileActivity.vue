<template>
  <rc-page-content
    content-padding="0"
    :outer-scroll="true"
    :title="$t('caseFile.caseFileActivity')"
    :show-help="true"
    :help-link="$t('zendesk.help_link.caseFileActivity')">
    <rc-page-loading v-if="loading" />
    <template v-if="!loading" slot="top">
      <case-file-tags
        data-test="caseFileActivity-tags"
        :case-file-id="caseFile.id"
        :tags="caseFile.tags || []"
        @updateActivities="fetchCaseFileActivities(activityFetchDelay)" />

      <v-row class="ma-0 pa-0">
        <v-col cols="12" md="6" class="flex-row">
          <case-file-status
            :case-file="caseFile"
            @updateActivities="fetchCaseFileActivities(activityFetchDelay)" />

          <v-divider vertical class="ml-4 mr-4" />

          <span class="pr-2 rc-body12">{{ $t('caseFileActivity.triage') }}:</span>
          <v-select
            :value="caseFile.triage"
            class="triage-select"
            data-test="caseFileActivity-triage-select"
            :menu-props="{ bottom: true, offsetY: true, contentClass: 'case-file-triage-dropdown', maxWidth: 'fit-content' }"
            :items="triageLevels"
            :loading="triageLoading"
            hide-details
            @change="setCaseFileTriage($event)" />

          <v-divider
            vertical
            class="ml-4 mr-4" />

          <v-btn
            data-test="caseFileActivity-duplicateBtn"
            :class="{ 'no-pointer': !canMarkDuplicate }"
            icon
            :loading="duplicateLoading"
            :disabled="!canMarkDuplicate"
            @click="setCaseFileIsDuplicate">
            <v-icon :color="caseFile && caseFile.isDuplicate ? 'secondary' : ''">
              $rctech-duplicate
            </v-icon>
          </v-btn>
        </v-col>

        <case-file-assignments :case-file="caseFile" data-test="case-file-assignments" />
      </v-row>
    </template>
    <template v-if="!loading" slot="default">
      <v-row class="ma-0 pa-0">
        <case-file-labels />
      </v-row>

      <v-row class="ma-0 px-2 pt-0 no-gutters">
        <v-col cols="12">
          <case-file-list-wrapper :empty="caseFileActivities.length === 0" :loading="loadingActivity" class="pa-4">
            <!-- <div v-if="caseFile && caseFile.timestamp" class="rc-body12">
              {{ $t('caseFileDetail.lastAction') }}:
              {{ moment.utc(caseFile.timestamp).local().format('ll') }}
              <span class="fw-bold ml-1">
                ({{ lastActionAgo }})
              </span>
            </div> -->

            <component
              :is="getComponentName(item.activityType)"
              v-for="item in caseFileActivities"
              :key="item.id"
              :force-hide-menu="true"
              :item="item" />
          </case-file-list-wrapper>
        </v-col>
      </v-row>
    </template>
  </rc-page-content>
</template>

<script lang="ts">
import Vue from 'vue';
import _sortBy from 'lodash/sortBy';
import { RcPageContent, RcPageLoading } from '@crctech/component-library';
import { ICaseFile, ICaseFileActivity, ECaseFileTriage } from '@/entities/case-file';
import moment from '@/ui/plugins/moment';
import helpers from '@/ui/helpers';
import CaseFileTags from './components/CaseFileTags.vue';
import CaseFileLabels from './components/CaseFileLabels.vue';
import CaseFileStatus from './components/CaseFileStatus.vue';
import CaseFileListWrapper from '../components/CaseFileListWrapper.vue';
import CaseFileActivityListItem from './components/CaseFileActivityListItem.vue';
import AssignCaseFile from './components/AssignCaseFile.vue';
import CaseFileAssignments from './components/CaseFileAssignments.vue';

export default Vue.extend({
  name: 'CaseFileActivity',
  components: {
    RcPageLoading,
    RcPageContent,
    CaseFileTags,
    CaseFileListWrapper,
    CaseFileStatus,
    CaseFileLabels,
    CaseFileActivityListItem,
    AssignCaseFile,
    CaseFileAssignments,
  },

  data() {
    return {
      moment,
      error: false,
      showLabelsDialog: false,
      loading: false,
      loadingActivity: false,
      lastActionAgo: null,
      caseFileActivities: [] as ICaseFileActivity[],
      activityFetchDelay: 800,
    };
  },

  computed: {
    id() {
      return this.$route.params.id;
    },

    canMarkDuplicate(): boolean {
      return this.$hasLevel('level1');
    },

    caseFile(): ICaseFile {
      return this.$storage.caseFile.getters.caseFileById(this.id);
    },

    duplicateLoading(): boolean {
      return this.$store.state.caseFile.duplicateLoading;
    },

    triageLevels(): {value: unknown, text: string}[] {
      const levels = helpers.enumToTranslatedCollection(ECaseFileTriage, 'enums.Triage');
      return _sortBy(levels, 'value');
    },

    triageLoading(): boolean {
      return this.$store.state.caseFile.triageLoading;
    },
  },

  async created() {
    try {
      this.loading = true;

      await this.$storage.caseFile.actions.fetchCaseFile(this.id);

      // this.setLastAction();
      await this.fetchCaseFileActivities();
    } catch {
      this.error = true;
    } finally {
      this.loading = false;
    }
  },

  methods: {
    async fetchCaseFileActivities(delay = 0) {
      try {
        this.loadingActivity = true;
        // wait for a few milliseconds before making the call after the case file was modified, to give the backend time to process the modification
        await new Promise((resolve) => setTimeout(resolve, delay));
        const activity: ICaseFileActivity[] = await this.$storage.caseFile.actions.fetchCaseFileActivities(this.id);
        this.caseFileActivities = activity;
      } catch {
        this.error = true;
      } finally {
        this.loadingActivity = false;
      }
    },

    getComponentName(): string {
      return 'CaseFileActivityListItem';
    },

    // Will be implemented in a future story
    // setLastAction() {
    //   this.lastActionAgo = moment.utc(this.caseFile.timestamp).local().locale(moment.locale()).fromNow();
    // },

    async setCaseFileIsDuplicate() {
      const { id, isDuplicate } = this.caseFile;
      await this.$storage.caseFile.actions.setCaseFileIsDuplicate(id, !isDuplicate);
      this.fetchCaseFileActivities(this.activityFetchDelay);
    },

    async setCaseFileTriage(triage: number) {
      await this.$storage.caseFile.actions.setCaseFileTriage(this.id, triage);
      this.fetchCaseFileActivities(this.activityFetchDelay);
    },
  },
});
</script>

<style  lang='scss'>

  .case-file-triage-dropdown {
    margin-top: -5px;

    .v-list-item__title {
      font-size: 12px;
    }
  }
</style>

<style scoped lang='scss'>
  .borderLeft {
     border-left: thin solid lightgrey;
  }

  .caseFileActivity__lastAction {
      display: flex;
      justify-content: flex-end;
      margin-top: 16px;
  }

  .triage-select{
    margin-top: 2px;
    padding: 0 4px;
    max-width: fit-content;
    min-width: 80px;
    font-size: 12px;
  }

  ::v-deep {
    .v-input__slot:before {
      display: none;
    }

    .v-input__slot:after {
      visibility: hidden;
    }

    .v-text-field.v-input--is-focused > .v-input__control > .v-input__slot:after {
      visibility: visible;
    }

    .v-text-field .v-input__append-inner {
      padding-left: 0;
    }

    .v-select__selections input {
      max-width: 4px;
    }

  }

</style>
