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
        @updateActivities="fetchCaseFileActivities(800)" />

      <v-row class="ma-0 pa-0">
        <v-col cols="12" md="6" class="flex-row">
          <status-select
            data-test="event-detail-status-select"
            :value="caseFile.caseFileStatus"
            :statuses="statuses"
            status-name="ECaseFileStatus"
            :disabled="true" />

          <v-divider
            vertical
            class="ml-4 mr-4" />

          <v-btn
            data-test="caseFileActivity-duplicateBtn"
            :class="{'no-pointer': !canMarkDuplicate}"
            icon
            :loading="duplicateLoading"
            :disabled="!canMarkDuplicate"
            @click="setCaseFileIsDuplicate">
            <v-icon :color="caseFile && caseFile.isDuplicate ? 'secondary' : ''">
              $rctech-duplicate
            </v-icon>
          </v-btn>
        </v-col>

        <v-col cols="12" md="6" class="flex-row justify-end">
          <div class="d-flex align-center rc-body12 mr-4" data-test="case-file-assigned-info">
            <!-- <v-icon class="mr-1" color="status_warning">
              mdi-alert
            </v-icon> -->
            {{ $t('caseFileDetail.notAssigned') }}
          </div>

          <v-btn
            color="primary"
            small
            data-test="case-file-assign-btn">
            <v-icon left>
              mdi-plus
            </v-icon>
            {{ $t('caseFileDetail.assignTo') }}
          </v-btn>
        </v-col>
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
import { RcPageContent, RcPageLoading } from '@crctech/component-library';
import StatusSelect from '@/ui/shared-components/StatusSelect.vue';
import { ICaseFile, ECaseFileStatus, ICaseFileActivity } from '@/entities/case-file';
import moment from '@/ui/plugins/moment';
import CaseFileTags from './components/CaseFileTags.vue';
import CaseFileLabels from './components/CaseFileLabels.vue';
import CaseFileListWrapper from '../components/CaseFileListWrapper.vue';
import CaseFileActivityListItem from './components/CaseFileActivityListItem.vue';

export default Vue.extend({
  name: 'CaseFileActivity',
  components: {
    RcPageLoading,
    RcPageContent,
    StatusSelect,
    CaseFileTags,
    CaseFileListWrapper,
    CaseFileLabels,
    CaseFileActivityListItem,
  },

  data() {
    return {
      moment,
      ECaseFileStatus,
      error: false,
      newStatus: null,
      showEventStatusDialog: false,
      showLabelsDialog: false,
      loading: false,
      loadingActivity: false,
      statuses: [ECaseFileStatus.Archived, ECaseFileStatus.Open, ECaseFileStatus.Closed, ECaseFileStatus.Inactive],
      lastActionAgo: null,
      caseFileActivities: [] as ICaseFileActivity[],
    };
  },

  computed: {
    id() {
      return this.$route.params.id;
    },

    canMarkDuplicate(): boolean {
      return this.$hasLevel('level1');
    },

    duplicateLoading(): boolean {
      return this.$store.state.caseFile.duplicateLoading;
    },

    caseFile(): ICaseFile {
      return this.$storage.caseFile.getters.caseFileById(this.id);
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

    setLastAction() {
      this.lastActionAgo = moment.utc(this.caseFile.timestamp).local().locale(moment.locale()).fromNow();
    },

    async setCaseFileIsDuplicate() {
      const { id, isDuplicate } = this.caseFile;
      await this.$storage.caseFile.actions.setCaseFileIsDuplicate(id, !isDuplicate);
    },
  },
});

</script>

<style scoped lang='scss'>
  .borderLeft {
     border-left: thin solid lightgrey;
  }

      .caseFileActivity__lastAction {
        display: flex;
        justify-content: flex-end;
        margin-top: 16px;
    }

</style>
