<template>
  <rc-dialog
    :title="$t('massAction.financialAssistance.table.add.list')"
    :show.sync="show"
    :cancel-action-label="$t('common.buttons.cancel')"
    :submit-action-label="$t('common.buttons.export')"
    :submit-button-disabled="!filtersOn || tableData.length === 0"
    :loading="fetchAllCaseFileLoading || exportLoading"
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
          :filter-key="FilterKey.MassActionImpactStatuses"
          :count="itemsCount"
          :filter-options="filters"
          add-filter-label="caseFileTable.filter"
          @update:appliedFilter="onApplyFilter"
          @update:autocomplete="onAutoCompleteUpdate($event)"
          @load:filter="throttleOnLoadFilter($event)" />
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

      <template #[`item.${customColumns.unitSuite}`]="{ item: caseFile }">
        {{ caseFile.metadata.household && caseFile.metadata.household.address
          && caseFile.metadata.household.address.address
          && caseFile.metadata.household.address.address.unitSuite || '-' }}
      </template>

      <template #[`item.${customColumns.country}`]="{ item: caseFile }">
        {{ caseFile.metadata.household && caseFile.metadata.household.address
          && caseFile.metadata.household.address.address
          && caseFile.metadata.household.address.address.country || '-' }}
      </template>

      <template #[`item.${customColumns.province}`]="{ item: caseFile }">
        {{ caseFile.metadata.household && caseFile.metadata.household.address
          && caseFile.metadata.household.address.address
          && $m(caseFile.metadata.household.address.address.provinceCode)
          || '-'
        }}
      </template>

      <template #[`item.${customColumns.city}`]="{ item: caseFile }">
        {{ caseFile.metadata.household && caseFile.metadata.household.address
          && caseFile.metadata.household.address.address
          && caseFile.metadata.household.address.address.city || '-' }}
      </template>

      <template #[`item.${customColumns.postalCode}`]="{ item: caseFile }">
        {{ caseFile.metadata.household && caseFile.metadata.household.address
          && caseFile.metadata.household.address.address
          && caseFile.metadata.household.address.address.postalCode
          || '-'
        }}
      </template>

      <template #[`item.${customColumns.longitude}`]="{ item: caseFile }">
        {{ caseFile.metadata.household && caseFile.metadata.household.address
          && caseFile.metadata.household.address.address
          && caseFile.metadata.household.address.address.longitude
          || '-'
        }}
      </template>

      <template #[`item.${customColumns.latitude}`]="{ item: caseFile }">
        {{ caseFile.metadata.household && caseFile.metadata.household.address
          && caseFile.metadata.household.address.address
          && caseFile.metadata.household.address.address.latitude
          || '-'
        }}
      </template>

      <template #[`item.${customColumns.validationOfImpact}`]="{ item: caseFile }">
        <span>
          {{ $m(caseFile.metadata.impactStatusValidationName) }}
        </span>
      </template>
    </rc-data-table>
  </rc-dialog>
</template>

<script lang="ts">

import { RcDataTable, RcDialog } from '@libs/component-lib/components';
import { DataTableHeader } from 'vuetify';
import mixins from 'vue-typed-mixins';
import { EFilterType, IFilterSettings } from '@libs/component-lib/types/FilterTypes';
import FilterToolbar from '@/ui/shared-components/FilterToolbar.vue';
import { FilterKey } from '@libs/entities-lib/user-account';
import { CaseFileStatus, IdentityAuthenticationStatus, ValidationOfImpactStatus } from '@libs/entities-lib/case-file';
import helpers from '@/ui/helpers/helpers';

import { MassActionType } from '@libs/entities-lib/mass-action';
import massActionCaseFileFiltering from '@/ui/views/pages/mass-actions/mixins/massActionCaseFileFiltering';

export default mixins(massActionCaseFileFiltering).extend({
  name: 'ImpactStatusCaseFileFiltering',

  components: {
    RcDialog,
    RcDataTable,
    FilterToolbar,
  },

  data() {
    return {
      programsFilterLoading: false,
      programsFilter: [],
      exportLoading: false,
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
        unitSuite: 'Metadata/Household/Address/Address/UnitSuite',
        country: 'Metadata/Household/Address/Address/Country',
        province: `Metadata/Household/Address/Address/ProvinceCode/Translation/${this.$i18n.locale}`,
        city: 'Metadata/Household/Address/Address/City',
        postalCode: 'Metadata/Household/Address/Address/PostalCode',
        longitude: 'Metadata/Household/Address/Address/Longitude',
        latitude: 'Metadata/Household/Address/Address/Latitude',
        validationOfImpact: `Metadata/ImpactStatusValidationName/Translation/${this.$i18n.locale}`,
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
          text: this.$t('massActions.exportImpactStatus.table.header.unitSuite') as string,
          value: this.customColumns.unitSuite,
          sortable: true,
        },
        {
          text: this.$t('massActions.exportImpactStatus.table.header.country') as string,
          value: this.customColumns.country,
          sortable: true,
        },
        {
          text: this.$t('massActions.financialAssistance.table.header.province') as string,
          value: this.customColumns.province,
          sortable: true,
        },
        {
          text: this.$t('massActions.financialAssistance.table.header.city') as string,
          value: this.customColumns.city,
          sortable: true,
        },
        {
          text: this.$t('massActions.financialAssistance.table.header.postalCode') as string,
          value: this.customColumns.postalCode,
          sortable: true,
        },
        {
          text: this.$t('massActions.exportImpactStatus.table.header.longitude') as string,
          value: this.customColumns.longitude,
          sortable: true,
        },
        {
          text: this.$t('massActions.exportImpactStatus.table.header.latitude') as string,
          value: this.customColumns.latitude,
          sortable: true,
        },
        {
          text: this.$t('massActions.financialAssistance.table.header.validationOfImpact') as string,
          value: this.customColumns.validationOfImpact,
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
          label: this.$t('massActions.exportImpactStatus.filter.caseFile.status') as string,
          items: helpers.enumToTranslatedCollection(CaseFileStatus, 'enums.CaseFileStatus', true),
        },
        {
          key: this.customColumns.validationOfImpact,
          type: EFilterType.MultiSelect,
          label: this.$t('massActions.financialAssistance.table.header.validationOfImpact') as string,
          items: helpers.enumToTranslatedCollection(ValidationOfImpactStatus, 'enums.ValidationOfImpactStatus', true),
        },
      ];
    },
  },

  methods: {
    async onSubmit() {
      this.exportLoading = true;
      await this.onExport(MassActionType.ExportValidationOfImpactStatus);
      this.exportLoading = false;
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
