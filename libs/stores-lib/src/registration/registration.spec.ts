import { storeFactory } from '@/registration/registration';
import { ERegistrationMode } from '@libs/shared-lib/types';
import { setActivePinia } from 'pinia';
import { createTestingPinia } from '@pinia/testing';
import { mockEvent, mockEventData, RegistrationEvent } from '@libs/entities-lib/registration-event';
import {
 EIndigenousTypes, mockGenders, mockIndigenousCommunitiesGetData, mockIndigenousTypesItems,
} from '@libs/entities-lib/value-objects/identity-set';
import { mockPreferredLanguages, mockPrimarySpokenLanguages } from '@libs/entities-lib/value-objects/contact-information';
import {
  ECurrentAddressTypes,
  HouseholdCreate,
  Member,
  mockHouseholdCreate,
  mockHouseholdCreateData,
  mockMember,
  mockSplitHousehold,
} from '@libs/entities-lib/household-create';
import { IRegistrationMenuItem } from '@libs/registration-lib/types';
import { mockPublicService } from '@libs/services-lib/public';
import { mockHouseholdsService } from '@libs/services-lib/households/entity';
import { mockDetailedRegistrationResponse, mockHouseholdEntity } from '@libs/entities-lib/household';
import { Status } from '@libs/entities-lib/src/base';
import { PublishStatus } from '@libs/entities-lib/src/assessment-template';
import _cloneDeep from 'lodash/cloneDeep';
import * as registrationUtils from './registrationUtils';
import { mockTabs } from './tabs.mock';

let useRegistrationStore = null as ReturnType<typeof storeFactory>;

const publicApi = mockPublicService();
const householdApi = mockHouseholdsService();

const initStore = (mode = ERegistrationMode.CRC) => storeFactory({
  pTabs: mockTabs(),
  i18n: {
    t: jest.fn((s: string) => s),
  } as any,
  skipAgeRestriction: false,
  skipEmailPhoneRules: false,
  mode,
  publicApi,
  householdApi,
});
// eslint-disable-next-line max-statements
describe('>>> Registration Store', () => {
  beforeEach(() => {
    setActivePinia(createTestingPinia({ stubActions: false }));
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('isCRCRegistration', () => {
    it('should return true if mode is CRC', () => {
      useRegistrationStore = initStore();
      expect(useRegistrationStore.isCRCRegistration()).toBe(true);
    });
    it('should return false if mode is Self', async () => {
      useRegistrationStore = initStore(ERegistrationMode.Self);
      expect(useRegistrationStore.isCRCRegistration()).toBe(false);
    });
  });

  describe('getEvent', () => {
    it('should return a default event', () => {
      useRegistrationStore = initStore();
      expect(useRegistrationStore.getEvent()).toEqual(new RegistrationEvent());
    });
  });

  describe('getCurrentTab', () => {
    it('should return current tab', () => {
      useRegistrationStore = initStore();
      useRegistrationStore.currentTabIndex = 1;
      expect(useRegistrationStore.getCurrentTab()).toEqual(useRegistrationStore.tabs[1]);
    });
  });

  describe('getPreviousTabName', () => {
    it('should return previousTabName', () => {
      useRegistrationStore = initStore();
      useRegistrationStore.currentTabIndex = 1;
      expect(useRegistrationStore.getPreviousTabName()).toEqual(useRegistrationStore.tabs[0].titleKey);
    });

    it('should return registration.privacy_statement.start_registration if currentTab is 0', () => {
      useRegistrationStore = initStore();
      useRegistrationStore.currentTabIndex = 0;
      expect(useRegistrationStore.getPreviousTabName()).toEqual('registration.privacy_statement.start_registration');
    });

    it('should return nothing is currentTab is confirmation one', () => {
      useRegistrationStore = initStore();
      useRegistrationStore.currentTabIndex = 1;
      useRegistrationStore.tabs[1].id = 'confirmation';
      expect(useRegistrationStore.getPreviousTabName()).toEqual('');
    });
  });

  describe('getNextTabName', () => {
    it('should return the next tab', () => {
      useRegistrationStore = initStore();
      expect(useRegistrationStore.getNextTabName()).toEqual(useRegistrationStore.tabs[1].titleKey);
    });
  });

  describe('getGenders', () => {
    it('returns active genders', () => {
      useRegistrationStore = initStore();
      expect(useRegistrationStore.getGenders()).toEqual([]);

      useRegistrationStore.genders = mockGenders();
      expect(useRegistrationStore.getGenders().length).toEqual(3);
      expect(useRegistrationStore.getGenders(false).length).toEqual(3);
    });

    it('returns active and inactive genders', () => {
      useRegistrationStore = initStore();
      expect(useRegistrationStore.getGenders()).toEqual([]);

      useRegistrationStore.genders = mockGenders();
      expect(useRegistrationStore.getGenders(true).length).toEqual(4);
    });
  });

  describe('getPreferredLanguages', () => {
    it('returns preferredLanguages', () => {
      useRegistrationStore = initStore();
      expect(useRegistrationStore.getPreferredLanguages()).toEqual([]);
      useRegistrationStore.preferredLanguages = mockPreferredLanguages();
      expect(useRegistrationStore.getPreferredLanguages()).toEqual(mockPreferredLanguages());
    });
  });

  describe('getPrimarySpokenLanguages', () => {
    it('returns active primarySpokenLanguages', () => {
      useRegistrationStore = initStore();
      expect(useRegistrationStore.getPrimarySpokenLanguages()).toEqual([]);

      useRegistrationStore.primarySpokenLanguages = mockPrimarySpokenLanguages();
      expect(useRegistrationStore.getPrimarySpokenLanguages().length).toEqual(3);
      expect(useRegistrationStore.getPrimarySpokenLanguages(false).length).toEqual(3);
    });

    it('returns active and inactive primarySpokenLanguages', () => {
      useRegistrationStore = initStore();
      expect(useRegistrationStore.getPrimarySpokenLanguages()).toEqual([]);

      useRegistrationStore.primarySpokenLanguages = mockPrimarySpokenLanguages();
      expect(useRegistrationStore.getPrimarySpokenLanguages(true).length).toEqual(4);
    });
  });

  describe('getIndigenousTypesItems', () => {
    it('returns indigenousTypesItems', () => {
      useRegistrationStore = initStore();
      useRegistrationStore.indigenousCommunities = mockIndigenousCommunitiesGetData();
      expect(useRegistrationStore.getIndigenousTypesItems()).toEqual(mockIndigenousTypesItems());
    });
  });

  describe('getIndigenousCommunitiesItems', () => {
    it('returns indigenousCommunitiesItems with other first', () => {
      useRegistrationStore = initStore();
      useRegistrationStore.indigenousCommunities = mockIndigenousCommunitiesGetData();
      expect(useRegistrationStore.getIndigenousCommunitiesItems(EIndigenousTypes.Metis))
        .toEqual([
          {
            text: 'Other',
            value: 'other_id_metis',
          },
          {
            text: 'Metis',
            value: '',
          },
        ]);
    });

    it('returns indigenousCommunitiesItems with other first', () => {
      useRegistrationStore = initStore();
      useRegistrationStore.indigenousCommunities = mockIndigenousCommunitiesGetData();
      expect(useRegistrationStore.getIndigenousCommunitiesItems(EIndigenousTypes.FirstNation))
        .toEqual([
          {
            text: 'Other',
            value: 'other_id_firstNation',
          },
          {
            text: 'Eel River Bar First Nation',
            value: '434be79f-6713-0847-a0d9-c6bd7f9f12f5',
          },
          {
            text: "Metepenagiag Mi'kmaq Nation",
            value: 'c68b30e0-e348-544d-ba7e-7e8486972774',
          },
        ]);
    });
  });

  describe('findEffectiveJumpIndex', () => {
    beforeEach(() => {
      useRegistrationStore.householdCreate = new HouseholdCreate(mockHouseholdCreate());
      jest.spyOn(registrationUtils, 'isRegisteredValid').mockReturnValue(true);
      useRegistrationStore = initStore();
    });

    it('returns the target index when moving backwards', async () => {
      useRegistrationStore.currentTabIndex = 2;
      useRegistrationStore.householdCreate.noFixedHome = false;
      expect(useRegistrationStore.findEffectiveJumpIndex(1)).toEqual(1);
      expect(useRegistrationStore.findEffectiveJumpIndex(0)).toEqual(0);
    });

    it('returns the current index when no change', async () => {
      useRegistrationStore.householdCreate.noFixedHome = false;
      expect(useRegistrationStore.findEffectiveJumpIndex(0)).toEqual(0);
    });

    it('stops on the invalid PrivacyStatement form', async () => {
      jest.spyOn(registrationUtils, 'privacyStatementValid').mockReturnValue(false);
      expect(useRegistrationStore.findEffectiveJumpIndex(6)).toEqual(0);
    });

    it('stops on the invalid PersonalInformation form', async () => {
      jest.spyOn(registrationUtils, 'privacyStatementValid').mockReturnValue(true);
      jest.spyOn(registrationUtils, 'personalInformationValid').mockReturnValue(false);
      expect(useRegistrationStore.findEffectiveJumpIndex(6)).toEqual(1);
    });

    it('stops on the invalid Addresses form', async () => {
      jest.spyOn(registrationUtils, 'privacyStatementValid').mockReturnValue(true);
      jest.spyOn(registrationUtils, 'personalInformationValid').mockReturnValue(true);
      jest.spyOn(registrationUtils, 'addressesValid').mockReturnValue(false);
      expect(useRegistrationStore.findEffectiveJumpIndex(6)).toEqual(2);
    });

    it('stops on the invalid Household Members form', async () => {
      jest.spyOn(registrationUtils, 'privacyStatementValid').mockReturnValue(true);
      jest.spyOn(registrationUtils, 'personalInformationValid').mockReturnValue(true);
      jest.spyOn(registrationUtils, 'addressesValid').mockReturnValue(true);
      jest.spyOn(registrationUtils, 'additionalMembersValid').mockReturnValue(false);

      expect(useRegistrationStore.findEffectiveJumpIndex(6)).toEqual(3);
    });

    it('returns target index when all forms valid', async () => {
      jest.spyOn(registrationUtils, 'privacyStatementValid').mockReturnValue(true);
      jest.spyOn(registrationUtils, 'personalInformationValid').mockReturnValue(true);
      jest.spyOn(registrationUtils, 'addressesValid').mockReturnValue(true);
      jest.spyOn(registrationUtils, 'additionalMembersValid').mockReturnValue(true);

      expect(useRegistrationStore.findEffectiveJumpIndex(6)).toEqual(6);
    });
  });

  describe('mutateCurrentTab', () => {
    it('mutates current tab', () => {
      useRegistrationStore = initStore();
      expect(useRegistrationStore.getCurrentTab().isValid).toBeTruthy();

      useRegistrationStore.mutateCurrentTab((tab: IRegistrationMenuItem) => {
        tab.isValid = false;
      });

      expect(useRegistrationStore.getCurrentTab().isValid).toBeFalsy();
    });
  });

  describe('mutateTabAtIndex', () => {
    it('mutates tab at index', () => {
      useRegistrationStore = initStore();
      expect(useRegistrationStore.tabs[3].isValid).toBeTruthy();

      useRegistrationStore.mutateTabAtIndex(3, (tab: IRegistrationMenuItem) => {
        tab.isValid = false;
      });

      expect(useRegistrationStore.tabs[3].isValid).toBeFalsy();
    });
  });

  describe('jump', () => {
    it('set current tab to be touched', async () => {
      useRegistrationStore = initStore();
      const currentIndex = 0;
      const toIndex = 2;

      expect(useRegistrationStore.tabs[currentIndex].isTouched).toBeFalsy();

      await useRegistrationStore.jump(toIndex);

      expect(useRegistrationStore.tabs[currentIndex].isTouched).toBeTruthy();
    });

    it('update the index of current tab', async () => {
      useRegistrationStore = initStore();
      expect(useRegistrationStore.currentTabIndex).toEqual(0);

      const toIndex = 2;

      await useRegistrationStore.jump(toIndex);

      expect(useRegistrationStore.currentTabIndex).toEqual(toIndex);
    });

    it('if target index is out of array bounds, stay at current tab', async () => {
      useRegistrationStore = initStore();
      expect(useRegistrationStore.currentTabIndex).toEqual(0);

      let toIndex = -1;
      await useRegistrationStore.jump(toIndex);
      expect(useRegistrationStore.currentTabIndex).toEqual(0);

      toIndex = 10;
      await useRegistrationStore.jump(toIndex);
      expect(useRegistrationStore.currentTabIndex).toEqual(0);

      toIndex = mockTabs().length;
      await useRegistrationStore.jump(toIndex);
      expect(useRegistrationStore.currentTabIndex).toEqual(0);
    });
  });

  describe('increaseInlineEditCounter', () => {
    it('should increase the inline counter', () => {
      useRegistrationStore = initStore();
      useRegistrationStore.increaseInlineEditCounter();
      expect(useRegistrationStore.inlineEditCounter).toEqual(1);
    });
  });

  describe('decreaseInlineEditCounter', () => {
    it('should increase the inline counter', () => {
      useRegistrationStore = initStore();
      useRegistrationStore.decreaseInlineEditCounter();
      expect(useRegistrationStore.inlineEditCounter).toEqual(0);

      useRegistrationStore.increaseInlineEditCounter();

      useRegistrationStore.decreaseInlineEditCounter();
      expect(useRegistrationStore.inlineEditCounter).toEqual(0);
    });
  });

  describe('setHouseholdCreate', () => {
    it('should set householdCreate', () => {
      useRegistrationStore = initStore();
      useRegistrationStore.setHouseholdCreate(mockHouseholdCreateData());
      expect(useRegistrationStore.householdCreate).toEqual(new HouseholdCreate(mockHouseholdCreateData()));
    });
  });

  describe('resetHouseholdCreate', () => {
    it('should reset the state to default', () => {
      useRegistrationStore = initStore();
      useRegistrationStore.householdCreate.setPrimaryBeneficiary(mockMember());
      useRegistrationStore.resetHouseholdCreate();
      expect(useRegistrationStore.householdCreate).toEqual(new HouseholdCreate());
    });
  });

  describe('setSplitHousehold', () => {
    it('should set splitHousehold', () => {
      useRegistrationStore = initStore();
      const { originHouseholdId } = mockSplitHousehold();
      const { primaryMember } = mockSplitHousehold().splitMembers;
      const { additionalMembers } = mockSplitHousehold().splitMembers;
      useRegistrationStore.setSplitHousehold({ originHouseholdId, primaryMember, additionalMembers });
      expect(useRegistrationStore.splitHouseholdState).toEqual(mockSplitHousehold());
    });
  });

  describe('resetSplitHousehold', () => {
    it('should reset splitHousehold', () => {
      useRegistrationStore = initStore();
      useRegistrationStore.resetSplitHousehold();
      expect(useRegistrationStore.splitHouseholdState).toEqual(null);
      expect(useRegistrationStore.event).toEqual(null);
      expect(useRegistrationStore.registrationErrors).toEqual(null);
      expect(useRegistrationStore.registrationResponse).toEqual(null);
      expect(useRegistrationStore.currentTabIndex).toEqual(0);
      expect(useRegistrationStore.isPrivacyAgreed).toEqual(false);
      expect(useRegistrationStore.householdResultsShown).toEqual(false);
    });
  });

  describe('fetchEvent', () => {
    it('calls the getEvent service', async () => {
      useRegistrationStore = initStore();
      expect(publicApi.fetchRegistrationEvent).toHaveBeenCalledTimes(0);

      await useRegistrationStore.fetchEvent('en', 'link');

      expect(publicApi.fetchRegistrationEvent).toHaveBeenCalledTimes(1);
    });

    it('maps IEventData to IEvent, and sets the event', async () => {
      useRegistrationStore = initStore();
      expect(useRegistrationStore.getEvent()).toEqual(new RegistrationEvent());

      await useRegistrationStore.fetchEvent('en', 'link');

      expect(useRegistrationStore.getEvent()).toEqual(mockEvent());
    });
  });

  describe('fetchGenders', () => {
    it('call the getGenders service', async () => {
      useRegistrationStore = initStore();
      await useRegistrationStore.fetchGenders();

      expect(householdApi.getGenders).toHaveBeenCalledTimes(1);
    });

    it('sets the genders', async () => {
      useRegistrationStore = initStore();
      expect(useRegistrationStore.genders).toEqual([]);

      await useRegistrationStore.fetchGenders();

      expect(useRegistrationStore.genders).toEqual(mockGenders());
    });
  });

  describe('fetchPreferredLanguages', () => {
    it('call the getPreferredLanguages service', async () => {
      useRegistrationStore = initStore();
      await useRegistrationStore.fetchPreferredLanguages();

      expect(householdApi.getPreferredLanguages).toHaveBeenCalledTimes(1);
    });

    it('sets the preferredLanguages', async () => {
      useRegistrationStore = initStore();
      expect(useRegistrationStore.preferredLanguages).toEqual([]);

      await useRegistrationStore.fetchPreferredLanguages();

      expect(useRegistrationStore.preferredLanguages).toEqual(mockPreferredLanguages());
    });
  });

  describe('fetchIndigenousCommunities', () => {
    it('call the getIndigenousCommunities service with proper params', async () => {
      useRegistrationStore = initStore();
      useRegistrationStore.event = mockEventData();
      await useRegistrationStore.fetchIndigenousCommunities();
      expect(householdApi.getIndigenousCommunities).toHaveBeenCalledTimes(1);
    });
  });

  describe('submitRegistration', () => {
    it('should call proper service for CRC Registration', async () => {
      useRegistrationStore = initStore();
      useRegistrationStore.event = mockEventData();
      await useRegistrationStore.submitRegistration();
      expect(householdApi.submitRegistration).toHaveBeenCalledTimes(0);
      expect(householdApi.submitCRCRegistration).toHaveBeenCalledTimes(1);
      expect(householdApi.submitCRCRegistration).toHaveBeenCalledWith(useRegistrationStore.householdCreate, useRegistrationStore.event.id);
    });

    it('should call proper service for Self Registration', async () => {
      useRegistrationStore = initStore(ERegistrationMode.Self);
      useRegistrationStore.event = mockEventData();
      await useRegistrationStore.submitRegistration('recaptchaToken');
      expect(householdApi.submitRegistration).toHaveBeenCalledTimes(1);
      expect(householdApi.submitCRCRegistration).toHaveBeenCalledTimes(0);

      expect(householdApi.submitRegistration).toHaveBeenCalledWith({
        household: useRegistrationStore.householdCreate,
        eventId: mockEventData().id,
        recaptchaToken: 'recaptchaToken',
      });
    });

    it('sets registrationResponse in case of success', async () => {
      useRegistrationStore = initStore();
      expect(useRegistrationStore.registrationResponse).toBeNull();

      useRegistrationStore.event = mockEventData();

      await useRegistrationStore.submitRegistration();

      expect(useRegistrationStore.registrationResponse).toStrictEqual(mockDetailedRegistrationResponse());
    });

    it('sets registrationErrors in case of error', async () => {
      useRegistrationStore = initStore(ERegistrationMode.Self);
      const error = { response: { data: { errors: 'mock-errors' } } };
      useRegistrationStore.event = mockEventData();
      householdApi.submitRegistration = jest.fn(() => {
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw error;
      });
      await useRegistrationStore.submitRegistration();
      expect(useRegistrationStore.registrationErrors).toEqual({ response: { data: { errors: 'mock-errors' } } });
    });
  });

  describe('updatePersonContactInformation', () => {
    it('call the updatePersonContactInformation service with proper params', async () => {
      useRegistrationStore = initStore();
      const member = mockMember();
      const isPrimaryMember = false;
      const index = 1;

      useRegistrationStore.householdCreate.editAdditionalMember = jest.fn();
      await useRegistrationStore.updatePersonContactInformation({ member, isPrimaryMember, index });

      expect(householdApi.updatePersonContactInformation).toHaveBeenCalledWith(
        member.id,
        { contactInformation: member.contactInformation, identitySet: member.identitySet, isPrimaryBeneficiary: isPrimaryMember },
      );
    });

    it('should update information when member is primary', async () => {
      useRegistrationStore = initStore();
      const member = mockMember();
      const isPrimaryMember = true;
      householdApi.updatePersonContactInformation = jest.fn(() => ({ id: 'foo' })) as any;

      await useRegistrationStore.updatePersonContactInformation({ member, isPrimaryMember });

      expect(useRegistrationStore.householdCreate.primaryBeneficiary.contactInformation).toEqual(member.contactInformation);
      expect(useRegistrationStore.householdCreate.primaryBeneficiary.identitySet).toEqual(member.identitySet);
    });

    it('should update information when member is not primary', async () => {
      useRegistrationStore = initStore();
      const member = mockMember();
      const isPrimaryMember = false;
      const index = 0;
      householdApi.updatePersonContactInformation = jest.fn(() => ({ id: 'foo' })) as any;

      await useRegistrationStore.updatePersonContactInformation({ member, isPrimaryMember, index });

      expect(useRegistrationStore.householdCreate.additionalMembers[0].contactInformation).toEqual(member.contactInformation);
      expect(useRegistrationStore.householdCreate.additionalMembers[0].identitySet).toEqual(member.identitySet);
      expect(useRegistrationStore.householdCreate.additionalMembers[0].currentAddress).not.toEqual(useRegistrationStore.householdCreate.primaryBeneficiary.currentAddress);
    });
  });

  describe('updatePersonIdentity', () => {
    it('call the updatePersonIdentity service with proper params', async () => {
      useRegistrationStore = initStore();
      const member = mockMember();
      const isPrimaryMember = false;
      const index = 1;

      useRegistrationStore.householdCreate.editAdditionalMember = jest.fn();
      await useRegistrationStore.updatePersonIdentity({ member, isPrimaryMember, index });

      expect(householdApi.updatePersonIdentity).toHaveBeenCalledWith(
        member.id,
        { identitySet: member.identitySet, contactInformation: member.contactInformation },
      );
    });

    it('calls the right mutation when member is primary', async () => {
      useRegistrationStore = initStore();
      const member = mockMember();
      const isPrimaryMember = true;
      householdApi.updatePersonIdentity = jest.fn(() => ({ id: 'foo' })) as any;

      await useRegistrationStore.updatePersonIdentity({ member, isPrimaryMember });

      expect(useRegistrationStore.householdCreate.primaryBeneficiary.contactInformation).toEqual(member.contactInformation);
      expect(useRegistrationStore.householdCreate.primaryBeneficiary.identitySet).toEqual(member.identitySet);
    });

    it('calls the right mutation when member is not primary', async () => {
      useRegistrationStore = initStore();
      const member = mockMember();
      const isPrimaryMember = false;
      const index = 0;
      householdApi.updatePersonIdentity = jest.fn(() => ({ id: 'foo' })) as any;

      await useRegistrationStore.updatePersonIdentity({ member, isPrimaryMember, index });

      expect(useRegistrationStore.householdCreate.additionalMembers[0].contactInformation).toEqual(member.contactInformation);
      expect(useRegistrationStore.householdCreate.additionalMembers[0].identitySet).toEqual(member.identitySet);
      expect(useRegistrationStore.householdCreate.additionalMembers[0].currentAddress).not.toEqual(useRegistrationStore.householdCreate.primaryBeneficiary.currentAddress);
    });
  });

  describe('updatePersonAddress', () => {
    it('call the updatePersonAddress service with proper params if the member is primary', async () => {
      useRegistrationStore = initStore();
      const member = mockMember();
      const isPrimaryMember = true;

      await useRegistrationStore.updatePersonAddress({ member, isPrimaryMember });

      expect(householdApi.updatePersonAddress).toHaveBeenCalledWith(member.id, member.currentAddress);
    });

    it('calls the right mutation when member is primary', async () => {
      useRegistrationStore = initStore();
      const member = mockMember();
      const isPrimaryMember = true;
      householdApi.updatePersonAddress = jest.fn(() => ({ id: 'foo' })) as any;
      useRegistrationStore.householdCreate.setCurrentAddress = jest.fn();

      await useRegistrationStore.updatePersonAddress({ member, isPrimaryMember });

      expect(useRegistrationStore.householdCreate.setCurrentAddress).toHaveBeenCalledWith(member.currentAddress);
    });

    it('call the updatePersonAddress service and mutation with proper params when member is not primary and sameAddress is false', async () => {
      useRegistrationStore = initStore();
      useRegistrationStore.householdCreate.additionalMembers[0] = mockMember({
        currentAddress: {
          ...mockMember().currentAddress,
          addressType: ECurrentAddressTypes.Other,
        },
      });
      const member = mockMember();
      const isPrimaryMember = false;
      const index = 0;
      const sameAddress = false;

      await useRegistrationStore.updatePersonAddress({
        member, isPrimaryMember, index, sameAddress,
      });

      expect(householdApi.updatePersonAddress).toHaveBeenCalledWith(member.id, member.currentAddress);
      expect(useRegistrationStore.householdCreate.additionalMembers[0].currentAddress).toEqual(member.currentAddress);
    });

    it('call the updatePersonAddress service and mutation with proper params when member is not primary and sameAddress is true', async () => {
      useRegistrationStore = initStore();
      useRegistrationStore.householdCreate.primaryBeneficiary = mockMember({
        currentAddress: {
          ...mockMember().currentAddress,
          addressType: ECurrentAddressTypes.Other,
        },
      });
      const member = mockMember();
      const isPrimaryMember = false;
      const index = 0;
      const sameAddress = true;

      await useRegistrationStore.updatePersonAddress({
        member, isPrimaryMember, index, sameAddress,
      });

      expect(householdApi.updatePersonAddress).toHaveBeenCalledWith(member.id, {
        ...mockMember().currentAddress,
        addressType: ECurrentAddressTypes.Other,
      });
      expect(useRegistrationStore.householdCreate.additionalMembers[0].currentAddress).toEqual(useRegistrationStore.householdCreate.primaryBeneficiary.currentAddress);
    });
  });

  describe('addAdditionalMember', () => {
    it('call the addAdditionalMember service with proper params', async () => {
      useRegistrationStore = initStore();
      const member = mockMember();
      const householdId = 'test';
      const sameAddress = true;
      householdApi.addMember = jest.fn(() => (mockHouseholdEntity()));

      await useRegistrationStore.addAdditionalMember({ householdId, member, sameAddress });

      expect(householdApi.addMember).toHaveBeenCalledWith(householdId, member);
    });

    it('call the mutation after the resolution', async () => {
      useRegistrationStore = initStore();
      const member = mockMember();
      const householdId = 'test';
      const sameAddress = true;
      const mockhousehold = mockHouseholdEntity();
      householdApi.addMember = jest.fn(() => (mockHouseholdEntity()));

      await useRegistrationStore.addAdditionalMember({
        householdId,
        member,
        sameAddress,
      });
      expect(useRegistrationStore.householdCreate.additionalMembers[0])
        .toEqual(
          new Member({
            ...member,
            id: mockhousehold.members[mockhousehold.members.length - 1],
          }),
        );
    });
  });

  describe('deleteAdditionalMember', () => {
    it('call the deleteAdditionalMember service with proper params', async () => {
      useRegistrationStore = initStore();
      const memberId = mockMember().id;
      const householdId = 'test';
      const index = 0;
      householdApi.deleteAdditionalMember = jest.fn(() => (mockHouseholdEntity()));

      await useRegistrationStore.deleteAdditionalMember({ householdId, memberId, index });

      expect(householdApi.deleteAdditionalMember).toHaveBeenCalledWith(householdId, memberId);
    });

    it('removes the member', async () => {
      useRegistrationStore = initStore();
      useRegistrationStore.householdCreate.additionalMembers[0] = mockMember();
      const memberId = mockMember().id;
      const householdId = 'test';
      const index = 0;
      householdApi.deleteAdditionalMember = jest.fn(() => (mockHouseholdEntity()));

      await useRegistrationStore.deleteAdditionalMember({ householdId, memberId, index });

      expect(useRegistrationStore.householdCreate.additionalMembers.length).toEqual(0);
    });
  });

  describe('splitHousehold', () => {
    it('call the splitHousehold service with proper params', async () => {
      useRegistrationStore = initStore();
      householdApi.splitHousehold = jest.fn(() => (mockDetailedRegistrationResponse()));
      useRegistrationStore.householdCreate = mockHouseholdCreate() as HouseholdCreate;
      useRegistrationStore.splitHouseholdState = mockSplitHousehold();
      useRegistrationStore.event = mockEvent({ id: 'event-id' });
      await useRegistrationStore.splitHousehold();
      expect(householdApi.splitHousehold).toHaveBeenCalledWith(mockHouseholdCreate(), mockSplitHousehold().originHouseholdId, 'event-id');
    });

    it('call the mutation setRegistrationResponse after the resolution', async () => {
      useRegistrationStore = initStore();
      householdApi.splitHousehold = jest.fn(() => (mockDetailedRegistrationResponse()));
      useRegistrationStore.householdCreate = mockHouseholdCreate() as HouseholdCreate;
      useRegistrationStore.splitHouseholdState = mockSplitHousehold();
      useRegistrationStore.event = mockEvent({ id: 'event-id' });
      await useRegistrationStore.splitHousehold();
     expect(useRegistrationStore.registrationResponse).toEqual(mockDetailedRegistrationResponse());
    });

    it('call the mutation setRegistrationErrors if the call ', async () => {
      useRegistrationStore = initStore();
      householdApi.splitHousehold = jest.fn(() => {
        throw new Error();
      });
      useRegistrationStore.householdCreate = mockHouseholdCreate() as HouseholdCreate;
      useRegistrationStore.splitHouseholdState = mockSplitHousehold();
      useRegistrationStore.event = mockEvent({ id: 'event-id' });

      await useRegistrationStore.splitHousehold();
      expect(useRegistrationStore.registrationErrors).toEqual(new Error());
    });
  });

  describe('setAssessmentToComplete', () => {
    // TODO Ask MAD to review this
    it('sets assessmentToComplete and adjusts tabs', () => {
      useRegistrationStore = initStore(ERegistrationMode.Self);
      useRegistrationStore.setAssessmentToComplete(null);
      expect(useRegistrationStore.assessmentToComplete).toEqual(null);
      expect(useRegistrationStore.tabs).not.toEqual(useRegistrationStore.allTabs);
      expect(useRegistrationStore.tabs).toEqual(useRegistrationStore.allTabs.filter((t) => t.id !== 'assessment'));

      const assessment = { assessmentForm: { status: Status.Active, publishStatus: PublishStatus.Unpublished } };
      useRegistrationStore.setAssessmentToComplete(assessment as any);

      expect(useRegistrationStore.assessmentToComplete).toEqual(assessment);
      expect(useRegistrationStore.tabs).toEqual(useRegistrationStore.allTabs.filter((t) => t.id !== 'assessment'));

      assessment.assessmentForm.publishStatus = PublishStatus.Published;
      useRegistrationStore.setAssessmentToComplete(assessment as any);

      expect(useRegistrationStore.assessmentToComplete).toEqual(assessment);
      const allTabsWithNextLabel = _cloneDeep(useRegistrationStore.allTabs);
      allTabsWithNextLabel.find((t) => t.id === 'confirmation').nextButtonTextKey = 'common.button.next';
      expect(useRegistrationStore.tabs).toEqual(allTabsWithNextLabel);

      setActivePinia(createTestingPinia({ stubActions: false }));
      useRegistrationStore = initStore(ERegistrationMode.CRC);
      useRegistrationStore.setAssessmentToComplete(assessment as any);

      expect(useRegistrationStore.assessmentToComplete).toEqual(assessment);
      expect(useRegistrationStore.tabs).toEqual(useRegistrationStore.allTabs);

      assessment.assessmentForm.publishStatus = PublishStatus.Unpublished;
      useRegistrationStore.setAssessmentToComplete(assessment as any);

      expect(useRegistrationStore.assessmentToComplete).toEqual(assessment);
      expect(useRegistrationStore.tabs).toEqual(useRegistrationStore.allTabs);
    });
  });
});
