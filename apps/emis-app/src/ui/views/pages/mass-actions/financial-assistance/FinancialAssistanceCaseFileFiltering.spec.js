import { EDateMode, EFilterKeyType, EFilterType } from '@libs/component-lib/types/FilterTypes';
import {
  createLocalVue,
  shallowMount,
} from '@/test/testSetup';

import { CaseFileStatus, IdentityAuthenticationStatus, ValidationOfImpactStatus } from '@libs/entities-lib/case-file';
import helpers from '@/ui/helpers/helpers';
import { ECanadaProvinces } from '@libs/shared-lib/types';
import { mockProgramEntities } from '@libs/entities-lib/program';
import routes from '@/constants/routes';
import { MassActionMode } from '@libs/entities-lib/mass-action';

import Component from './FinancialAssistanceCaseFileFiltering.vue';

const localVue = createLocalVue();

describe('FinancialAssistanceCaseFileFiltering.vue', () => {
  let wrapper;

  describe('Computed', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          show: true,
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
            text: 'massActions.financialAssistance.table.header.isDuplicate',
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
            key: 'Metadata/AppliedProgramIds',
            keyType: EFilterKeyType.Array,
            type: EFilterType.MultiSelectExclude,
            label: 'massActions.financialAssistance.filter.programs.label',
            items: wrapper.vm.programsFilter,
            loading: wrapper.vm.programsFilterLoading,
            disabled: wrapper.vm.programsFilter.length === 0,
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
          {
            key: wrapper.vm.customColumns.email,
            type: EFilterType.Select,
            label: 'massActions.financialAssistance.table.header.email',
            items: [{
              text: 'common.yes',
              value: {
                and: [
                  { 'Metadata/PrimaryBeneficiary/ContactInformation/Email': { ne: null } },
                  { 'Metadata/PrimaryBeneficiary/ContactInformation/Email': { ne: '' } },
                ],
              },
            }, {
              text: 'common.no',
              value: {
                or: [
                  { 'Metadata/PrimaryBeneficiary/ContactInformation/Email': null },
                  { 'Metadata/PrimaryBeneficiary/ContactInformation/Email': '' },
                ],
              },
            }],
          },
          {
            key: wrapper.vm.customColumns.isDuplicate,
            type: EFilterType.Select,
            label: 'caseFilesTable.filters.isDuplicate',
            items: [{
              text: 'common.yes',
              value: true,
            }, {
              text: 'common.no',
              value: false,
            }],
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

      });
    });

    describe('onAutoCompleteChange (when event is selected or un-selected)', () => {
      it('should reset programs filter if not event has been selected', async () => {
        const data = { filterKey: 'Entity/EventId', value: null };
        await wrapper.setData({ programsFilter: ['1', '2'] });

        wrapper.vm.onAutoCompleteChange(data);

        expect(wrapper.vm.programsFilter).toEqual([]);
      });

      it('should fetch programs filters if the selected events has some', async () => {
        const data = { filterKey: 'Entity/EventId', value: { text: '', value: 'uuid' } };
        wrapper.vm.fetchProgramsFilters = jest.fn();

        wrapper.vm.onAutoCompleteChange(data);

        expect(wrapper.vm.fetchProgramsFilters).toHaveBeenCalledWith(data.value.value);
      });
    });

    describe('fetchProgramsFilters', () => {
      it('should fetch the programs of a specific event', async () => {
        const eventId = '1';
        await wrapper.vm.fetchProgramsFilters(eventId);
        expect(wrapper.vm.$services.programs.getAll).toHaveBeenLastCalledWith({ eventId });
      });
      it('should set programsFilter', async () => {
        wrapper.vm.$services.programs.getAll = jest.fn(() => mockProgramEntities());

        await wrapper.vm.fetchProgramsFilters();

        const expected = mockProgramEntities().map((p) => ({
          text: wrapper.vm.$m(p.name),
          value: p.id,
        }));

        expect(wrapper.vm.programsFilter).toEqual(expected);
      });
    });

    describe('onSubmit', () => {
      it('should redirect to mass action create with filters params, proper mode and total', async () => {
        await wrapper.vm.onSubmit();

        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({
          name: routes.massActions.financialAssistance.create.name,
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
