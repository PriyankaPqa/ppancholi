<template>
  <rc-dialog
    :title="$t('massAction.assessment.table.add.list')"
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
      @search="search">
      <template #filter>
        <filter-toolbar
          :filter-key="FilterKey.MassActionAssessment"
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
              @click="onExport(MassActionType.Assessments)">
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
        {{ caseFile.caseFileNumber }}
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
        {{ caseFile.metadata.household && caseFile.metadata.household.address
          && caseFile.metadata.household.address.address
          && caseFile.metadata.household.address.address.streetAddress || '-' }}
      </template>

      <template #[`item.${customColumns.city}`]="{ item: caseFile }">
        {{ caseFile.metadata.household && caseFile.metadata.household.address
          && caseFile.metadata.household.address.address
          && caseFile.metadata.household.address.address.city || '-' }}
      </template>

      <template #[`item.${customColumns.province}`]="{ item: caseFile }">
        {{ caseFile.metadata.household && caseFile.metadata.household.address
          && caseFile.metadata.household.address.address
          && $m(caseFile.metadata.household.address.address.provinceCode)
          || '-'
        }}
      </template>

      <template #[`item.${customColumns.postalCode}`]="{ item: caseFile }">
        {{ caseFile.metadata.household && caseFile.metadata.household.address
          && caseFile.metadata.household.address.address
          && caseFile.metadata.household.address.address.postalCode
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

      <template #[`item.${customColumns.assessments}`]="{ item: caseFile }">
        ???? {{ caseFile.caseFileNumber }} TBD
      </template>
    </rc-data-table>
  </rc-dialog>
</template>

<script lang="ts">

import { RcDataTable, RcDialog } from '@libs/component-lib/components';
import { DataTableHeader } from 'vuetify';
import mixins from 'vue-typed-mixins';
import {
  EDateMode, EFilterType, IFilterSettings,
} from '@libs/component-lib/types';
import FilterToolbar from '@/ui/shared-components/FilterToolbar.vue';
import { ECanadaProvinces } from '@libs/shared-lib/types';
import { FilterKey } from '@libs/entities-lib/user-account';
import { CaseFileStatus, IdentityAuthenticationStatus, ValidationOfImpactStatus } from '@libs/entities-lib/case-file';
import routes from '@/constants/routes';
import { MassActionMode, MassActionType } from '@libs/entities-lib/mass-action';
import helpers from '@/ui/helpers/helpers';
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
        street: 'Metadata/Household/Address/Address/StreetAddress',
        city: 'Metadata/Household/Address/Address/City',
        province: `Metadata/Household/Address/Address/ProvinceCode/Translation/${this.$i18n.locale}`,
        postalCode: 'Metadata/Household/Address/Address/PostalCode',
        email: 'Metadata/PrimaryBeneficiary/ContactInformation/Email',
        authenticationStatus: `Metadata/IdentityAuthenticationStatusName/Translation/${this.$i18n.locale}`,
        validationOfImpact: `Metadata/ImpactStatusValidationName/Translation/${this.$i18n.locale}`,
        isDuplicate: 'Entity/IsDuplicate',
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
          text: this.$t('massActions.assessment.table.header.assessmentsOnFile') as string,
          value: this.customColumns.isDuplicate,
          sortable: true,
        },
      ];
    },

    filters(): Array<IFilterSettings> {
      return [
        {
          key: 'Entity/EventId',
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
      ];
    },
  },

  methods: {
    async onSubmit() {
      this.$router.push({
        name: routes.massActions.assessments.create.name,
        query: { azureSearchParams: JSON.stringify(this.azureSearchParams), mode: MassActionMode.List, total: this.itemsCount.toString() },
      });

      this.$emit('update:show', false);
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

      await this.onApplyFilter({ preparedFilters, searchFilters });
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
     color: #656565 !important;
     font-weight: bold;
   }
 }
</style>
