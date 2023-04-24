import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockHouseholdDuplicate, mockHouseholdEntity, mockHouseholdMetadata, DuplicateStatus, mockHouseholdMemberMetadata,
  mockHouseholdDuplicateFullData, mockDuplicateData,
} from '@libs/entities-lib/household';
import { mockProvider } from '@/services/provider';
import Component, { SelectedTab } from './ManageDuplicates.vue';

const localVue = createLocalVue();
const services = mockProvider();
const duplicates = [
  mockHouseholdDuplicateFullData({ id: '1', duplicateStatus: DuplicateStatus.Potential }),
  mockHouseholdDuplicateFullData({ id: '2', duplicateStatus: DuplicateStatus.Resolved }),
];

describe('ManageDuplicates.vue', () => {
  let wrapper;
  const propsData = {
    householdProp: mockHouseholdEntity(),
    householdMetadataProp: mockHouseholdMetadata(),
    show: true,
  };

  const doMount = async (isShallow = true, customOptions = null) => {
    const options = {
      localVue,
      propsData,
      data() {
        return {
          duplicates,
        };
      },
      mocks: {
        $services: services,
      },
      ...customOptions,
    };
    if (isShallow) {
      wrapper = shallowMount(Component, options);
    } else {
      wrapper = mount(Component, options);
    }

    wrapper.vm.fetchDuplicates = jest.fn(() => [mockHouseholdDuplicate()]);
  };

  describe('Computed', () => {
    describe('potentialDuplicates', () => {
      it('returns the right value', () => {
        doMount();
        expect(wrapper.vm.potentialDuplicates).toEqual([mockHouseholdDuplicateFullData({ id: '1', duplicateStatus: DuplicateStatus.Potential })]);
      });
    });

    describe('resolvedDuplicates', () => {
      it('returns the right value', () => {
        doMount();
        expect(wrapper.vm.resolvedDuplicates).toEqual([mockHouseholdDuplicateFullData({ id: '2', duplicateStatus: DuplicateStatus.Resolved })]);
      });
    });

    describe('sortedMembers', () => {
      it('returns the right sorted members', async () => {
        const memberMetadata = [
          mockHouseholdMemberMetadata({ id: 'primary-id' }),
          mockHouseholdMemberMetadata({ id: 'member-id-1', firstName: 'B' }),
          mockHouseholdMemberMetadata({ id: 'member-id-2', firstName: 'A' })];
        doMount(true, {
          computed: { primaryBeneficiary() {
            return mockHouseholdMemberMetadata({ id: 'primary-id' });
          } },
        });
        await wrapper.setData({ householdMetadata: mockHouseholdMetadata({ memberMetadata }) });
        expect(wrapper.vm.sortedMembers).toEqual([mockHouseholdMemberMetadata({ id: 'member-id-2', firstName: 'A' }),
          mockHouseholdMemberMetadata({ id: 'member-id-1', firstName: 'B' }),
        ]);
      });
    });
  });

  describe('Lifecycle', () => {
    describe('created', () => {
      it('should call fetchDuplicates', async () => {
        await doMount();
        wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(wrapper.vm.fetchDuplicates).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Methods', () => {
    describe('fetchDuplicates', () => {
      it('calls the service', async () => {
        await doMount();
        wrapper.vm.mapDuplicates = jest.fn(() => duplicates);
        await wrapper.vm.fetchDuplicates();
        expect(wrapper.vm.$services.households.getDuplicates).toHaveBeenCalledWith(wrapper.vm.household.id);
      });

      it('calls mapDuplicates and saves the result into duplicates variable', async () => {
        doMount();
        wrapper.vm.mapDuplicates = jest.fn(() => duplicates);
        await wrapper.vm.fetchDuplicates();
        expect(wrapper.vm.mapDuplicates).toBeCalledWith([mockDuplicateData()], [mockHouseholdDuplicate()]);
        expect(wrapper.vm.duplicates).toEqual(duplicates);
      });
    });

    describe('getTabLabel', () => {
      it('returns the right label for potential duplicates tab', async () => {
        await doMount(true, { computed: { potentialDuplicates() {
          return [duplicates[0]];
        } } });
        const label = await wrapper.vm.getTabLabel(SelectedTab.Potential);
        expect(label).toEqual('householdDetails.manageDuplicates.tab.Potential (1)');
      });

      it('returns the right label for resolved duplicates tab', async () => {
        await doMount(true, { computed: { resolvedDuplicates() {
          return duplicates;
        } } });
        const label = await wrapper.vm.getTabLabel(SelectedTab.Resolved);
        expect(label).toEqual('householdDetails.manageDuplicates.tab.Resolved (2)');
      });
      it('returns the right label for flag new duplicate tab', async () => {
        await doMount();
        const label = await wrapper.vm.getTabLabel(SelectedTab.FlagNew);
        expect(label).toEqual('householdDetails.manageDuplicates.tab.FlagNew');
      });
    });

    describe('mapDuplicates', () => {
      it('returns the mapped duplicates', async () => {
        doMount();
        const result = await wrapper.vm.mapDuplicates(
          [mockDuplicateData({ potentialDuplicateId: '1' })],
          [mockHouseholdDuplicate({ id: '1' })],
        );
        expect(result).toEqual([{ ...mockHouseholdDuplicate({ id: '1' }), ...mockDuplicateData({ potentialDuplicateId: '1' }) }]);
      });
    });
  });

  describe('Template', () => {
    describe('primaryBeneficiaryFullName', () => {
      it('renders', () => {
        doMount();
        const element = wrapper.findDataTest('householdDetails-manageDuplicate-primaryBeneficiaryFullName');
        expect(element.exists()).toBeTruthy();
      });

      it('contains the right data', () => {
        doMount(true, { computed: { primaryBeneficiaryFullName() {
          return 'John Smith';
        } } });

        const element = wrapper.findDataTest('householdDetails-manageDuplicate-primaryBeneficiaryFullName');
        expect(element.text()).toContain('John Smith');
      });
    });

    describe('registrationNumber', () => {
      it('renders', () => {
        doMount();
        const element = wrapper.findDataTest('householdDetails-manageDuplicate-registrationNumber');
        expect(element.exists()).toBeTruthy();
      });

      it('contains the right data', () => {
        doMount();

        const element = wrapper.findDataTest('householdDetails-manageDuplicate-registrationNumber');
        expect(element.text()).toContain(wrapper.vm.household.registrationNumber);
      });
    });

    describe('members', () => {
      it('renders', () => {
        doMount();
        const element = wrapper.findDataTest('householdDetails-manageDuplicate-householdMembers');
        expect(element.exists()).toBeTruthy();
      });

      it('contains the right data', () => {
        doMount(false, {
          computed: { sortedMembers() {
            return [mockHouseholdMemberMetadata()];
          } },
        });
        const element = wrapper.findDataTest('householdDetails-manageDuplicate-householdMembers');
        expect(element.text()).toContain(mockHouseholdMemberMetadata().firstName);
        expect(element.text()).toContain(mockHouseholdMemberMetadata().lastName);
      });
    });
  });
});
