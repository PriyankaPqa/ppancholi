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
      :hide-footer="true"
      @search="search">
      <template #headerLeft>
        <rc-add-button-with-menu
          :add-button-label="$t('assessmentTemplate.addNew')"
          :items="menuItems"
          @click-item="goToAdd($event)" />
      </template>
      <template #filter>
        <filter-toolbar
          :filter-key="FilterKey.Referrals"
          :count="itemsCount"
          :initial-filter="filterState"
          :filter-options="filters"
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

      <template #[`item.${customColumns.published}`]="{ item }">
        {{ item.published || '-' }}
      </template>

      <template #[`item.${customColumns.status}`]="{ item }">
        <status-chip status-name="Status" :status="item.entity.status" />
      </template>

      <template #[`item.${customColumns.edit}`]="{ item }">
        <v-btn icon :to="getAssessmentEditRoute(item.entity.id)" data-test="editAssessment-link">
          <v-icon>
            mdi-pencil
          </v-icon>
        </v-btn>
        <v-menu offset-y data-test="assessment__menu">
          <template #activator="{ on }">
            <v-btn icon data-test="menu-link" v-on="on">
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
import { IAzureSearchParams } from '@libs/core-lib/types';
import { FilterKey } from '@libs/entities-lib/user-account';
import { IAssessmentTemplateCombined, IAssessmentTemplateEntity } from '@libs/entities-lib/assessment-template';
import FilterToolbar from '@/ui/shared-components/FilterToolbar.vue';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import helpers from '@/ui/helpers/helpers';
import { Status } from '@libs/entities-lib/base';

export default mixins(TablePaginationSearchMixin).extend({
  name: 'AssessmentTemplatesHome',

  components: {
    RcDataTable,
    RcAddButtonWithMenu,
    FilterToolbar,
    StatusChip,
  },

  data() {
    return {
      FilterKey,
      options: {
        sortBy: [`Entity/Name/Translation/${this.$i18n.locale}`],
        sortDesc: [false],
      },
    };
  },

  computed: {
    customColumns(): Record<string, string> {
      return {
        name: `Entity/Name/Translation/${this.$i18n.locale}`,
        status: `Metadata/AssessmentTemplateStatusName/Translation/${this.$i18n.locale}`,
        published: 'published',
        edit: 'edit',
      };
    },

    headers(): Array<DataTableHeader> {
      return [
        {
          text: this.$t('common.name') as string,
          sortable: true,
          value: this.customColumns.name,
        },
        {
          text: this.$t('assessmentTemplate.published') as string,
          value: this.customColumns.published,
          width: '100px',
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
          width: '150px',
        },
      ];
    },

    labels(): Record<string, unknown> {
      return {
        header: {
          title: this.$t('assessmentTemplate.title'),
          searchPlaceholder: this.$t('common.inputs.quick_search'),
          addButtonLabel: this.$t('assessmentTemplate.addNew'),
        },
      };
    },

    filters(): Array<IFilterSettings> {
      return [
        {
          key: this.customColumns.name,
          type: EFilterType.Text,
          label: this.$t('common.name') as string,
        }, {
          key: this.customColumns.status,
          type: EFilterType.MultiSelect,
          label: this.$t('common.status') as string,
          items: helpers.enumToTranslatedCollection(Status, 'enums.Status', true),
        }];
    },

    tableProps(): Record<string, unknown> {
      return {
        itemClass: (item: IAssessmentTemplateCombined) => (item.pinned ? 'pinned' : ''),
      };
    },

    tableData(): IAssessmentTemplateCombined[] {
      return this.$storage.assessmentTemplate.getters.getByIds(this.searchResultIds,
        { prependPinnedItems: true, baseDate: this.searchExecutionDate });
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
    addAssessment() {
      this.$router.push({
        // name: routes.assessmentTemplates.add.name,
      });
    },

    getAssessmentDetailsRoute(id: string) {
      console.log(id);
      return {
        // name: routes.assessmentTemplates.details.name,
        // params: {
        //   referralId: id,
        // },
      };
    },

    getAssessmentEditRoute(id: string) {
      console.log(id);
      return {
        // name: routes.caseFile.referrals.edit.name,
        // params: {
        //   referralId: id,
        // },
      };
    },

    copySampleLink(item: IAssessmentTemplateEntity) {
      console.log('copy: ', item);
    },

    duplicateSurvey(item: IAssessmentTemplateEntity) {
      console.log('duplicateSurvey: ', item);
    },

    goToAdd(item: Record<string, string>) {
      console.log(item.value);
    },

    async fetchData(params: IAzureSearchParams) {
      const res = await this.$storage.assessmentTemplate.actions.search({
        search: params.search,
        filter: params.filter,
        top: params.top,
        skip: params.skip,
        orderBy: params.orderBy,
        count: true,
        queryType: 'full',
        searchMode: 'all',
      }, null, true);
      return res;
    },
  },
});
</script>
