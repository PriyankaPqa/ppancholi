<template>
  <div class="pa-4">
    <rc-data-table
      :items="tableData"
      :count="itemsCount"
      :table-props="tableProps"
      :labels="labels"
      :headers="headers"
      :footer-text="footerText"
      :options.sync="options"
      :initial-search="params && params.search"
      :custom-columns="Object.values(customColumns)"
      :show-add-button="!isFormMode"
      :add-button-label="$t('assessmentTemplate.addNew')"
      @add-button="goToAdd($event)"
      @search="search">
      <template v-if="isFormMode" #headerLeft>
        <rc-add-button-with-menu
          :add-button-label="$t('assessmentTemplate.addNew')"
          :items="menuItems"
          @click-item="goToAdd($event)" />
      </template>
      <template #filter>
        <filter-toolbar
          :filter-key="isFormMode ? FilterKey.AssessmentForms : FilterKey.AssessmentTemplates"
          :count="itemsCount"
          :initial-filter="filterState"
          :filter-options="filters"
          @open="fetchProgramsFilter()"
          @update:appliedFilter="onApplyFilter" />
      </template>
      <template #[`item.${customColumns.name}`]="{ item }">
        <router-link
          class="rc-link14 font-weight-bold pr-1"
          data-test="assessmentDetail-link"
          :to="getAssessmentDetailsRoute(item.entity.id)">
          {{ $m(item.entity.name) }}
        </router-link>
      </template>

      <template #[`item.${customColumns.program}`]="{ item }">
        {{ item.metadata ? $m(item.metadata.programName) : '' }}
      </template>

      <template #[`item.${customColumns.published}`]="{ item }">
        <div class="publish">
          {{ $t(`enums.assessmentPublishStatus.${PublishStatus[item.entity.publishStatus]}`) }}
        </div>
      </template>

      <template #[`item.${customColumns.status}`]="{ item }">
        <status-chip status-name="Status" :status="item.entity.status" />
      </template>

      <template #[`item.${customColumns.edit}`]="{ item }">
        <v-menu offset-y data-test="assessment__editmenu">
          <template #activator="{ on, attrs }">
            <v-btn data-test="menu-edit-btn" color="primary" small v-on="on">
              {{ $t('common.edit') }}
              <v-icon>
                {{ attrs['aria-expanded'] == 'true' ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
              </v-icon>
            </v-btn>
          </template>

          <v-list>
            <v-list-item @click="getAssessmentEditRoute(item.entity.id)">
              {{ $t('assessmentTemplate.editAssessment') }}
            </v-list-item>

            <v-list-item @click="editorMode(item.entity.id)">
              {{ $t('assessmentTemplate.gotoEditor') }}
            </v-list-item>
          </v-list>
        </v-menu>

        <v-menu offset-y data-test="assessment__menu">
          <template #activator="{ on }">
            <v-btn icon data-test="menu-link" class="ml-4" v-on="on">
              <v-icon>
                mdi-dots-vertical
              </v-icon>
            </v-btn>
          </template>

          <v-list>
            <v-list-item @click="copySampleLink(item.entity)">
              {{ $t('assessmentTemplate.copySampleLink') }}
            </v-list-item>

            <v-list-item @click="duplicateSurvey(item.entity)">
              {{ $t('assessmentTemplate.duplicateSurvey') }}
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
    </rc-data-table>

    <copy-assessment
      data-test="add-team-members"
      :show.sync="showCopyAssessmentDialog"
      @selected="duplicateSurvey" />
  </div>
</template>

<script lang="ts">
/* eslint-disable no-console */
import { DataTableHeader } from 'vuetify';
import {
  RcDataTable, RcAddButtonWithMenu,
} from '@libs/component-lib/components';
import { EFilterType, IFilterSettings } from '@libs/component-lib/types/FilterTypes';
import mixins from 'vue-typed-mixins';
import TablePaginationSearchMixin from '@/ui/mixins/tablePaginationSearch';
import { IAzureSearchParams } from '@libs/shared-lib/types';
import { FilterKey } from '@libs/entities-lib/user-account';
import {
 IAssessmentBaseCombined,
  IAssessmentFormEntity,
  IAssessmentFormMetadata,
  IAssessmentTemplateEntity,
  IAssessmentTemplateMetadata,
  PublishStatus,
  IdParams,
} from '@libs/entities-lib/assessment-template';
import FilterToolbar from '@/ui/shared-components/FilterToolbar.vue';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import helpers from '@/ui/helpers/helpers';
import { Status } from '@libs/entities-lib/base';
import _sortBy from 'lodash/sortBy';
import routes from '@/constants/routes';
import { CombinedStoreFactory } from '@libs/stores-lib/base/combinedStoreFactory';
import { useAssessmentFormStore, useAssessmentFormMetadataStore } from '@/pinia/assessment-form/assessment-form';
import { useAssessmentTemplateStore, useAssessmentTemplateMetadataStore } from '@/pinia/assessment-template/assessment-template';
import { useProgramStore } from '@/pinia/program/program';
import { IAssessmentBaseRoute } from '../IAssessmentBaseRoute.type';
import CopyAssessment from './CopyAssessment.vue';

export default mixins(TablePaginationSearchMixin).extend({
  name: 'AssessmentTemplatesHome',

  components: {
    RcDataTable,
    RcAddButtonWithMenu,
    FilterToolbar,
    StatusChip,
    CopyAssessment,
  },

  props: {
    /**
     * The id of the event if within an event
     */
    id: {
      type: String,
      default: null,
    },
  },

  data() {
    return {
      FilterKey,
      options: {
        sortBy: [`Entity/Name/Translation/${this.$i18n.locale}`],
        sortDesc: [false],
      },
      programsFilterLoading: false,
      programsFilter: [],
      PublishStatus,
      showCopyAssessmentDialog: false,
      combinedFormStore: new CombinedStoreFactory<IAssessmentFormEntity, IAssessmentFormMetadata, IdParams>(useAssessmentFormStore(), useAssessmentFormMetadataStore()),
      combinedTemplateStore: new CombinedStoreFactory<IAssessmentTemplateEntity, IAssessmentTemplateMetadata, IdParams>(
        useAssessmentTemplateStore(),
        useAssessmentTemplateMetadataStore(),
      ),
    };
  },

  computed: {
    isFormMode() : boolean {
      return !!this.id;
    },

    baseRoute() : IAssessmentBaseRoute {
      return this.isFormMode ? routes.events.assessments : routes.assessmentTemplates;
    },

    customColumns(): Record<string, string> {
      return {
        name: `Entity/Name/Translation/${this.$i18n.locale}`,
        status: `Metadata/Assessment${this.isFormMode ? 'Form' : 'Template'}StatusName/Translation/${this.$i18n.locale}`,
        published: 'Entity/PublishStatus',
        edit: 'edit',
        program: `Metadata/ProgramName/Translation/${this.$i18n.locale}`,
        submissions: 'Metadata/TotalSubmissions',
      };
    },

    headers(): Array<DataTableHeader> {
      const columns = [
        {
          text: this.$t('common.name') as string,
          sortable: true,
          width: this.isFormMode ? '50%' : undefined,
          value: this.customColumns.name,
        },
        {
          text: this.$t('assessmentTemplate.published') as string,
          value: this.customColumns.published,
          width: '150px',
          sortable: false,
        },
        {
          text: this.$t('common.status') as string,
          value: this.customColumns.status,
          width: '100px',
          sortable: true,
        },
        {
          text: '',
          sortable: false,
          value: this.customColumns.edit,
          width: '200px',
        },
      ];

      if (this.isFormMode) {
        columns.splice(0, 0, {
          text: this.$t('assessmentTemplate.program') as string,
          value: this.customColumns.program,
          width: '30%',
          sortable: true,
        });
      }

      return columns;
    },

    labels(): Record<string, unknown> {
      return {
        header: {
          title: this.isFormMode ? this.$t('assessments.title') : this.$t('assessmentTemplate.title'),
          searchPlaceholder: this.$t('common.inputs.quick_search'),
          addButtonLabel: this.$t('assessmentTemplate.addNew'),
        },
      };
    },

    filters(): Array<IFilterSettings> {
      const filters = [
        {
          key: this.customColumns.name,
          type: EFilterType.Text,
          label: this.$t('common.name') as string,
        }, {
          key: this.customColumns.status,
          type: EFilterType.MultiSelect,
          label: this.$t('common.status') as string,
          items: helpers.enumToTranslatedCollection(Status, 'enums.Status', true),
        }] as Array<IFilterSettings>;

      if (this.isFormMode) {
        filters.push(
          {
            key: 'Entity/ProgramId',
            type: EFilterType.Select,
            label: this.$t('assessmentTemplate.program') as string,
            items: this.programsFilter,
            loading: this.programsFilterLoading,
            disabled: this.programsFilterLoading,
          },
        );
      }

      return filters;
    },

    tableProps(): Record<string, unknown> {
      return {
        itemClass: (item: IAssessmentBaseCombined) => (item.pinned ? 'pinned' : ''),
      };
    },

    tableData(): IAssessmentBaseCombined[] {
      if (this.isFormMode) {
        return this.combinedFormStore.getByIds(
          this.searchResultIds,
          { prependPinnedItems: true, baseDate: this.searchExecutionDate, parentId: { eventId: this.id } },
        );
      }

      return this.combinedTemplateStore.getByIds(
        this.searchResultIds,
        { prependPinnedItems: true, baseDate: this.searchExecutionDate },
      );
    },

    menuItems(): Array<Record<string, string>> {
      return [{
        text: this.$t('assessmentTemplate.addNew') as string,
        value: 'CreateNew',
        icon: 'mdi-file',
      }, {
        text: this.$t('assessmentTemplate.copy') as string,
        value: 'Copy',
        icon: 'mdi-file-multiple',
      }];
    },
  },

  async created() {
    this.saveState = true;
    this.loadState();
  },

  methods: {
    getAssessmentDetailsRoute(id: string) {
      return {
        name: this.baseRoute.details.name,
        params: {
          assessmentTemplateId: id,
        },
      };
    },

    getAssessmentEditRoute(id: string) {
      this.$router.push({
        name: this.baseRoute.edit.name,
        params: {
          assessmentTemplateId: id,
        },
      });
    },

    editorMode(id: string) {
      const routeData = this.$router.resolve({
        name: this.baseRoute.builder.name,
        params: {
          assessmentTemplateId: id,
          id: this.id,
        },
      });
      window.open(routeData.href, '_blank');
    },

    copySampleLink(item: IAssessmentTemplateEntity) {
      const routeData = this.$router.resolve({
        name: this.baseRoute.runner.name,
        params: {
          assessmentTemplateId: item.id,
          id: this.id,
        },
      });
      navigator.clipboard.writeText(`${window.location.origin}${routeData.href}`);
      this.$toasted.global.success(this.$t('assessmentTemplate.copiedLink'));
    },

    duplicateSurvey(item: IAssessmentTemplateEntity) {
      this.$router.push({
        name: this.baseRoute.duplicate.name,
        params: {
          cloneId: item.id,
          id: this.id,
        },
      });
    },

    goToAdd(item: Record<string, string>) {
      if (item?.value !== 'Copy') {
        this.$router.push({
          name: this.baseRoute.create.name,
        });
      } else {
        this.showCopyAssessmentDialog = true;
      }
    },

    async fetchData(params: IAzureSearchParams) {
      const filters = this.isFormMode ? { ...params.filter as Record<string, unknown>, 'Entity/EventId': this.id } : params.filter;
      const res = await (this.isFormMode ? this.combinedFormStore : this.combinedTemplateStore).search({
        search: params.search,
        filter: filters,
        top: params.top,
        skip: params.skip,
        orderBy: params.orderBy,
        count: true,
        queryType: 'full',
        searchMode: 'all',
      }, null, true);
      return res;
    },

    async fetchProgramsFilter() {
      if (!this.isFormMode) {
        return;
      }
      this.programsFilterLoading = true;

      const res = (await useProgramStore().fetchAllIncludingInactive({ eventId: this.id })).map((e) => e.id);
      this.programsFilterLoading = false;
      if (res?.length) {
        this.programsFilter = _sortBy(useProgramStore().getByIds(res).map((e) => ({
          text: this.$m(e.name),
          value: e.id,
        })), (p) => p.text);
      }
    },
  },
});
</script>

<style scoped>
 .publish {
   text-transform: uppercase;
   font-weight: bold;
 }
</style>
