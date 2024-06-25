<template>
  <rc-dialog
    :title="$t('massAction.financialAssistance.table.add.list')"
    :show.sync="show"
    :cancel-action-label="$t('common.buttons.cancel')"
    :submit-action-label="$t('common.buttons.next')"
    :submit-button-disabled="!filtersOn || tableData.length === 0"
    :loading="fetchAllCaseFileLoading"
    :persistent="true"
    fullscreen
    content-padding="0"
    @cancel="onCancel()"
    @close="onClose()"
    @submit="onSubmit()">
    <rc-data-table
      class="massAction__caseFile_table"
      hide-header
      :hide-footer="itemsCount === 0"
      :items="tableData"
      :count="itemsCount"
      :table-props="tableProps"
      :headers="headers"
      :custom-columns="Object.values(customColumns)"
      :options.sync="options"
      data-test="massAction_caseFile_table"
      @search="search">
      <template #filter>
        <filter-toolbar
          :filter-key="FilterKey.MassActionFinancialAssistance"
          :count="itemsCount"
          :filter-options="filters"
          @update:appliedFilter="onApplyCaseFileFilter"
          @update:autocomplete="onAutoCompleteUpdate($event)"
          @change:autocomplete="onAutoCompleteChange($event)"
          @load:filter="throttleOnLoadFilter($event)">
          <template #toolbarActions>
            <v-btn
              data-test="export"
              class="export"
              color="primary"
              :loading="exportLoading"
              :disabled="(!filtersOn || tableData.length === 0)"
              @click="onExport(MassActionType.FinancialAssistance)">
              {{ $t('massAction.common.export') }}
            </v-btn>
          </template>
        </filter-toolbar>
      </template>

      <template #no-data>
        <div v-if="!filtersOn" class="no-data">
          <i18n path="massAction.use.filter" tag="div" for="edit">
            <v-icon>
              mdi-filter-variant
            </v-icon>
          </i18n>
        </div>
      </template>

      <template #[`item.${customColumns.caseFileNumber}`]="{ item: caseFile }">
        {{ caseFile.entity.caseFileNumber }}
      </template>

      <template #[`item.${customColumns.firstName}`]="{ item: caseFile }">
        {{ caseFile.metadata.primaryBeneficiary
          && caseFile.metadata.primaryBeneficiary.identitySet && caseFile.metadata.primaryBeneficiary.identitySet.firstName }}
      </template>

      <template #[`item.${customColumns.lastName}`]="{ item: caseFile }">
        {{ caseFile.metadata.primaryBeneficiary
          && caseFile.metadata.primaryBeneficiary.identitySet && caseFile.metadata.primaryBeneficiary.identitySet.lastName }}
      </template>

      <template #[`item.${customColumns.street}`]="{ item: caseFile }">
        {{ caseFile.metadata.household && caseFile.metadata.household.streetAddress || '-' }}
      </template>

      <template #[`item.${customColumns.city}`]="{ item: caseFile }">
        {{ caseFile.metadata.household && caseFile.metadata.household.city || '-' }}
      </template>

      <template #[`item.${customColumns.province}`]="{ item: caseFile }">
        {{ caseFile.metadata.household
          && $m(caseFile.metadata.household.provinceCode)
          || '-'
        }}
      </template>

      <template #[`item.${customColumns.postalCode}`]="{ item: caseFile }">
        {{ caseFile.metadata.household && caseFile.metadata.household.postalCode
          || '-'
        }}
      </template>

      <template #[`item.${customColumns.email}`]="{ item: caseFile }">
        {{ caseFile.metadata.primaryBeneficiary
          && caseFile.metadata.primaryBeneficiary.contactInformation && caseFile.metadata.primaryBeneficiary.contactInformation.email || '-' }}
      </template>

      <template #[`item.${customColumns.authenticationStatus}`]="{ item: caseFile }">
        <span>
          {{ $m(caseFile.metadata.identityAuthenticationStatusName) }}
        </span>
      </template>

      <template #[`item.${customColumns.validationOfImpact}`]="{ item: caseFile }">
        <span>
          {{ $m(caseFile.metadata.impactStatusValidationName) }}
        </span>
      </template>

      <template #[`item.${customColumns.isDuplicate}`]="{ item: caseFile }">
        {{ getIsDuplicateText(caseFile) }}
      </template>
    </rc-data-table>
  </rc-dialog>
</template>

<script lang="ts">

import { RcDataTable, RcDialog } from '@libs/component-lib/components';
import { DataTableHeader } from 'vuetify';
import mixins from 'vue-typed-mixins';
import {
  EDateMode, EFilterKeyType, EFilterType, IFilterSettings,
} from '@libs/component-lib/types';
import FilterToolbar from '@/ui/shared-components/FilterToolbar.vue';
import { TranslateResult } from 'vue-i18n';
import { ECanadaProvinces } from '@libs/shared-lib/types';
import { FilterKey } from '@libs/entities-lib/user-account';
import { CaseFileStatus, ICaseFileCombined, IdentityAuthenticationStatus, ValidationOfImpactStatus } from '@libs/entities-lib/case-file';
import routes from '@/constants/routes';
import { MassActionMode, MassActionType } from '@libs/entities-lib/mass-action';
import helpers from '@/ui/helpers/helpers';
import { IProgramEntity } from '@libs/entities-lib/program';
import massActionCaseFileFiltering from '@/ui/views/pages/mass-actions/mixins/massActionCaseFileFiltering';

export default mixins(massActionCaseFileFiltering).extend({
  name: 'FinancialAssistanceCaseFileFiltering',

  components: {
    RcDialog,
    RcDataTable,
    FilterToolbar,
  },

  data() {
    return {
      programsFilterLoading: false,
      programsFilter: [],
      FilterKey,
      ValidationOfImpactStatus,
      IdentityAuthenticationStatus,
      MassActionType,
    };
  },

  computed: {
    customColumns(): Record<string, string> {
      return {
        caseFileNumber: 'Entity/CaseFileNumber',
        firstName: 'Metadata/PrimaryBeneficiary/IdentitySet/FirstName',
        lastName: 'Metadata/PrimaryBeneficiary/IdentitySet/LastName',
        street: 'Metadata/Household/StreetAddress',
        city: 'Metadata/Household/City',
        province: `Metadata/Household/ProvinceCode/Translation/${this.$i18n.locale}`,
        postalCode: 'Metadata/Household/PostalCode',
        email: 'Metadata/PrimaryBeneficiary/ContactInformation/Email',
        authenticationStatus: `Metadata/IdentityAuthenticationStatusName/Translation/${this.$i18n.locale}`,
        validationOfImpact: `Metadata/ImpactStatusValidationName/Translation/${this.$i18n.locale}`,
        isDuplicate: 'Metadata/HasPotentialDuplicates',
      };
    },

    headers(): Array<DataTableHeader> {
      return [
        {
          text: this.$t('massActions.financialAssistance.table.header.caseFileNumber') as string,
          align: 'start',
          sortable: true,
          value: this.customColumns.caseFileNumber,
        },
        {
          text: this.$t('massActions.financialAssistance.table.header.firstName') as string,
          value: this.customColumns.firstName,
          sortable: true,
        },
        {
          text: this.$t('massActions.financialAssistance.table.header.lastName') as string,
          value: this.customColumns.lastName,
          sortable: true,
        },
        {
          text: this.$t('massActions.financialAssistance.table.header.street') as string,
          value: this.customColumns.street,
          sortable: true,
        },
        {
          text: this.$t('massActions.financialAssistance.table.header.city') as string,
          value: this.customColumns.city,
          sortable: true,
        },
        {
          text: this.$t('massActions.financialAssistance.table.header.province') as string,
          value: this.customColumns.province,
          sortable: true,
        },
        {
          text: this.$t('massActions.financialAssistance.table.header.postalCode') as string,
          value: this.customColumns.postalCode,
          sortable: true,
        },
        {
          text: this.$t('massActions.financialAssistance.table.header.email') as string,
          value: this.customColumns.email,
          sortable: true,
        },
        {
          text: this.$t('massActions.financialAssistance.table.header.authenticationStatus') as string,
          value: this.customColumns.authenticationStatus,
          sortable: true,
        },
        {
          text: this.$t('massActions.financialAssistance.table.header.validationOfImpact') as string,
          value: this.customColumns.validationOfImpact,
          sortable: true,
        },
        {
          text: this.$t('massActions.financialAssistance.table.header.isDuplicate') as string,
          value: this.customColumns.isDuplicate,
          sortable: false,
        },
      ];
    },

    filters(): Array<IFilterSettings> {
      return [
        {
          key: 'Entity/EventId',
          keyType: EFilterKeyType.Guid,
          type: EFilterType.Select,
          label: this.$t('caseFileTable.filters.eventName') as string,
          items: this.sortedEventsFilter,
          loading: this.eventsFilterLoading,
          disabled: this.eventsFilterDisabled,
          props: {
            'no-data-text': !this.eventFilterQuery ? this.$t('common.inputs.start_typing_to_search') : this.$t('common.search.no_result'),
            'search-input': this.eventFilterQuery,
            'no-filter': true,
            'return-object': true,
          },
        },
        {
          key: 'Metadata/AppliedProgramIds',
          keyType: EFilterKeyType.Array,
          type: EFilterType.MultiSelectExclude,
          label: this.$t('massActions.financialAssistance.filter.programs.label') as string,
          items: this.programsFilter,
          loading: this.programsFilterLoading,
          disabled: this.programsFilter.length === 0,
        },
        {
          key: `Metadata/CaseFileStatusName/Translation/${this.$i18n.locale}`,
          type: EFilterType.MultiSelect,
          label: this.$t('caseFileTable.tableHeaders.status') as string,
          items: helpers.enumToTranslatedCollection(CaseFileStatus, 'enums.CaseFileStatus', true),
        },
        {
          key: this.customColumns.authenticationStatus,
          type: EFilterType.MultiSelect,
          label: this.$t('massActions.financialAssistance.table.header.authenticationStatus') as string,
          items: helpers.enumToTranslatedCollection(IdentityAuthenticationStatus, 'enums.IdentityAuthenticationStatus', true),
        },
        {
          key: this.customColumns.validationOfImpact,
          type: EFilterType.MultiSelect,
          label: this.$t('massActions.financialAssistance.table.header.validationOfImpact') as string,
          items: helpers.enumToTranslatedCollection(ValidationOfImpactStatus, 'enums.ValidationOfImpactStatus', true),
        },
        {
          key: 'Metadata/PrimaryBeneficiary/IdentitySet/DateOfBirth',
          type: EFilterType.Date,
          dateMode: EDateMode.Static,
          label: this.$t('common.birthdate.label') as string,
        },
        {
          key: this.customColumns.province,
          type: EFilterType.MultiSelect,
          label: this.$t('massActions.financialAssistance.table.header.province') as string,
          items: helpers.getEnumKeys(ECanadaProvinces).map((key) => ({ text: this.$t(`common.provinces.${key}`) as string, value: key })),
        },
        {
          key: this.customColumns.email,
          type: EFilterType.Select,
          label: this.$t('massActions.financialAssistance.table.header.email') as string,
          items: [{
            text: this.$t('common.yes') as string,
            value: {
              and: [
                { 'Metadata/PrimaryBeneficiary/ContactInformation/Email': { ne: null } },
                { 'Metadata/PrimaryBeneficiary/ContactInformation/Email': { ne: '' } },
              ],
            },
          }, {
            text: this.$t('common.no') as string,
            value: {
              or: [
                { 'Metadata/PrimaryBeneficiary/ContactInformation/Email': null },
                { 'Metadata/PrimaryBeneficiary/ContactInformation/Email': '' },
              ],
            },
          }],
        },
        {
          key: this.customColumns.isDuplicate,
          type: EFilterType.Select,
          label: this.$t('caseFilesTable.filters.isDuplicate') as string,
          items: [{
            text: this.$t('common.yes') as string,
            value: true,
          }, {
            text: this.$t('common.no') as string,
            value: false,
          }],
        },
      ];
    },
  },

  methods: {
    async onSubmit() {
      this.$router.push({
        name: routes.massActions.financialAssistance.create.name,
        query: { searchParams: JSON.stringify(this.searchParams), mode: MassActionMode.List, total: this.itemsCount.toString() },
      });

      this.$emit('update:show', false);
    },

    async fetchProgramsFilters(eventId: string) {
      this.programsFilterLoading = true;

      const res = await this.$services.programs.getAll({ eventId });

      this.programsFilterLoading = false;

      if (res) {
        this.programsFilter = res.map((p: IProgramEntity) => ({ text: this.$m(p.name), value: p.id }));
      }
    },

    /**
     * When an item has been selected or un-selected
     */
    onAutoCompleteChange({ filterKey, value }: { filterKey: string, value: { text: string; value: string }; }) {
      if (filterKey === 'Entity/EventId') {
        if (value === null) {
          this.programsFilter = [];
          return;
        }
        this.fetchProgramsFilters(value.value);
      }
    },

    async onApplyCaseFileFilter({ preparedFilters, searchFilters }: { preparedFilters: Record<string, unknown>; searchFilters?: string }) {
      const emailFilter = preparedFilters[this.customColumns.email];

      if (emailFilter) {
        if (!preparedFilters.and) {
          preparedFilters.and = [];
        }

        (preparedFilters.and as unknown[]).push(emailFilter);

        delete preparedFilters[this.customColumns.email];
      }

      const appliedProgramIds = preparedFilters['Metadata/AppliedProgramIds'] as any;

      // appliedProgramIds on file is a filter where we're looking for all case files that have not been assigned any of the ids
      // it does not directly translate to our regular filters
      // this is the real filter for this
      if (appliedProgramIds) {
        if (!preparedFilters.and) {
          preparedFilters.and = [];
        }

        (preparedFilters.and as unknown[]).push({
          not: { or: appliedProgramIds.notSearchInOnArray.map((i: string) => ({ 'Metadata/AppliedProgramIdsAsString': { contains: i } })) },
        });

        delete preparedFilters['Metadata/AppliedProgramIds'];
      }

      await this.onApplyFilter({ preparedFilters, searchFilters });
    },

    getIsDuplicateText(caseFile: ICaseFileCombined): TranslateResult {
      return caseFile.metadata.hasPotentialDuplicates ? this.$t('common.yes') : this.$t('common.no');
    },
  },
});
</script>

<style lang="scss">
 .massAction__caseFile_table {
   .export {
     color: white !important;
   }

   .no-data {
     color: var(--v-grey-darken2) !important;
     font-weight: bold;
   }
 }
</style>
