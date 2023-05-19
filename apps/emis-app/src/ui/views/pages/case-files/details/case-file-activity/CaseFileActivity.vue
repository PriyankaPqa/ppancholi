<template>
  <rc-page-content
    content-padding="0"
    :outer-scroll="true"
    :title="$t('caseFile.caseFileActivity')"
    :show-help="false"
    :help-link="$t('zendesk.help_link.caseFileActivity')">
    <rc-page-loading v-if="loading" />
    <template v-if="!loading" slot="top">
      <case-file-tags
        data-test="caseFileActivity-tags"
        :readonly="!canEditTags"
        :case-file-id="caseFile.id"
        :tags="tags" />

      <v-row class="ma-0 pa-3 flex-row justify-space-between">
        <div class="flex-row">
          <case-file-status
            :case-file="caseFile"
            :event="event" />

          <v-divider vertical class="ml-4 mr-4" />

          <span class="pr-2 rc-body12">{{ $t('caseFileActivity.triage') }}:</span>
          <v-select
            :value="caseFile.triage"
            class="triage-select"
            data-test="caseFileActivity-triage-select"
            :readonly="!canEdit || saving"
            :menu-props="{
              bottom: true, offsetY: true, contentClass: 'case-file-triage-dropdown', maxWidth: 'fit-content',
            }"
            :items="triageLevels"
            :loading="loading"
            hide-details
            @change="setCaseFileTriage($event)">
            <template #item="{ item }">
              <div
                class="caseFileActivity-triage-select__item rc-body14"
                :data-test="`caseFileActivity-triage-select__item--${item.text}`">
                {{ item.text }}
              </div>
            </template>
          </v-select>

          <v-divider v-if="!$hasFeature(FeatureKeys.ManageDuplicates)" vertical class="ml-4 mr-4" />

          <rc-tooltip v-if="!$hasFeature(FeatureKeys.ManageDuplicates)" right>
            <template #activator="{ on }">
              <v-btn
                data-test="caseFileActivity-duplicateBtn"
                :class="{ 'no-pointer': !canEdit }"
                icon
                :loading="loading"
                :disabled="!canEdit || saving"
                v-on="on"
                @click="setCaseFileIsDuplicate">
                <v-icon :color="caseFile && caseFile.isDuplicate ? 'secondary' : ''">
                  $rctech-duplicate
                </v-icon>
              </v-btn>
            </template>
            {{ $t('caseFileActivity.duplicate') }}
          </rc-tooltip>
        </div>

        <case-file-assignments
          :case-file="caseFile"
          :readonly="readonly"
          data-test="case-file-assignments" />
      </v-row>
    </template>
    <template v-if="!loading" slot="default">
      <v-row class="ma-0 pa-0">
        <case-file-labels
          :case-file-id="caseFile.id"
          :case-file-labels="caseFile.labels || []"
          :readonly="!canEditLabels" />
      </v-row>

      <v-row class="ma-0 px-2 pt-0 no-gutters">
        <v-col cols="12">
          <case-file-list-wrapper :empty="caseFileActivities.length === 0" :loading="loadingActivity" class="pa-4">
            <v-row>
              <v-col cols="12" class="d-flex justify-end align-center rc-body14">
                <span> {{ $t('caseFileActivity.sortBy') }}: </span>
                <v-select
                  class="case-file-activity-sort-select"
                  :placeholder="$t('caseFileActivity.date')"
                  data-test="caseFileActivity-case-file-activity-sort-select"
                  :menu-props="{
                    bottom: true, offsetY: true, contentClass: 'case-file-activity-dropdown', maxWidth: 'fit-content',
                  }"
                  :items="sortingListItems"
                  :min-width="500"
                  hide-details
                  @change="sortCaseFileActivities($event)" />
              </v-col>
            </v-row>

            <component
              :is="getComponentName()"
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
import { RcPageContent, RcPageLoading, RcTooltip } from '@libs/component-lib/components';
import { CaseFileTriage, ICaseFileActivity } from '@libs/entities-lib/case-file';
import moment from '@libs/shared-lib/plugins/moment';
import helpers from '@/ui/helpers/helpers';
import { IIdMultilingualName } from '@libs/shared-lib/types';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';
import entityUtils from '@libs/entities-lib/utils';
import { UserRoles } from '@libs/entities-lib/user';
import { useCaseFileStore } from '@/pinia/case-file/case-file';
import _debounce from 'lodash/debounce';
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
  props: {
    /*
    Case file Id
     */
    id: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      moment,
      FeatureKeys,
      showLabelsDialog: false,
      loading: false,
      saving: false,
      loadingActivity: false,
      caseFileActivities: [] as ICaseFileActivity[],
      sortingListItems: [
        {
          value: 'asc', text: this.$t('caseFileActivity.ascending'),
        },
        {
          value: 'desc', text: this.$t('caseFileActivity.descending'),
        },
      ],
    };
  },
  computed: {
    canEdit(): boolean {
      return this.$hasLevel(UserRoles.level1) && !this.readonly;
    },

    canEditTags(): boolean {
      return this.$hasFeature(FeatureKeys.LimitTagDeletionL2Plus_5959) ? (this.$hasLevel(UserRoles.level2) && !this.readonly) : this.canEdit;
    },

    canEditLabels(): boolean {
      return  this.$hasLevel(UserRoles.level0) && !this.readonly;
    },

    triageLevels(): { value: unknown, text: string }[] {
      const levels = helpers.enumToTranslatedCollection(CaseFileTriage, 'enums.Triage');
      return _sortBy(levels, 'value');
    },

    tags(): IIdMultilingualName[] {
      const existingIds = this.caseFile.tags.map((t) => t.optionItemId);
      const tags = useCaseFileStore().getTagsOptions(false);
      return existingIds.map((id) => {
        const name = tags.find((t) => t.id === id)?.name || entityUtils.initMultilingualAttributes();
        return { id, name };
      });
    },
  },

  async created() {
    try {
      this.loading = true;

      await Promise.all([
        useCaseFileStore().fetchTagsOptions(),
        useCaseFileStore().fetch(this.caseFileId),
        this.fetchCaseFileActivities(),
      ]);

      this.attachToChanges(true);
    } finally {
      this.loading = false;
    }
  },

  destroyed() {
    this.attachToChanges(false);
  },

  methods: {
    getComponentName(): string {
      return 'CaseFileActivityListItem';
    },

    async setCaseFileIsDuplicate() {
      const { id, isDuplicate } = this.caseFile;
      this.saving = true;
      await useCaseFileStore().setCaseFileIsDuplicate(id, !isDuplicate);
      this.saving = false;
    },

    async setCaseFileTriage(triage: number) {
      this.saving = true;
      await useCaseFileStore().setCaseFileTriage(this.caseFileId, triage);
      this.saving = false;
    },

    async sortCaseFileActivities(direction: 'asc' | 'desc') {
      this.caseFileActivities = _orderBy(this.caseFileActivities, 'created', direction);
    },

    async fetchCaseFileActivities() {
      try {
        this.loadingActivity = true;
        const activities: ICaseFileActivity[] = await useCaseFileStore().fetchCaseFileActivities(this.id);
        if (activities) {
          this.caseFileActivities = activities;
        }
      } finally {
        this.loadingActivity = false;
      }
    },

    attachToChanges(on: boolean) {
      if (this.$signalR.connection) {
        if (on) {
          this.$signalR.connection.on('case-file.CaseFileActivityCreated', this.activityChanged);
          this.$signalR.connection.on('case-file.CaseFileActivityUpdated', this.activityChanged);
        } else {
          this.$signalR.connection.off('case-file.CaseFileActivityCreated', this.activityChanged);
          this.$signalR.connection.off('case-file.CaseFileActivityUpdated', this.activityChanged);
        }
      }
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    activityChanged: _debounce(function func(this:any, item: ICaseFileActivity) {
      if (this.id === item?.caseFileId || this.id === item?.id) {
        this.fetchCaseFileActivities();
      }
    }, 1000),
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
