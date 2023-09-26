import { EFilterType } from '@libs/component-lib/types/FilterTypes';
import {
  createLocalVue,
  shallowMount,
} from '@/test/testSetup';
import { mockOptionItem } from '@libs/entities-lib/optionItem';
import { CaseFileStatus } from '@libs/entities-lib/case-file';
import helpers from '@/ui/helpers/helpers';
import routes from '@/constants/routes';
import { MassActionMode } from '@libs/entities-lib/mass-action';
import { useMockCaseFileStore } from '@/pinia/case-file/case-file.mock';
import { mockProvider } from '@/services/provider';
import { mockListOption } from '@libs/entities-lib/user-account';
import Component from './CaseFileStatusMassActionFiltering.vue';

const localVue = createLocalVue();
const services = mockProvider();
const { pinia } = useMockCaseFileStore();

describe('CaseFileStatusMassActionFiltering.vue', () => {
  let wrapper;

  describe('Computed', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          show: true,
        },
        mocks: {
          $services: services,
        },
      });
    });

    describe('customColumns', () => {
      it('should return proper data if feature flag is off', () => {
        const expected = {
          caseFileNumber: 'Entity/CaseFileNumber',
          firstName: 'Metadata/PrimaryBeneficiary/IdentitySet/FirstName',
          lastName: 'Metadata/PrimaryBeneficiary/IdentitySet/LastName',
          status: 'Metadata/CaseFileStatusName/Translation/en',
          lastActionDate: 'Metadata/LastActionDate',
          created: 'Entity/Created',
          tags: 'Entity/Tags',
        };

        expect(wrapper.vm.customColumns).toEqual(expected);
      });
    });

    describe('headers', () => {
      it('should return proper headers', () => {
        const expected = [
          {
            text: 'massAction.caseFileStatus.table.header.caseFileNumber',
            align: 'start',
            sortable: true,
            value: wrapper.vm.customColumns.caseFileNumber,
          },
          {
            text: 'massAction.caseFileStatus.table.header.firstName',
            value: wrapper.vm.customColumns.firstName,
            sortable: true,
          },
          {
            text: 'massAction.caseFileStatus.table.header.lastName',
            value: wrapper.vm.customColumns.lastName,
            sortable: true,
          },
          {
            text: 'massAction.caseFileStatus.table.header.status',
            value: wrapper.vm.customColumns.status,
            sortable: true,
          },
          {
            text: 'massAction.caseFileStatus.table.header.lastActionDate',
            value: wrapper.vm.customColumns.lastActionDate,
            sortable: true,
          },
          {
            text: 'massAction.caseFileStatus.table.header.created',
            value: wrapper.vm.customColumns.created,
            sortable: true,
          },
          {
            text: 'massAction.caseFileStatus.table.header.tags',
            value: wrapper.vm.customColumns.tags,
            sortable: false,
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
            key: 'Metadata/LastActionDate',
            type: EFilterType.Date,
            label: 'caseFileTable.filters.lastActionDate',
          },
          {
            key: 'Entity/Created',
            type: EFilterType.Date,
            label: 'caseFileTable.filters.createdDate',
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
        pinia,
        mocks: {
          $services: services,
        },
      });
    });

    describe('getTags', () => {
      it('calls getTagName and returns a list of tag names separated by comma', async () => {
        wrapper.vm.getTagName = jest.fn(() => 'tag name');
        const tags = await wrapper.vm.getTags([mockListOption(), mockListOption()]);
        expect(wrapper.vm.getTagName).toHaveBeenCalledWith(mockListOption());
        expect(tags).toEqual('tag name, tag name');
      });
    });

    describe('getTagName', () => {
      it('returns the tag name from the tag option list data', () => {
        const result = wrapper.vm.getTagName({ optionItemId: mockOptionItem().id });
        expect(result).toEqual(mockOptionItem().name.translation.en);
      });

      it('returns the specified other value if it exists', () => {
        const result = wrapper.vm.getTagName({ optionItemId: mockOptionItem().id, specifiedOther: 'specified other' });
        expect(result).toEqual('specified other');
      });
    });

    describe('onSubmit', () => {
      it('should redirect to mass action create with filters params, proper mode and total', async () => {
        await wrapper.vm.onSubmit();

        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({
          name: routes.massActions.caseFileStatus.create.name,
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
  });
});
