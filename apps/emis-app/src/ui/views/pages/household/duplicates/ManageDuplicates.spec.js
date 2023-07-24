import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockDuplicateHousehold, DuplicateStatus, mockHouseholdDuplicateFullData, mockPotentialDuplicateEntity } from '@libs/entities-lib/potential-duplicate';
import { mockHouseholdEntity, mockHouseholdMetadata, mockHouseholdMemberMetadata } from '@libs/entities-lib/household';
import { getPiniaForUser } from '@/pinia/user/user.mock';
import helpers from '@/ui/helpers/helpers';
import { mockProvider } from '@/services/provider';
import { UserRoles } from '@libs/entities-lib/user';
import { useMockPotentialDuplicateStore } from '@/pinia/potential-duplicate/potential-duplicate.mock';

import Component, { SelectedTab } from './ManageDuplicates.vue';

const { pinia, potentialDuplicateStore } = useMockPotentialDuplicateStore();

const localVue = createLocalVue();
const services = mockProvider();

const duplicates = [
  mockHouseholdDuplicateFullData({ id: '1', duplicateStatus: DuplicateStatus.Potential }),
  mockHouseholdDuplicateFullData({ id: '2', duplicateStatus: DuplicateStatus.Resolved }),
];

describe('ManageDuplicates.vue', () => {
  let wrapper;
  const propsData = {
    household: mockHouseholdEntity({ primaryBeneficiary: 'id-1' }),
    householdMetadata: mockHouseholdMetadata({ memberMetadata: [{ id: 'id-1',
      firstName: 'John',
      lastName: 'Smith',
      email: 'Test@mail.com',
      alternatePhoneNumber: null,
      homePhoneNumber: null,
      mobilePhoneNumber: null,
    },
    { id: 'id-2',
      firstName: 'Jane',
      lastName: 'Doe',
    },
    ] }),
    show: true,
  };

  const doMount = async (isShallow = true, customOptions = null) => {
    const options = {
      localVue,
      propsData,
      pinia,
      data() {
        return {
          duplicateHousehold: [mockDuplicateHousehold({ potentialDuplicateId: '1' })],
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

    wrapper.vm.fetchDuplicateHouseholds = jest.fn(() => [mockDuplicateHousehold()]);
    // wrapper.vm.getPrimaryMemberFullName = jest.fn(() => 'John Smith');
    // wrapper.vm.hasPhoneNumbers = jest.fn(() => true);
    // wrapper.vm.getAddressFirstLine = jest.fn(() => '100 Right ave');
    // wrapper.vm.getAddressSecondLine = jest.fn(() => 'Montreal, QC H2H 2H2');
    // wrapper.vm.getPrimaryMember = jest.fn(() => ({
    //   email: 'Jane.doe@email.com',
    //   mobilePhoneNumber: {
    //     number: '(514) 123 4444',
    //     extension: '',
    //   },
    //   homePhoneNumber: {
    //     number: '(514) 123 2222',
    //     extension: '123',
    //   },
    //   alternatePhoneNumber: {
    //     number: '(514) 123 1111',
    //     extension: '',
    //   },
    // }));
  };

  describe('Computed', () => {
    describe('tabs', () => {
      it('returns 2 tabs if level below 5', () => {
        doMount(true, { pinia: getPiniaForUser(UserRoles.level4) });
        expect(wrapper.vm.tabs).toEqual([SelectedTab.Potential, SelectedTab.FlagNew]);
      });

      it('returns 3 tabs if level 5 plus', () => {
        doMount(true, { pinia: getPiniaForUser(UserRoles.level5) });
        expect(wrapper.vm.tabs).toEqual([SelectedTab.Potential, SelectedTab.Resolved, SelectedTab.FlagNew]);
      });
    });

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

        doMount();

        await wrapper.setProps({ householdMetadata: mockHouseholdMetadata({ memberMetadata }), household: { id: '1', primaryBeneficiary: 'primary-id' } });
        expect(wrapper.vm.sortedMembers).toEqual([mockHouseholdMemberMetadata({ id: 'member-id-2', firstName: 'A' }),
          mockHouseholdMemberMetadata({ id: 'member-id-1', firstName: 'B' }),
        ]);
      });
    });

    describe('subtitle', () => {
      it('returns the right text depending on tab', async () => {
        jest.clearAllMocks();
        await doMount();
        await wrapper.setData({ selectedTab: SelectedTab.Potential });
        expect(wrapper.vm.subtitle).toEqual({ key: 'householdDetails.manageDuplicates.potentialDuplicates.subtitle', params: [{ name: 'John Smith' }] });
        await wrapper.setData({ selectedTab: SelectedTab.Resolved });
        expect(wrapper.vm.subtitle).toEqual('householdDetails.manageDuplicates.resolvedDuplicates');
        await wrapper.setData({ selectedTab: SelectedTab.FlagNew });
        expect(wrapper.vm.subtitle).toEqual({ key: 'householdDetails.manageDuplicates.flagNew.subtitle', params: [{ name: 'John Smith' }] });
      });
    });

    describe('duplicates', () => {
      it('calls usePotentialDuplicateStore, filters duplicates, calls mapDuplicates on the filter results and returns the result', async () => {
        await doMount();
        wrapper.vm.mapDuplicates = jest.fn(() => duplicates);
        const hh1 = mockPotentialDuplicateEntity({ id: '1', householdIds: ['a', 'b'] });
        const hh2 = mockPotentialDuplicateEntity({ id: '1', householdIds: [wrapper.vm.household.id, 'duplicate-hh-id'] });
        potentialDuplicateStore.getAll = jest.fn(() => [hh1, hh2]);
        await wrapper.setData({ duplicateHouseholds: [mockDuplicateHousehold({ id: 'duplicate-hh-id' })] });
        expect(wrapper.vm.mapDuplicates).toHaveBeenCalledWith([hh2], wrapper.vm.duplicateHouseholds);
        expect(wrapper.vm.duplicates).toEqual(duplicates);
      });
    });
  });

  describe('Lifecycle', () => {
    describe('created', () => {
      it('should call fetchDuplicates and store fetch', async () => {
        await doMount();
        wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(wrapper.vm.$services.potentialDuplicates.getHouseholds).toHaveBeenCalledWith(wrapper.vm.household.id);
        expect(potentialDuplicateStore.getDuplicates).toHaveBeenCalledWith(wrapper.vm.household.id);
      });
    });
  });

  describe('Methods', () => {
    describe('fetchDuplicateHouseholds', () => {
      it('calls the service and saves the result in duplicateHouseholds', async () => {
        await doMount();
        await wrapper.vm.fetchDuplicateHouseholds();
        expect(wrapper.vm.$services.potentialDuplicates.getHouseholds).toHaveBeenCalledWith(wrapper.vm.household.id);
        expect(wrapper.vm.duplicateHouseholds).toEqual([mockDuplicateHousehold()]);
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
        expect(wrapper.emitted('close')).toBeTruthy();
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
        const duplicate1 = mockPotentialDuplicateEntity({ householdIds: ['hh-id-1', wrapper.vm.household.id] });
        const duplicate2 = mockPotentialDuplicateEntity({ householdIds: ['hh-id-2', wrapper.vm.household.id] });
        const household1 = mockDuplicateHousehold({ householdId: 'hh-id-1' });
        const household2 = mockDuplicateHousehold({ householdId: 'hh-id-2' });
        const result = await wrapper.vm.mapDuplicates(
          [duplicate1, duplicate2],
          [household1, household2],
        );
        expect(result).toEqual([
          { ...duplicate1,
            duplicateHousehold: household1,
          },
          { ...duplicate2,
            duplicateHousehold: household2,
          }]);
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
        doMount();
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
