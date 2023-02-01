import { EDateMode, EFilterType } from '@libs/component-lib/types/FilterTypes';
import {
  createLocalVue,
  shallowMount,
} from '@/test/testSetup';

import { mockStorage } from '@/storage';
import { CaseFileStatus, IdentityAuthenticationStatus, ValidationOfImpactStatus } from '@libs/entities-lib/case-file';
import helpers from '@/ui/helpers/helpers';
import { ECanadaProvinces } from '@libs/shared-lib/types';
import routes from '@/constants/routes';
import { MassActionMode } from '@libs/entities-lib/mass-action';
import Component from './AssessmentCaseFileFiltering.vue';

const localVue = createLocalVue();

const storage = mockStorage();

describe('AssessmentCaseFileFiltering.vue', () => {
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
          city: 'Metadata/Household/Address/Address/City',
          province: 'Metadata/Household/Address/Address/ProvinceCode/Translation/en',
          postalCode: 'Metadata/Household/Address/Address/PostalCode',
          email: 'Metadata/PrimaryBeneficiary/ContactInformation/Email',
          authenticationStatus: 'Metadata/IdentityAuthenticationStatusName/Translation/en',
          validationOfImpact: 'Metadata/ImpactStatusValidationName/Translation/en',
          isDuplicate: 'Entity/IsDuplicate',
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
            text: 'massActions.financialAssistance.table.header.city',
            value: wrapper.vm.customColumns.city,
            sortable: true,
          },
          {
            text: 'massActions.financialAssistance.table.header.province',
            value: wrapper.vm.customColumns.province,
            sortable: true,
          },
          {
            text: 'massActions.financialAssistance.table.header.postalCode',
            value: wrapper.vm.customColumns.postalCode,
            sortable: true,
          },
          {
            text: 'massActions.financialAssistance.table.header.email',
            value: wrapper.vm.customColumns.email,
            sortable: true,
          },
          {
            text: 'massActions.financialAssistance.table.header.authenticationStatus',
            value: wrapper.vm.customColumns.authenticationStatus,
            sortable: true,
          },
          {
            text: 'massActions.financialAssistance.table.header.validationOfImpact',
            value: wrapper.vm.customColumns.validationOfImpact,
            sortable: true,
          },
          {
            text: 'massActions.assessment.table.header.assessmentsOnFile',
            value: wrapper.vm.customColumns.isDuplicate,
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
            disabled: wrapper.vm.eventsFilterDisabled,
            props: {
              'no-data-text': 'common.inputs.start_typing_to_search',
              'search-input': null,
              'no-filter': true,
              'return-object': true,
            },
          },
          {
            key: `Metadata/CaseFileStatusName/Translation/${wrapper.vm.$i18n.locale}`,
            type: EFilterType.MultiSelect,
            label: 'caseFileTable.tableHeaders.status',
            items: helpers.enumToTranslatedCollection(CaseFileStatus, 'enums.CaseFileStatus', true),
          },
          {
            key: wrapper.vm.customColumns.authenticationStatus,
            type: EFilterType.MultiSelect,
            label: 'massActions.financialAssistance.table.header.authenticationStatus',
            items: helpers.enumToTranslatedCollection(IdentityAuthenticationStatus, 'caseFile.beneficiaryIdentityVerificationStatus', true),
          },
          {
            key: wrapper.vm.customColumns.validationOfImpact,
            type: EFilterType.MultiSelect,
            label: 'massActions.financialAssistance.table.header.validationOfImpact',
            items: helpers.enumToTranslatedCollection(ValidationOfImpactStatus, 'caseFile.beneficiaryImpactValidationStatus', true),
          },
          {
            key: 'Metadata/PrimaryBeneficiary/IdentitySet/DateOfBirth',
            type: EFilterType.Date,
            dateMode: EDateMode.Static,
            label: 'common.birthdate.label',
          },
          {
            key: wrapper.vm.customColumns.province,
            type: EFilterType.MultiSelect,
            label: 'massActions.financialAssistance.table.header.province',
            items: helpers.getEnumKeys(ECanadaProvinces).map((key) => ({ text: `common.provinces.${key}`, value: key })),
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
      it('should redirect to mass action create with filters params, proper mode and total', async () => {
        await wrapper.vm.onSubmit();

        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({
          name: routes.massActions.assessments.create.name,
          query: {
            azureSearchParams: JSON.stringify(wrapper.vm.azureSearchParams),
            mode: MassActionMode.List,
            total: wrapper.vm.itemsCount.toString(),
          },
        });
      });

      it('should update show to false', async () => {
        await wrapper.vm.onSubmit();

        expect(wrapper.emitted('update:show')[0][0]).toEqual(false);
      });
    });

    describe('onApplyCaseFileFilter', () => {
      it('should assign email filter and remove original email filter', async () => {
        const testFilter = { test: 'filter' };

        const preparedFilters = {
          'Metadata/PrimaryBeneficiary/ContactInformation/Email': testFilter,
          and: [],
        };

        wrapper.vm.onApplyFilter = jest.fn();

        await wrapper.vm.onApplyCaseFileFilter({ preparedFilters, searchFilters: '' });

        expect(wrapper.vm.onApplyFilter).toHaveBeenCalledWith({
          preparedFilters: {
            and: [
              testFilter,
            ],
          },
          searchFilters: '',
        });
      });
    });
  });
});
