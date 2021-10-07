import { EDateMode, EFilterKeyType, EFilterType } from '@crctech/component-library/src/types/FilterTypes';
import {
  createLocalVue,
  shallowMount,
} from '@/test/testSetup';

import { mockStorage } from '@/store/storage';
import Component from './FinancialAssistanceCreateByList.vue';
import helpers from '@/ui/helpers';
import {
  CaseFileStatus, IdentityAuthenticationStatus, ValidationOfImpactStatus,
} from '@/entities/case-file';
import { ECanadaProvinces } from '@/types';
import { EEventStatus, mockCombinedEvents } from '@/entities/event';
import { mockProgramEntities } from '@/entities/program';

const localVue = createLocalVue();

const storage = mockStorage();

describe('FinancialAssistanceCreateByList.vue', () => {
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
            disabled: wrapper.vm.eventsFilterLoading,
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
            type: EFilterType.Text,
            label: 'massActions.financialAssistance.table.header.email',
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

    describe('filtersOn', () => {
      it('should return true if some filters are used', () => {
        wrapper.vm.userFilters = [{ key: 'name' }];
        expect(wrapper.vm.filtersOn).toBe(true);
      });

      it('should return false if no filters are used', () => {
        wrapper.vm.userFilters = [];
        expect(wrapper.vm.filtersOn).toBe(false);
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

    describe('onCancel', () => {
      it('should update show to false', () => {
        wrapper.vm.onCancel();
        expect(wrapper.emitted('update:show')[0][0]).toEqual(false);
      });
    });

    describe('onClose', () => {
      it('should update show to false', () => {
        wrapper.vm.onClose();
        expect(wrapper.emitted('update:show')[0][0]).toEqual(false);
      });
    });

    describe('onSubmit', () => {
      it('should update show to false', () => {
        wrapper.vm.onSubmit();
        expect(wrapper.emitted('update:show')[0][0]).toEqual(false);
      });
    });

    describe('onExport', () => {
      it('should do nothing', () => {
        expect(wrapper.vm.onExport()).toEqual(false);
      });
    });

    describe('fetchData', () => {
      let params;

      beforeEach(() => {
        params = {
          search: 'query',
          filter: 'filter',
          top: 10,
          skip: 10,
          orderBy: 'name asc',
        };
      });

      it('should call storage actions with proper parameters if some filters are applied', async () => {
        await wrapper.setData({
          userFilters: [{ key: 'name' }],
        });

        await wrapper.vm.fetchData(params);

        expect(wrapper.vm.$storage.caseFile.actions.search)
          .toHaveBeenCalledWith({
            search: params.search,
            filter: params.filter,
            top: params.top,
            skip: params.skip,
            orderBy: params.orderBy,
            count: true,
            queryType: 'full',
            searchMode: 'all',
          });
      });
    });

    describe('fetchEventsFilter', () => {
      it('should search case file events with status onhold or open filtered by inputed name', async () => {
        await wrapper.vm.fetchEventsFilter('query');

        expect(wrapper.vm.$services.events.search)
          .toHaveBeenCalledWith({
            filter: {
              or: [
                {
                  Entity: {
                    Schedule: {
                      Status: EEventStatus.Open,
                    },
                  },
                },
                {
                  Entity: {
                    Schedule: {
                      Status: EEventStatus.OnHold,
                    },
                  },
                },
              ],
            },
            select: ['Entity/Name', 'Entity/Id'],
            top: 999,
            orderBy: 'Entity/Name/Translation/en asc',
            queryType: 'full',
            searchMode: 'all',
          });
      });

      it('should set eventsFilter the search results', async () => {
        wrapper.vm.$services.events.search = jest.fn(() => ({
          odataCount: mockCombinedEvents().length,
          odataContext: 'odataContext',
          value: mockCombinedEvents(),
        }));

        await wrapper.vm.fetchEventsFilter();

        const expected = mockCombinedEvents().map((e) => ({
          text: wrapper.vm.$m(e.entity.name),
          value: e.entity.id,
        }));

        expect(wrapper.vm.eventsFilter).toEqual(expected);
      });
    });

    describe('onAutoCompleteChange (when user is selected or un-selected)', () => {
      it('should reset programs filter if not event has been selected', async () => {
        const data = { filterKey: 'Entity/EventId', value: null };
        await wrapper.setData({ programsFilter: ['1', '2'] });

        wrapper.vm.onAutoCompleteChange(data);

        expect(wrapper.vm.programsFilter).toEqual([]);
      });

      it('should fetch programs filters if the selected events has some', async () => {
        const data = { filterKey: 'Entity/EventId', value: 'uuid' };
        wrapper.vm.fetchProgramsFilters = jest.fn();

        wrapper.vm.onAutoCompleteChange(data);

        expect(wrapper.vm.fetchProgramsFilters).toHaveBeenCalledWith(data.value);
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
  });
});
