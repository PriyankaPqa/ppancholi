import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { DuplicateStatus, mockHouseholdDuplicateFullData, DuplicateReason, mockPotentialDuplicateEntity } from '@libs/entities-lib/potential-duplicate';
import routes from '@/constants/routes';
import householdHelpers from '@/ui/helpers/household';
import { mockProvider } from '@/services/provider';
import { getPiniaForUser } from '@/pinia/user/user.mock';
import { useMockPotentialDuplicateStore } from '@/pinia/potential-duplicate/potential-duplicate.mock';
import { system } from '@/constants/system';
import helpers from '@/ui/helpers/helpers';
import { UserRoles } from '@libs/entities-lib/user';
import Component from './ManageDuplicatesTable.vue';

const localVue = createLocalVue();
const services = mockProvider();

const { pinia, potentialDuplicateStore } = useMockPotentialDuplicateStore();
const duplicates = [
  mockHouseholdDuplicateFullData({
    id: '1',
    duplicateStatus: DuplicateStatus.Potential,
    duplicateHousehold: {
      householdId: 'hh-id',
      primaryBeneficiaryFullName: 'Jane Doe',
      registrationNumber: 'registration-number',
      caseFiles: [{ caseFileNumber: 'case-file-number', eventName: { translation: { en: 'event-name' } } }],
    },
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
        const duplicate = duplicates[0];
        expect(wrapper.vm.getHouseholdRoute(duplicate)).toEqual({
          name: routes.household.householdProfile.name,
          params: { id: 'hh-id' },
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
        wrapper.vm.actionedDuplicate = { householdIds: [duplicateHouseholdId, wrapper.vm.currentHouseholdId], id: potentialDuplicateId };

        await wrapper.vm.submitAction(arg);
        expect(potentialDuplicateStore.flagDuplicate).toHaveBeenCalledWith(potentialDuplicateId, rationale);
      });

      it('calls service resolveDuplicate if status is Resolved', async () => {
        doMount();
        const rationale = 'rationale';
        const duplicateHouseholdId = 'householdId';
        const potentialDuplicateId = 'potentialDuplicateId';
        const arg = { status: DuplicateStatus.Resolved, rationale };
        wrapper.vm.actionedDuplicate = { householdIds: [duplicateHouseholdId, wrapper.vm.currentHouseholdId], id: potentialDuplicateId };

        await wrapper.vm.submitAction(arg);
        expect(potentialDuplicateStore.resolveDuplicate).toHaveBeenCalledWith(potentialDuplicateId, rationale);
      });

      it('resets actionedDuplicate and emits fetchDuplicates if call is successful', async () => {
        doMount();
        wrapper.vm.$emit = jest.fn();
        const arg = { status: DuplicateStatus.Resolved, rationale: 'rationale' };
        wrapper.vm.actionedDuplicate = { householdIds: ['hh-id', wrapper.vm.currentHouseholdId], id: 'id' };
        await wrapper.vm.submitAction(arg);
        expect(wrapper.vm.actionedDuplicate).toEqual(null);
      });
    });

    describe('isFlaggedByTheSystem', () => {
      it('returns true if the user has the system user id', () => {
        doMount();
        const result = wrapper.vm.isFlaggedByTheSystem({ ...mockPotentialDuplicateEntity().duplicateStatusHistory, userInformation: { userId: system.system_user_id } });
        expect(result).toBeTruthy();
      });
      it('returns false if the user does not have the system user id', () => {
        doMount();
        const result = wrapper.vm.isFlaggedByTheSystem({ ...mockPotentialDuplicateEntity().duplicateStatusHistory, userInformation: { userId: '1' } });
        expect(result).toBeFalsy();
      });
      it('returns false if there is no user information', () => {
        doMount();
        const result = wrapper.vm.isFlaggedByTheSystem({ ...mockPotentialDuplicateEntity().duplicateStatusHistory, userInformation: null });
        expect(result).toBeFalsy();
      });
    });

    describe('getRationale', () => {
      it('returns the rationale if the user is not system', async () => {
        await doMount();
        const historyItem = mockPotentialDuplicateEntity().duplicateStatusHistory;
        expect(wrapper.vm.getRationale(historyItem)).toEqual(historyItem.rationale);
      });

      it('returns the right text if the user is not system and status is potential', async () => {
        await doMount({ computed: {
          isFlaggedByTheSystem() {
            return true;
          },
        } });
        const historyItem = { ...mockPotentialDuplicateEntity().duplicateStatusHistory,
          userInformation: { userId: system.system_user_id },
          duplicateStatus: DuplicateStatus.Potential,
        };
        expect(wrapper.vm.getRationale(historyItem)).toEqual('householdDetails.manageDuplicates.flaggedByTheSystem');
      });

      it('returns the right text if the user is not system and status is Resolved', async () => {
        await doMount({ computed: {
          isFlaggedByTheSystem() {
            return true;
          },
        } });
        const historyItem = { ...mockPotentialDuplicateEntity().duplicateStatusHistory,
          userInformation: { userId: system.system_user_id },
          duplicateStatus: DuplicateStatus.Resolved,
        };
        expect(wrapper.vm.getRationale(historyItem)).toEqual('householdDetails.manageDuplicates.resolvedByTheSystem');
      });

      it('returns the right text if the rationale is Resolved by the system', async () => {
        await doMount();
        const historyItem = { ...mockPotentialDuplicateEntity().duplicateStatusHistory,
          rationale: 'Resolved by the system',
          duplicateStatus: DuplicateStatus.Resolved,
        };
        expect(wrapper.vm.getRationale(historyItem)).toEqual('householdDetails.manageDuplicates.resolvedByTheSystem');
      });

      it('returns the right text if the rationale is Flagged by the system', async () => {
        await doMount();
        const historyItem = { ...mockPotentialDuplicateEntity().duplicateStatusHistory,
          rationale: 'Flagged by the system',
          duplicateStatus: DuplicateStatus.Potential,
        };
        expect(wrapper.vm.getRationale(historyItem)).toEqual('householdDetails.manageDuplicates.flaggedByTheSystem');
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
          [mockHouseholdDuplicateFullData({ duplicateReasons: [DuplicateReason.HomePhoneNumber], duplicateHousehold: { homePhoneNumber: { number: 'home-phone' } } })] });
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
          [mockHouseholdDuplicateFullData({ duplicateReasons: [DuplicateReason.MobilePhoneNumber], duplicateHousehold: { mobilePhoneNumber: { number: 'mobile-phone' } } })] });
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
          [mockHouseholdDuplicateFullData({ duplicateReasons: [DuplicateReason.AlternatePhoneNumber],
            duplicateHousehold: { alternatePhoneNumber: { number: 'alternate-phone' } } })] });
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
        expect(element.text()).toContain('Jan 18, 2023');
      });

      it('contains the right data if the user is system', async () => {
        const duplicateFlaggedByTheSystem = mockHouseholdDuplicateFullData({
          duplicateStatusHistory: [{ ...mockPotentialDuplicateEntity().duplicateStatusHistory[0], userInformation: { userId: system.system_user_id } }],
        });
        doMount(false, { propsData: { ...propsData, duplicates: [duplicateFlaggedByTheSystem] } });
        const element = wrapper.findDataTest('householdDetails-duplicate-history-user');
        expect(element.text()).toContain('system.system_user_id');
        expect(element.text()).not.toContain(mockHouseholdDuplicateFullData().duplicateStatusHistory[0].userInformation.roleName.translation.en);
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

      it('contains the right data if the user is system', async () => {
        const duplicateFlaggedByTheSystem = mockHouseholdDuplicateFullData({
          duplicateStatusHistory: [{ ...mockPotentialDuplicateEntity().duplicateStatusHistory[0], userInformation: { userId: system.system_user_id } }],
        });
        doMount(false, { propsData: { ...propsData, duplicates: [duplicateFlaggedByTheSystem] } });
        const element = wrapper.findDataTest('householdDetails-duplicate-history-rationale');
        expect(element.text()).toContain('householdDetails.manageDuplicates.flaggedByTheSystem');
      });
    });
  });
});
