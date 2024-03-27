import { EDateMode, EFilterType } from '@libs/component-lib/types/FilterTypes';
import {
  createLocalVue,
  shallowMount,
} from '@/test/testSetup';

import {
  CaseFileStatus, IdentityAuthenticationStatus, ValidationOfImpactStatus, mockCombinedCaseFiles,
} from '@libs/entities-lib/case-file';
import helpers from '@/ui/helpers/helpers';
import { ECanadaProvinces } from '@libs/shared-lib/types';
import routes from '@/constants/routes';
import { MassActionMode } from '@libs/entities-lib/mass-action';

import { mockProvider } from '@/services/provider';
import Component from './CommunicationCaseFileFiltering.vue';

const localVue = createLocalVue();
const services = mockProvider();

describe('CommunicationCaseFileFiltering.vue', () => {
  let wrapper;

  describe('Computed', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          show: true,
        },
        computed: {
          tableData() {
            return mockCombinedCaseFiles();
          },
        },
        mocks: {
          $services: services,
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
          unit: 'Metadata/Household/Address/Address/Unit',
          city: 'Metadata/Household/Address/Address/City',
          province: 'Metadata/Household/Address/Address/ProvinceCode/Translation/en',
          postalCode: 'Metadata/Household/Address/Address/PostalCode',
          email: 'Metadata/PrimaryBeneficiary/ContactInformation/Email',
          phoneNumber: 'Metadata/Household/ContactInformation/Phone/',
          preferredLanguage: 'Metadata/PrimaryBeneficiary/ContactInformation/PreferredLanguage',
          authenticationStatus: 'Metadata/IdentityAuthenticationStatusName/Translation/en',
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
            text: 'massActions.financialAssistance.table.header.unit',
            value: wrapper.vm.customColumns.unit,
            sortable: false,
          },
          {
            text: 'massActions.financialAssistance.table.header.phoneNumber',
            value: wrapper.vm.customColumns.phoneNumber,
            sortable: false,
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
            text: 'massActions.financialAssistance.table.header.preferredLanguage',
            value: wrapper.vm.customColumns.preferredLanguage,
            sortable: false,
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
        computed: {
          tableData() {
            return mockCombinedCaseFiles();
          },
        },
        mocks: {
          $services: services,
        },
      });
    });

    describe('onSubmit', () => {
      it('should redirect to mass action create with filters params, proper mode and total', async () => {
        await wrapper.vm.onSubmit();

        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({
          name: routes.massActions.communications.create.name,
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

    describe('onSearchComplete', () => {
      it('should call getPerson for the primaries', async () => {
        jest.clearAllMocks();
        await wrapper.vm.onSearchComplete();
        expect(wrapper.vm.$services.households.getPerson).toHaveBeenCalledTimes(mockCombinedCaseFiles().length);
        expect(wrapper.vm.$services.households.getPerson).toHaveBeenCalledWith(mockCombinedCaseFiles()[0].metadata.primaryBeneficiary.id);
        expect(wrapper.vm.personData.length).toBe(mockCombinedCaseFiles().length);
      });
    });

    describe('getPerson', () => {
      it('Finds by id', async () => {
        await wrapper.setData({ personData: [{ id: 'abc' }, { id: 'def' }] });
        expect(wrapper.vm.getPerson({ metadata: { primaryBeneficiary: { id: 'def' } } })).toBe(wrapper.vm.personData[1]);
      });
    });
  });
});