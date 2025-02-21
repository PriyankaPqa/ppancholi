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
          @update:appliedFilter="onApplyFilter" />
      </template>
      <template #[`item.${customColumns.name}`]="{ item }">
        <router-link
          class="rc-link14 font-weight-bold pr-1"
          :data-test="`assessmentDetail-link-${item.id}`"
          :to="getAssessmentDetailsRoute(item.id)">
          {{ $m(item.name) }}
        </router-link>
      </template>

      <template #[`item.${customColumns.program}`]="{ item }">
        {{ getProgramName(item) }}
      </template>

      <template #[`item.${customColumns.published}`]="{ item }">
        <div class="publish">
          {{ $t(`enums.assessmentPublishStatus.${PublishStatus[item.publishStatus]}`) }}
        </div>
      </template>

      <template #[`item.${customColumns.status}`]="{ item }">
        <status-chip status-name="Status" :status="item.status" />
      </template>

      <template #[`item.${customColumns.edit}`]="{ item }">
        <v-menu offset-y left :attach="true" data-test="assessment__editmenu">
          <template #activator="{ on, attrs }">
            <v-btn data-test="menu-edit-btn" color="primary" small v-on="on">
              {{ $t('common.edit') }}
              <v-icon>
                {{ attrs['aria-expanded'] == 'true' ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
              </v-icon>
            </v-btn>
          </template>

          <v-list>
            <v-list-item @click="getAssessmentEditRoute(item.id)">
              {{ $t('assessmentTemplate.editAssessment') }}
            </v-list-item>

            <v-list-item @click="editorMode(item.id)">
              {{ $t('assessmentTemplate.gotoEditor') }}
            </v-list-item>
          </v-list>
        </v-menu>

        <v-menu offset-y left :attach="true" data-test="assessment__menu">
          <template #activator="{ on }">
            <v-btn icon data-test="menu-link" :aria-label="$t('task.action')" class="ml-4" v-on="on">
              <v-icon>
                mdi-dots-vertical
              </v-icon>
            </v-btn>
          </template>

          <v-list>
            <v-list-item @click="copySampleLink(item)">
              {{ $t('assessmentTemplate.copySampleLink') }}
            </v-list-item>

            <v-list-item @click="duplicateSurvey(item)">
              {{ $t('assessmentTemplate.duplicateSurvey') }}
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
    </rc-data-table>

    <copy-assessment
      v-if="showCopyAssessmentDialog"
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
import { EFilterKeyType, EFilterType, IFilterSettings } from '@libs/component-lib/types';
import mixins from 'vue-typed-mixins';
import TablePaginationSearchMixin from '@/ui/mixins/tablePaginationSearch';
import { ISearchParams, Status } from '@libs/shared-lib/types';
import { FilterKey } from '@libs/entities-lib/user-account';
import {
  IAssessmentBaseEntity,
  IAssessmentFormEntity,
  IAssessmentTemplateEntity,
  PublishStatus,
} from '@libs/entities-lib/assessment-template';
import FilterToolbar from '@/ui/shared-components/FilterToolbar.vue';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import helpers from '@/ui/helpers/helpers';
import _sortBy from 'lodash/sortBy';
import routes from '@/constants/routes';
import { useAssessmentFormStore } from '@/pinia/assessment-form/assessment-form';
import { useAssessmentTemplateStore } from '@/pinia/assessment-template/assessment-template';
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
      programsLoading: false,
      programs: [] as { text: string, value: string }[],
      PublishStatus,
      showCopyAssessmentDialog: false,
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
        program: `Metadata/Program/Translation/${this.$i18n.locale}`,
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
          align: 'center',
          value: this.customColumns.status,
          width: '100px',
          sortable: true,
        },
        {
          text: this.$t('common.edit') as string,
          align: 'end',
          class: 'rc-transparent-text',
          sortable: false,
          value: this.customColumns.edit,
          width: '200px',
        },
      ] as Array<DataTableHeader>;

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
            keyType: EFilterKeyType.Guid,
            type: EFilterType.Select,
            label: this.$t('assessmentTemplate.program') as string,
            items: this.programs,
            loading: this.programsLoading,
            disabled: this.programsLoading,
          },
        );
      }

      return filters;
    },

    tableProps(): Record<string, unknown> {
      return {
        loading: useAssessmentTemplateStore().searchLoading,
        itemClass: (item: IAssessmentBaseEntity) => (item.pinned ? 'pinned' : ''),
      };
    },

    tableData(): IAssessmentBaseEntity[] {
      if (this.isFormMode) {
        return useAssessmentFormStore().getByIdsWithPinnedItems(
          this.searchResultIds,
          { baseDate: this.searchExecutionDate, parentId: { eventId: this.id } },
        );
      }

      return useAssessmentTemplateStore().getByIdsWithPinnedItems(
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
    await this.fetchPrograms();
  },

  methods: {
    getProgramName(item: IAssessmentFormEntity) {
      return this.programs.find((x) => x.value === item.programId)?.text || '';
    },

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

    async fetchData(params: ISearchParams) {
      const filters = this.isFormMode ? { ...params.filter as Record<string, unknown>, 'Entity/EventId': { value: this.id, type: EFilterKeyType.Guid } } : params.filter;
      const res = await (this.isFormMode ? useAssessmentFormStore() : useAssessmentTemplateStore()).search({ params: {
        filter: filters,
        top: params.top,
        skip: params.skip,
        orderBy: params.orderBy,
        count: true,
      },
      includeInactiveItems: true });
      return res;
    },

    async fetchPrograms() {
      if (!this.isFormMode) {
        return;
      }
      this.programsLoading = true;

      const res = (await useProgramStore().fetchAllIncludingInactive({ eventId: this.id })).map((e) => e.id);
      this.programsLoading = false;
      if (res?.length) {
        this.programs = _sortBy(useProgramStore().getByIds(res).map((e) => ({
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
