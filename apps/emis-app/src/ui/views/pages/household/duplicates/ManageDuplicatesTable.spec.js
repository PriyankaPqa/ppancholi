import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { DuplicateStatus, mockHouseholdDuplicateFullData, DuplicateReason } from '@libs/entities-lib/household';
import routes from '@/constants/routes';
import householdHelpers from '@/ui/helpers/household';
import { mockProvider } from '@/services/provider';
import { getPiniaForUser } from '@/pinia/user/user.mock';
import { useMockHouseholdStore } from '@/pinia/household/household.mock';
import helpers from '@/ui/helpers/helpers';

import { UserRoles } from '@libs/entities-lib/user';
import Component from './ManageDuplicatesTable.vue';

const localVue = createLocalVue();
const services = mockProvider();
const { pinia, householdStore } = useMockHouseholdStore();
const duplicates = [
  mockHouseholdDuplicateFullData({
    id: '1',
    duplicateStatus: DuplicateStatus.Potential,
    primaryBeneficiaryFullName: 'Jane Doe',
    registrationNumber: 'registration-number',
    caseFiles: [{ caseFileNumber: 'case-file-number', eventName: { translation: { en: 'event-name' } } }],
  }),
  mockHouseholdDuplicateFullData({ id: '2', duplicateStatus: DuplicateStatus.Resolved }),
];

describe('ManageDuplicatesTable.vue', () => {
  let wrapper;
  const propsData = {
    isPotentialTable: true,
    duplicates,
    loading: false,
    currentHouseholdId: 'current-household-id',
  };

  const doMount = async (isShallow = true, customOptions = null) => {
    const options = {
      localVue,
      pinia,
      propsData,
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
  };

  describe('Computed', () => {
    describe('statuses', () => {
      it('returns the right value', () => {
        helpers.enumToTranslatedCollection = jest.fn(
          () => ['householdDetails.manageDuplicates.enum.duplicateStatus.1', 'householdDetails.manageDuplicates.enum.duplicateStatus.2'],
        );
        doMount();
        expect(wrapper.vm.statuses).toEqual(['householdDetails.manageDuplicates.enum.duplicateStatus.1', 'householdDetails.manageDuplicates.enum.duplicateStatus.2']);
      });
    });

    describe('canAction', () => {
      it('returns true if table is isPotential', () => {
        doMount();
        wrapper.setProps({ isPotentialTable: true });
        expect(wrapper.vm.canAction).toEqual(true);
      });

      it('returns true if table is Resolved and user is level 6', () => {
        doMount(true, { pinia: getPiniaForUser(UserRoles.level6) });
        wrapper.setProps({ isPotentialTable: false });
        expect(wrapper.vm.canAction).toEqual(true);
      });

      it('returns true if table is Resolved and user is level 5 or lower', () => {
        doMount(true, { pinia: getPiniaForUser(UserRoles.level5) });
        wrapper.setProps({ isPotentialTable: false });
        expect(wrapper.vm.canAction).toEqual(true);
      });
    });
  });

  describe('Methods', () => {
    describe('getCaseFileRoute', () => {
      it('returns the right route data', () => {
        doMount();
        const id = '012345';
        expect(wrapper.vm.getCaseFileRoute(id)).toEqual({
          name: routes.caseFile.activity.name,
          params: { id },
        });
      });
    });

    describe('getHouseholdRoute', () => {
      it('should return the right route data', () => {
        doMount();
        const id = '1234';
        expect(wrapper.vm.getHouseholdRoute(id)).toEqual({
          name: routes.household.householdProfile.name,
          params: { id },
        });
      });
    });

    describe('getFormattedAddress', () => {
      it('returns the right address', () => {
        householdHelpers.getAddressLines = jest.fn(() => ['address-part-1', 'address-part-2']);
        doMount();
        expect(wrapper.vm.getFormattedAddress()).toEqual('address-part-1, address-part-2');
      });
    });

    describe('showLine', () => {
      it('returns true if the duplicatesReason contains the reason passed as param', () => {
        const duplicate = mockHouseholdDuplicateFullData({ duplicateReasons: [DuplicateReason.FullName, DuplicateReason.AlternatePhoneNumber] });
        doMount();
        expect(wrapper.vm.showLine(duplicate, DuplicateReason.FullName)).toEqual(true);
      });
      it('returns false if the duplicatesReason does not contain the reason passed as param', () => {
        const duplicate = mockHouseholdDuplicateFullData({ duplicateReasons: [DuplicateReason.FullName, DuplicateReason.AlternatePhoneNumber] });
        doMount();
        expect(wrapper.vm.showLine(duplicate, DuplicateReason.MobilePhoneNumber)).toEqual(false);
      });
    });

    describe('action', () => {
      it('sets actionedDuplicate and sets showActionDialog to true', async () => {
        doMount();
        await wrapper.setData({ showActionDialog: false });
        await wrapper.vm.action(mockHouseholdDuplicateFullData({ id: '11' }));
        expect(wrapper.vm.actionedDuplicate).toEqual(mockHouseholdDuplicateFullData({ id: '11' }));
        expect(wrapper.vm.showActionDialog).toEqual(true);
      });
    });

    describe('cancelAction', () => {
      it('sets initial select and sets showActionDialog to false when on potential table', async () => {
        doMount();
        await wrapper.setProps({ isPotentialTable: true });
        await wrapper.setData({ initialSelect: DuplicateStatus.Resolved, showActionDialog: true, actionedDuplicate: { duplicateStatus: DuplicateStatus.Potential } });
        await wrapper.vm.cancelAction();
        expect(wrapper.vm.initialSelect).toEqual(DuplicateStatus.Potential);
        expect(wrapper.vm.showActionDialog).toEqual(false);
      });

      it('sets initial select and sets showActionDialog to false when on resolved table', async () => {
        doMount();
        await wrapper.setProps({ isPotentialTable: false });
        await wrapper.setData({ initialSelect: DuplicateStatus.Potential, showActionDialog: true, actionedDuplicate: { duplicateStatus: DuplicateStatus.Potential } });
        await wrapper.vm.cancelAction();
        expect(wrapper.vm.initialSelect).toEqual(DuplicateStatus.Resolved);
        expect(wrapper.vm.showActionDialog).toEqual(false);
      });
    });

    describe('submitAction', () => {
      it('calls service flagDuplicate if status is Potential', async () => {
        doMount();
        const rationale = 'rationale';
        const duplicateHouseholdId = 'householdId';
        const potentialDuplicateId = 'potentialDuplicateId';
        const arg = { status: DuplicateStatus.Potential, rationale: 'rationale' };
        wrapper.vm.actionedDuplicate = { householdId: duplicateHouseholdId, id: potentialDuplicateId };

        await wrapper.vm.submitAction(arg);
        expect(householdStore.flagDuplicate).toHaveBeenCalledWith(wrapper.vm.currentHouseholdId, { duplicateHouseholdId, potentialDuplicateId, rationale });
      });

      it('calls service resolveDuplicate if status is Resolved', async () => {
        doMount();
        const rationale = 'rationale';
        const duplicateHouseholdId = 'householdId';
        const potentialDuplicateId = 'potentialDuplicateId';
        const arg = { status: DuplicateStatus.Resolved, rationale };
        wrapper.vm.actionedDuplicate = { householdId: duplicateHouseholdId, id: potentialDuplicateId };

        await wrapper.vm.submitAction(arg);
        expect(householdStore.resolveDuplicate).toHaveBeenCalledWith(wrapper.vm.currentHouseholdId, { potentialDuplicateId, duplicateHouseholdId, rationale });
      });

      it('resets actionedDuplicate and emits fetchDuplicates if call is successful', async () => {
        doMount();
        wrapper.vm.$emit = jest.fn();
        const arg = { status: DuplicateStatus.Resolved, rationale: 'rationale' };
        wrapper.vm.actionedDuplicate = { householdId: 'householdId', id: 'id' };
        await wrapper.vm.submitAction(arg);
        expect(wrapper.vm.actionedDuplicate).toEqual(null);
      });
    });
  });

  describe('Template', () => {
    describe('primaryBeneficiaryFullName link', () => {
      it('renders', () => {
        doMount(false);
        const element = wrapper.findDataTest('householdDetails-manageDuplicates-household-link');
        expect(element.exists()).toBeTruthy();
      });

      it('contains the right data', () => {
        doMount(false);
        const element = wrapper.findDataTest('householdDetails-manageDuplicates-household-link');
        expect(element.text()).toContain('Jane Doe');
      });
    });

    describe('casefile registration number', () => {
      it('renders', () => {
        doMount(false);
        const element = wrapper.findDataTest('householdDetails-manageDuplicates-household-registration-number');
        expect(element.exists()).toBeTruthy();
      });

      it('contains the right data', () => {
        doMount(false);
        const element = wrapper.findDataTest('householdDetails-manageDuplicates-household-registration-number');
        expect(element.text()).toContain('household.profile.registration_number: registration-number');
      });
    });

    describe('casefile data', () => {
      it('renders', () => {
        doMount(false);
        const element = wrapper.findDataTest('householdDetails-manageDuplicates-caseFile-data');
        expect(element.exists()).toBeTruthy();
      });

      it('contains the right data', () => {
        doMount(false);
        const element = wrapper.findDataTest('householdDetails-manageDuplicates-caseFile-data');
        expect(element.text()).toContain('caseFileDetail.caseFileNumber: case-file-number');
        expect(element.text()).toContain(' caseFileDetail.eventLabel: event-name');
      });
    });

    describe('duplicate name', () => {
      it('renders if reason contains name', async () => {
        doMount(false);
        await wrapper.setProps({ duplicates: [mockHouseholdDuplicateFullData({ duplicateReasons: [DuplicateReason.FullName], memberFirstName: 'Joe', memberLastName: 'White' })] });
        const element = wrapper.findDataTest('householdDetails-duplicate-name');
        expect(element.exists()).toBeTruthy();
        expect(element.text()).toContain('Joe White');
      });

      it('does not render if reason does not contain name', async () => {
        doMount(false);
        await wrapper.setProps({ duplicates: [mockHouseholdDuplicateFullData({ duplicateReasons: [DuplicateReason.HomeAddress] })] });
        const element = wrapper.findDataTest('householdDetails-duplicate-name');
        expect(element.exists()).not.toBeTruthy();
      });
    });

    describe('home phone number', () => {
      it('renders if reason contains home phone number', async () => {
        doMount(false);
        await wrapper.setProps({ duplicates:
          [mockHouseholdDuplicateFullData({ duplicateReasons: [DuplicateReason.HomePhoneNumber], homePhoneNumber: { number: 'home-phone' } })] });
        const element = wrapper.findDataTest('duplicate-home-phone-number');
        expect(element.exists()).toBeTruthy();
        expect(element.props('phoneNumber')).toEqual({ number: 'home-phone' });
      });

      it('does not render if reason does not contain home phone number', async () => {
        doMount(false);
        await wrapper.setProps({ duplicates: [mockHouseholdDuplicateFullData({ duplicateReasons: [DuplicateReason.HomeAddress] })] });
        const element = wrapper.findDataTest('duplicate-home-phone-number');
        expect(element.exists()).not.toBeTruthy();
      });
    });

    describe('mobile phone number', () => {
      it('renders if reason contains mobile phone number', async () => {
        doMount(false);
        await wrapper.setProps({ duplicates:
          [mockHouseholdDuplicateFullData({ duplicateReasons: [DuplicateReason.MobilePhoneNumber], mobilePhoneNumber: { number: 'mobile-phone' } })] });
        const element = wrapper.findDataTest('duplicate-mobile-phone-number');
        expect(element.exists()).toBeTruthy();
        expect(element.props('phoneNumber')).toEqual({ number: 'mobile-phone' });
      });

      it('does not render if reason does not contain mobile phone number', async () => {
        doMount(false);
        await wrapper.setProps({ duplicates: [mockHouseholdDuplicateFullData({ duplicateReasons: [DuplicateReason.HomeAddress] })] });
        const element = wrapper.findDataTest('duplicate-mobile-phone-number');
        expect(element.exists()).not.toBeTruthy();
      });
    });

    describe('alternate phone number', () => {
      it('renders if reason contains alternate phone number', async () => {
        doMount(false);
        await wrapper.setProps({ duplicates:
          [mockHouseholdDuplicateFullData({ duplicateReasons: [DuplicateReason.AlternatePhoneNumber], alternatePhoneNumber: { number: 'alternate-phone' } })] });
        const element = wrapper.findDataTest('duplicate-alternate-phone-number');
        expect(element.exists()).toBeTruthy();
        expect(element.props('phoneNumber')).toEqual({ number: 'alternate-phone' });
      });

      it('does not render if reason does not contain alternate phone number', async () => {
        doMount(false);
        await wrapper.setProps({ duplicates: [mockHouseholdDuplicateFullData({ duplicateReasons: [DuplicateReason.HomeAddress] })] });
        const element = wrapper.findDataTest('duplicate-alternate-phone-number');
        expect(element.exists()).not.toBeTruthy();
      });
    });

    describe('history status', () => {
      it('renders', async () => {
        doMount(false);
        const element = wrapper.findDataTest('householdDetails-duplicate-history-status');
        expect(element.exists()).toBeTruthy();
      });

      it('contains the right data', async () => {
        doMount(false);
        const element = wrapper.findDataTest('householdDetails-duplicate-history-status');
        expect(element.text())
          .toContain(`householdDetails.manageDuplicates.enum.duplicateStatus.${mockHouseholdDuplicateFullData().duplicateStatusHistory[0].duplicateStatus}`);
      });
    });

    describe('history user', () => {
      it('renders', async () => {
        doMount(false);
        const element = wrapper.findDataTest('householdDetails-duplicate-history-user');
        expect(element.exists()).toBeTruthy();
      });

      it('contains the right data', async () => {
        doMount(false);
        const element = wrapper.findDataTest('householdDetails-duplicate-history-user');
        expect(element.text()).toContain(mockHouseholdDuplicateFullData().duplicateStatusHistory[0].userInformation.userName);
        expect(element.text()).toContain(mockHouseholdDuplicateFullData().duplicateStatusHistory[0].userInformation.roleName.translation.en);
      });
    });

    describe('history rationale', () => {
      it('renders', async () => {
        doMount(false);
        const element = wrapper.findDataTest('householdDetails-duplicate-history-rationale');
        expect(element.exists()).toBeTruthy();
      });

      it('contains the right data', async () => {
        doMount(false);
        const element = wrapper.findDataTest('householdDetails-duplicate-history-rationale');
        expect(element.text()).toContain(mockHouseholdDuplicateFullData().duplicateStatusHistory[0].rationale);
      });
    });
  });
});
