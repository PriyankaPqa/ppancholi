import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockHouseholdDuplicate, mockHouseholdEntity, mockHouseholdMetadata, DuplicateStatus, mockHouseholdMemberMetadata,
  mockHouseholdDuplicateFullData, mockDuplicateData,
} from '@libs/entities-lib/household';
import helpers from '@/ui/helpers/helpers';
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
          duplicateData: [mockDuplicateData({ potentialDuplicateId: '1' })],
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
      it('returns the right value', async () => {
        await doMount(true, { computed: {
          duplicates() {
            return duplicates;
          },
        } });

        expect(wrapper.vm.potentialDuplicates).toEqual([mockHouseholdDuplicateFullData({ id: '1', duplicateStatus: DuplicateStatus.Potential })]);
      });
    });

    describe('resolvedDuplicates', () => {
      it('returns the right value', () => {
        doMount(true, { computed: { duplicates() {
          return duplicates;
        } } });
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

    describe('subtitle', () => {
      it('returns the right text depending on tab', async () => {
        doMount(true, {
          computed: { primaryBeneficiaryFullName() {
            return 'John Smith';
          } },
        });
        await wrapper.setData({ selectedTab: SelectedTab.Potential });
        expect(wrapper.vm.subtitle).toEqual({ key: 'householdDetails.manageDuplicates.potentialDuplicates.subtitle', params: [{ name: 'John Smith' }] });
        await wrapper.setData({ selectedTab: SelectedTab.Resolved });
        expect(wrapper.vm.subtitle).toEqual('householdDetails.manageDuplicates.resolvedDuplicates');
        await wrapper.setData({ selectedTab: SelectedTab.FlagNew });
        expect(wrapper.vm.subtitle).toEqual({ key: 'householdDetails.manageDuplicates.flagNew.subtitle', params: [{ name: 'John Smith' }] });
      });
    });

    describe('duplicates', () => {
      it('calls mapDuplicates and returns the result', async () => {
        await doMount();
        wrapper.vm.mapDuplicates = jest.fn(() => duplicates);
        await wrapper.setData({ duplicateData: [mockDuplicateData({ id: '1' })] });
        expect(wrapper.vm.mapDuplicates).toHaveBeenCalledWith([mockDuplicateData({ id: '1' })], [mockHouseholdDuplicate()]);
        expect(wrapper.vm.duplicates).toEqual(duplicates);
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
      it('calls the service and saves the result in duplicateData', async () => {
        await doMount();
        await wrapper.vm.fetchDuplicates();
        expect(wrapper.vm.$services.households.getDuplicates).toHaveBeenCalledWith(wrapper.vm.household.id);
        expect(wrapper.vm.duplicateData).toEqual([mockDuplicateData()]);
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

    describe('allowLeave', () => {
      it('calls exit if the tab is not flagNew', async () => {
        doMount();
        wrapper.vm.exit = jest.fn();
        await wrapper.setData({ selectedTab: SelectedTab.Potential });
        await wrapper.vm.allowLeave(false);
        expect(wrapper.vm.exit).toHaveBeenCalledTimes(1);
      });

      it('calls the helper confirmBeforeLeaving if the tab is flagNew', async () => {
        doMount();
        wrapper.vm.exit = jest.fn();
        helpers.confirmBeforeLeaving = jest.fn();
        await wrapper.setData({ selectedTab: SelectedTab.FlagNew });
        await wrapper.vm.allowLeave(false);
        expect(helpers.confirmBeforeLeaving).toHaveBeenCalledTimes(1);
      });

      it('calls the helper confirmBeforeLeaving if the tab is flagNew and exit if confirmBeforeLeaving returns true', async () => {
        doMount();
        wrapper.vm.exit = jest.fn();
        helpers.confirmBeforeLeaving = jest.fn(() => true);
        await wrapper.setData({ selectedTab: SelectedTab.FlagNew });
        await wrapper.vm.allowLeave(false);
        expect(helpers.confirmBeforeLeaving).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.exit).toHaveBeenCalledTimes(1);
      });
      it('calls the helper confirmBeforeLeaving if the tab is flagNew and does not call exit if confirmBeforeLeaving returns false', async () => {
        doMount();
        wrapper.vm.exit = jest.fn();
        helpers.confirmBeforeLeaving = jest.fn(() => false);
        await wrapper.setData({ selectedTab: SelectedTab.FlagNew });
        await wrapper.vm.allowLeave(false);
        expect(helpers.confirmBeforeLeaving).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.exit).not.toHaveBeenCalled();
      });
    });

    describe('exit', () => {
      it('calls emit when parameter changeTab is false', async () => {
        doMount();
        await wrapper.vm.exit(false);
        expect(wrapper.emitted('update:show')[0][0]).toEqual(false);
      });

      it('sets the tab to the new one when parameter changeTab is true', async () => {
        doMount();
        await wrapper.setData({ selectedTab: SelectedTab.FlagNew });
        await wrapper.vm.exit(true, SelectedTab.Potential);
        expect(wrapper.vm.selectedTab).toEqual(SelectedTab.Potential);
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
