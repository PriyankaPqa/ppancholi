<template>
  <rc-page-content
    :outer-scroll="true"
    :title="$t('caseFile.caseFileActivity')"
    :show-help="true"
    :help-link="$t('zendesk.help_link.caseFileActivity')">
    <template slot="top">
      <v-row class="no-gutters">
        <v-btn
          class="fw-bold"
          text
          small
          data-test="caseFile-add-tags-btn">
          <v-icon small>
            mdi-plus
          </v-icon>
          {{ $t('caseFile.tags.AddTag') }}
        </v-btn>
      </v-row>

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
            :disabled="!canMarkDuplicate">
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

    <template slot="default">
      <v-row class="ma-0 pa-0">
        <v-btn
          class="fw-bold"
          small
          data-test="caseFileActivity-add-label-btn">
          <v-icon small>
            mdi-plus
          </v-icon>
          {{ $t('caseFileActivity.labels.addLabel') }}
        </v-btn>
        <v-row />
      </v-row>
    </template>
  </rc-page-content>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcPageContent } from '@crctech/component-library';
import StatusSelect from '@/ui/shared-components/StatusSelect.vue';
import { ICaseFile, ECaseFileStatus } from '@/entities/case-file';

export default Vue.extend({
  name: 'CaseFileActivity',
  components: {
    RcPageContent,
    StatusSelect,
  },

  data() {
    return {
      ECaseFileStatus,
      error: false,
      newStatus: null,
      showEventStatusDialog: false,
      loading: false,
      statuses: [ECaseFileStatus.Archived, ECaseFileStatus.Open, ECaseFileStatus.Closed, ECaseFileStatus.Inactive],
    };
  },

  computed: {
    canMarkDuplicate(): boolean {
      return true;
    },

    caseFile(): ICaseFile {
      const { id } = this.$route.params;
      return this.$storage.caseFile.getters.caseFileById(id);
    },
  },

  async created() {
    try {
      const { id } = this.$route.params;
      if (id) {
        await this.$storage.caseFile.actions.fetchCaseFile(id);
      }
    } catch {
      this.error = true;
    }
  },

  methods: {

  },
});

</script>

<style scoped lang='scss'>
  .borderLeft {
     border-left: thin solid lightgrey;
  }
</style>
