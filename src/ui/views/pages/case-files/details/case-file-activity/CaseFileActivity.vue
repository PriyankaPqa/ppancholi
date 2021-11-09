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
        :readonly="!canEdit"
        :case-file-id="caseFile.entity.id"
        :tags="caseFile.metadata.tags || []"
        @updateActivities="fetchCaseFileActivities(activityFetchDelay)" />

      <v-row class="ma-0 pa-0">
        <v-col cols="12" md="6" class="flex-row">
          <case-file-status
            :case-file="caseFile"
            @updateActivities="fetchCaseFileActivities(activityFetchDelay)" />

          <v-divider vertical class="ml-4 mr-4" />

          <span class="pr-2 rc-body12">{{ $t('caseFileActivity.triage') }}:</span>
          <v-select
            :value="caseFile.entity.triage"
            class="triage-select"
            data-test="caseFileActivity-triage-select"
            :readonly="!canEdit"
            :menu-props="{ bottom: true, offsetY: true, contentClass: 'case-file-activity-dropdown', maxWidth: 'fit-content' }"
            :items="triageLevels"
            :loading="triageLoading"
            hide-details
            @change="setCaseFileTriage($event)" />

          <v-divider
            vertical
            class="ml-4 mr-4" />

          <rc-tooltip right>
            <template #activator="{ on }">
              <v-btn
                data-test="caseFileActivity-duplicateBtn"
                :class="{ 'no-pointer': !canEdit }"
                icon
                :loading="duplicateLoading"
                :disabled="!canEdit"
                v-on="on"
                @click="setCaseFileIsDuplicate">
                <v-icon :color="caseFile && caseFile.entity.isDuplicate ? 'secondary' : ''">
                  $rctech-duplicate
                </v-icon>
              </v-btn>
            </template>
            {{ $t('caseFileActivity.duplicate') }}
          </rc-tooltip>
        </v-col>

        <case-file-assignments
          :case-file="caseFile.entity"
          data-test="case-file-assignments"
          @updateActivities="fetchCaseFileActivities(activityFetchDelay)" />
      </v-row>
    </template>
    <template v-if="!loading" slot="default">
      <v-row class="ma-0 pa-0">
        <case-file-labels
          :case-file-id="caseFile.entity.id"
          :case-file-labels="caseFile.entity.labels || []"
          :readonly="!canEdit" />
      </v-row>

      <v-row class="ma-0 px-2 pt-0 no-gutters">
        <v-col cols="12">
          <case-file-list-wrapper :empty="caseFileActivities.length === 0" :loading="loadingActivity" class="pa-4">
            <v-row>
              <!-- hide lastActionDate until lee decides otherwise - too many issues in BE -->
              <v-col class="rc-body12" data-test="caseFileActivity-last-action-date" style="visibility:hidden" cols="12" md="6">
                {{ $t('caseFileActivity.lastAction', {x: lastActionDate }) }} <span class="fw-bold ml-1">({{ daysAgo }})</span>
              </v-col>
              <v-col cols="12" md="6" class="d-flex justify-end align-center rc-body14">
                <span> {{ $t('caseFileActivity.sortBy') }}: </span>
                <v-select
                  class="case-file-activity-sort-select"
                  :placeholder="$t('caseFileActivity.date')"
                  data-test="caseFileActivity-case-file-activity-sort-select"
                  :menu-props="{ bottom: true, offsetY: true, contentClass: 'case-file-activity-dropdown', maxWidth: 'fit-content' }"
                  :items="sortingListItems"
                  :min-width="500"
                  hide-details
                  @change="sortCaseFileActivities($event)" />
              </v-col>
            </v-row>

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
import mixins from 'vue-typed-mixins';
import _sortBy from 'lodash/sortBy';
import _orderBy from 'lodash/orderBy';
import { RcPageContent, RcPageLoading, RcTooltip } from '@crctech/component-library';
import { ICaseFileActivity, CaseFileTriage } from '@/entities/case-file';
import moment from '@/ui/plugins/moment';
import helpers from '@/ui/helpers/helpers';
import CaseFileTags from './components/CaseFileTags.vue';
import CaseFileLabels from './components/CaseFileLabels.vue';
import CaseFileStatus from './components/CaseFileStatus.vue';
import CaseFileListWrapper from '../components/CaseFileListWrapper.vue';
import CaseFileActivityListItem from './components/CaseFileActivityListItem.vue';
import AssignCaseFile from './components/AssignCaseFile.vue';
import CaseFileAssignments from './components/CaseFileAssignments.vue';
import caseFileDetail from '../caseFileDetail';

export default mixins(caseFileDetail).extend({
  name: 'CaseFileActivity',
  components: {
    RcPageLoading,
    RcTooltip,
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
      lastActionDate: null,
      daysAgo: null,
      caseFileActivities: [] as ICaseFileActivity[],
      activityFetchDelay: 800,
      sortingListItems: [
        {
          value: 'asc', text: this.$t('caseFileActivity.ascending'),
        },
        {
          value: 'desc', text: this.$t('caseFileActivity.descending'),
        },
      ]
      ,
    };
  },
  computed: {
    locale() {
      return this.$i18n.locale;
    },

    canEdit(): boolean {
      return this.$hasLevel('level1') && !this.readonly;
    },

    duplicateLoading(): boolean {
      return this.$store.state.caseFileEntities.duplicateLoading;
    },

    triageLevels(): {value: unknown, text: string}[] {
      const levels = helpers.enumToTranslatedCollection(CaseFileTriage, 'enums.Triage');
      return _sortBy(levels, 'value');
    },

    triageLoading(): boolean {
      return this.$store.state.caseFileEntities.triageLoading;
    },
  },
  watch: {
    locale() {
      this.setLastAction();
    },
  },

  async created() {
    try {
      this.loading = true;

      await this.$storage.caseFile.actions.fetch(this.caseFileId);

      this.setLastAction();
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
        const activity: ICaseFileActivity[] = await this.$storage.caseFile.actions.fetchCaseFileActivities(this.caseFileId);
        if (activity) {
          this.caseFileActivities = activity;
        }
      } catch {
        this.error = true;
      } finally {
        this.loadingActivity = false;
      }
    },

    getComponentName(): string {
      return 'CaseFileActivityListItem';
    },

    setLastAction() {
      if (this.caseFile.metadata.lastActionDate) {
        const date = moment(this.caseFile.metadata.lastActionDate).local();
        this.lastActionDate = date.format('ll');
        this.daysAgo = date.locale(moment.locale()).fromNow();
      }
    },

    async setCaseFileIsDuplicate() {
      const { id, isDuplicate } = this.caseFile.entity;
      await this.$storage.caseFile.actions.setCaseFileIsDuplicate(id, !isDuplicate);
      this.fetchCaseFileActivities(this.activityFetchDelay);
    },

    async setCaseFileTriage(triage: number) {
      await this.$storage.caseFile.actions.setCaseFileTriage(this.caseFileId, triage);
      this.fetchCaseFileActivities(this.activityFetchDelay);
    },

    async sortCaseFileActivities(direction: 'asc' | 'desc') {
      this.caseFileActivities = _orderBy(this.caseFileActivities, 'created', direction);
    },
  },
});
</script>

<style  lang='scss'>

  .case-file-activity-dropdown {
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
  }

  .case-file-activity-sort-select{
    margin-top: 2px;
    padding: 0 6px;
    max-width: fit-content;
    min-width: 80px;
    font-size: 12px;

      ::v-deep {

    .v-select__selections input {
      max-width: 25px;
      }

   }
  }

</style>
