import { EFilterType } from '@libs/component-lib/types/FilterTypes';
import {
  createLocalVue,
  shallowMount,
} from '@/test/testSetup';

import { mockStorage } from '@/store/storage';
import helpers from '@/ui/helpers/helpers';
import { CaseFileStatus, ValidationOfImpactStatus } from '@/entities/case-file';
import { MassActionType } from '@/entities/mass-action';
import Component from './ImpactStatusCaseFileFiltering.vue';

const localVue = createLocalVue();

const storage = mockStorage();

describe('FinancialAssistanceCaseFileFiltering.vue', () => {
  let wrapper;

  describe('Computed', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          show: true,
        },
        mocks: {
          $storage: storage,
        },
      });
    });

    describe('customColumns', () => {
      it('should return proper data', () => {
        const expected = {
          caseFileNumber: 'Entity/CaseFileNumber',
          firstName: 'Metadata/PrimaryBeneficiary/IdentitySet/FirstName',
          lastName: 'Metadata/PrimaryBeneficiary/IdentitySet/LastName',
          street: 'Metadata/Household/Address/Address/StreetAddress',
          unitSuite: 'Metadata/Household/Address/Address/UnitSuite',
          country: 'Metadata/Household/Address/Address/Country',
          province: 'Metadata/Household/Address/Address/ProvinceCode/Translation/en',
          city: 'Metadata/Household/Address/Address/City',
          postalCode: 'Metadata/Household/Address/Address/PostalCode',
          longitude: 'Metadata/Household/Address/Address/Longitude',
          latitude: 'Metadata/Household/Address/Address/Latitude',
          validationOfImpact: 'Metadata/ImpactStatusValidationName/Translation/en',
        };

        expect(wrapper.vm.customColumns).toEqual(expected);
      });
    });

    describe('headers', () => {
      it('should return proper headers', () => {
        const expected = [
          {
            text: 'massActions.financialAssistance.table.header.caseFileNumber',
            align: 'start',
            sortable: true,
            value: wrapper.vm.customColumns.caseFileNumber,
          },
          {
            text: 'massActions.financialAssistance.table.header.firstName',
            value: wrapper.vm.customColumns.firstName,
            sortable: true,
          },
          {
            text: 'massActions.financialAssistance.table.header.lastName',
            value: wrapper.vm.customColumns.lastName,
            sortable: true,
          },
          {
            text: 'massActions.financialAssistance.table.header.street',
            value: wrapper.vm.customColumns.street,
            sortable: true,
          },
          {
            text: 'massActions.exportImpactStatus.table.header.unitSuite',
            value: wrapper.vm.customColumns.unitSuite,
            sortable: true,
          },
          {
            text: 'massActions.exportImpactStatus.table.header.country',
            value: wrapper.vm.customColumns.country,
            sortable: true,
          },
          {
            text: 'massActions.financialAssistance.table.header.province',
            value: wrapper.vm.customColumns.province,
            sortable: true,
          },
          {
            text: 'massActions.financialAssistance.table.header.city',
            value: wrapper.vm.customColumns.city,
            sortable: true,
          },
          {
            text: 'massActions.financialAssistance.table.header.postalCode',
            value: wrapper.vm.customColumns.postalCode,
            sortable: true,
          },
          {
            text: 'massActions.exportImpactStatus.table.header.longitude',
            value: wrapper.vm.customColumns.longitude,
            sortable: true,
          },
          {
            text: 'massActions.exportImpactStatus.table.header.latitude',
            value: wrapper.vm.customColumns.latitude,
            sortable: true,
          },
          {
            text: 'massActions.financialAssistance.table.header.validationOfImpact',
            value: wrapper.vm.customColumns.validationOfImpact,
            sortable: true,
          },
        ];

        expect(wrapper.vm.headers).toEqual(expected);
      });
    });

    describe('filters', () => {
      it('should return proper filters', () => {
        const expected = [
          {
            key: 'Entity/EventId',
            type: EFilterType.Select,
            label: 'caseFileTable.filters.eventName',
            items: wrapper.vm.eventsFilter,
            loading: wrapper.vm.eventsFilterLoading,
            disabled: wrapper.vm.eventsFilterLoading,
          },
          {
            key: `Metadata/CaseFileStatusName/Translation/${wrapper.vm.$i18n.locale}`,
            type: EFilterType.MultiSelect,
            label: 'massActions.exportImpactStatus.filter.caseFile.status',
            items: helpers.enumToTranslatedCollection(CaseFileStatus, 'enums.CaseFileStatus', true),
          },
          {
            key: wrapper.vm.customColumns.validationOfImpact,
            type: EFilterType.MultiSelect,
            label: 'massActions.financialAssistance.table.header.validationOfImpact',
            items: helpers.enumToTranslatedCollection(ValidationOfImpactStatus, 'caseFile.beneficiaryImpactValidationStatus', true),
          },
        ];

        expect(wrapper.vm.filters).toEqual(expected);
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          show: true,
        },
        mocks: {
          $storage: storage,
        },
      });
    });

    describe('onSubmit', () => {
      it('should call onExport with proper params', async () => {
        wrapper.vm.onExport = jest.fn();

        await wrapper.vm.onSubmit();

        expect(wrapper.vm.onExport).toHaveBeenCalledWith(MassActionType.ExportValidationOfImpactStatus);
      });
    });
  });
});
