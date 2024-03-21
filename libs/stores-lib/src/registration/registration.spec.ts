import { storeFactory } from '@/registration/registration';
import { ERegistrationMode } from '@libs/shared-lib/types';
import { setActivePinia } from 'pinia';
import { createTestingPinia } from '@pinia/testing';
import { RegistrationEvent } from '@libs/entities-lib/registration-event';
import { mockEventSummary } from '@libs/entities-lib/event';
import { mockShelterLocations } from '@libs/entities-lib/event/event.mock';
import {
  EIndigenousTypes, IdentitySet, mockGenders, mockIndigenousCommunitiesGetData, mockIndigenousTypesItems,
 mockIdentitySet,
 MemberDuplicateStatus,
 IIdentitySetData } from '@libs/entities-lib/value-objects/identity-set';
import { mockPreferredLanguages, mockPrimarySpokenLanguages } from '@libs/entities-lib/value-objects/contact-information';
import libHelpers from '@libs/entities-lib/helpers';
import {
  ECurrentAddressTypes,
  HouseholdCreate,
  Member,
  mockHouseholdCreate,
  mockHouseholdCreateData,
  mockMember,
  mockMemberData,
  mockSplitHousehold,
} from '@libs/entities-lib/household-create';
import { IRegistrationMenuItem, TabId } from '@libs/registration-lib/types/interfaces/IRegistrationMenuItem';
import { mockPublicService } from '@libs/services-lib/public';
import { mockHouseholdsService } from '@libs/services-lib/households/entity';
import { IHouseholdEntity, mockDetailedRegistrationResponse, mockHouseholdEntity } from '@libs/entities-lib/household';
import { Status } from '@libs/entities-lib/src/base';
import { PublishStatus } from '@libs/entities-lib/src/assessment-template';
import { mockCaseFilesService } from '@libs/services-lib/case-files/entity';
import _cloneDeep from 'lodash/cloneDeep';
import * as registrationUtils from './registrationUtils';
import { mockTabs } from './tabs.mock';

let useRegistrationStore = null as ReturnType<typeof storeFactory>;

const member = mockMember();
const publicApi = mockPublicService();
const householdApi = mockHouseholdsService();
const caseFileApi = mockCaseFilesService();

const initStore = (mode = ERegistrationMode.CRC, mockedInternalMethods?: any) => storeFactory({
  pTabs: mockTabs(),
  i18n: {
    t: jest.fn((s: string) => s),
  } as any,
  skipAgeRestriction: false,
  skipEmailPhoneRules: false,
  mode,
  publicApi,
  householdApi,
  caseFileApi,
  testMode: true,
  mockedInternalMethods,
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

    it('should return nothing is currentTab has no !disabled tabs before', () => {
      useRegistrationStore = initStore();
      useRegistrationStore.currentTabIndex = 1;
      useRegistrationStore.tabs[0].disabled = true;
      expect(useRegistrationStore.getPreviousTabName()).toBeFalsy();
    });
  });

  describe('isDuplicateError', () => {
    it('returns false if the error is not a duplicate of a kind', async () => {
      const errors = {
        response: {
          data: {
            errors: [
              { code: 'errors.some-code' },
            ],
          },
        },
      };
      useRegistrationStore = initStore();
      useRegistrationStore.registrationErrors = errors as any;
      expect(useRegistrationStore.isDuplicateError()).toEqual(false);
    });

    it('returns true if the duplicateresult is a match we cant process', async () => {
      const errors = {
        response: {
          data: {
            errors: [
              { code: 'errors.some-code' },
            ],
          },
        },
      };
      useRegistrationStore = initStore();
      useRegistrationStore.registrationErrors = errors as any;
      useRegistrationStore.duplicateResult = { duplicateFound: true, registeredToEvent: false, maskedEmail: 'xxx' };
      expect(useRegistrationStore.isDuplicateError()).toEqual(false);
      useRegistrationStore.duplicateResult = { duplicateFound: true, registeredToEvent: true, maskedEmail: 'xxx' };
      expect(useRegistrationStore.isDuplicateError()).toEqual(true);
      useRegistrationStore.duplicateResult = { duplicateFound: true, registeredToEvent: false };
      expect(useRegistrationStore.isDuplicateError()).toEqual(true);
    });

    it('returns true if the error is a duplicate of a kind', async () => {
      const errors = {
        response: {
          data: {
            errors: [
              { code: 'errors.the-beneficiary-have-duplicate-first-name-last-name-birthdate' },
            ],
          },
        },
      };
      useRegistrationStore = initStore();
      useRegistrationStore.registrationErrors = errors as any;
      expect(useRegistrationStore.isDuplicateError()).toEqual(true);
    });

    it('returns true if the error is a duplicate of a kind', async () => {
      const errors = {
        response: {
          data: {
            errors: [
              { code: 'errors.the-beneficiary-have-duplicate-first-name-last-name-phone-number' },
            ],
          },
        },
      };
      useRegistrationStore = initStore();
      useRegistrationStore.registrationErrors = errors as any;
      expect(useRegistrationStore.isDuplicateError()).toEqual(true);
    });

    it('returns true if the error is a duplicate of a kind', async () => {
      const errors = {
        response: {
          data: {
            errors: [
              { code: 'errors.the-household-have-duplicate-first-name-last-name-birthdate' },
            ],
          },
        },
      };
      useRegistrationStore = initStore();
      useRegistrationStore.registrationErrors = errors as any;
      expect(useRegistrationStore.isDuplicateError()).toEqual(true);
    });

    it('returns true if the error is a duplicate of a kind', async () => {
      const errors = {
        response: {
          data: {
            errors: [
              { code: 'errors.the-email-provided-already-exists-in-the-system' },
            ],
          },
        },
      };
      useRegistrationStore = initStore();
      useRegistrationStore.registrationErrors = errors as any;
      expect(useRegistrationStore.isDuplicateError()).toEqual(true);
    });

    it('returns true if the error is a duplicate of a kind', async () => {
      const errors = {
        response: {
          data: {
            errors: [
              { code: 'errors.person-identified-as-duplicate' },
            ],
          },
        },
      };
      useRegistrationStore = initStore();
      useRegistrationStore.registrationErrors = errors as any;
      expect(useRegistrationStore.isDuplicateError()).toEqual(true);
    });
  });

  describe('containsErrorCode', () => {
    it('should be true if an error is coming from the BE with a code', () => {
      const errors = {
        response: {
          data: {
            errors: [
              { code: 'errors.person-identified-as-duplicate' },
            ],
          },
        },
      };
      useRegistrationStore = initStore();
      useRegistrationStore.registrationErrors = errors as any;
      expect(useRegistrationStore.containsErrorCode()).toEqual(true);
    });
    it('should be false if an error does not have an error code', () => {
      const errors = {
        response: {
          data: {
            errors: [
              { code: '' },
            ],
          },
        },
      };
      useRegistrationStore = initStore();
      useRegistrationStore.registrationErrors = errors as any;
      expect(useRegistrationStore.containsErrorCode()).toEqual(false);
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

  describe('resetTabs', () => {
    it('should reset the tab state to default', () => {
      useRegistrationStore = initStore();
      useRegistrationStore.mutateTabAtIndex(1, (x) => {
        x.isTouched = true;
      });
      useRegistrationStore.resetTabs();
      expect(useRegistrationStore.tabs[1].isTouched).toEqual(false);
    });

    it('should uses the default passed to it', () => {
      useRegistrationStore = initStore();
      const newTabs = mockTabs();
      newTabs[1].isTouched = true;
      useRegistrationStore.setTabs(newTabs);
      useRegistrationStore.mutateTabAtIndex(2, (x) => {
        x.isTouched = true;
      });
      expect(useRegistrationStore.tabs[1].isTouched).toEqual(true);
      expect(useRegistrationStore.tabs[2].isTouched).toEqual(true);
      useRegistrationStore.resetTabs();
      expect(useRegistrationStore.tabs[1].isTouched).toEqual(true);
      expect(useRegistrationStore.tabs[2].isTouched).toEqual(false);
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

  describe('checkDuplicates', () => {
    it('calls isDuplicateMember on the household and set the result into the member identity set and the form passed as argument - primary member', async () => {
      useRegistrationStore = initStore();
      useRegistrationStore.setHouseholdCreate(mockHouseholdCreateData());
      useRegistrationStore.householdCreate.isDuplicateMember = jest.fn(() => true);
      const form = new IdentitySet({ ...mockIdentitySet(), firstName: 'a', lastName: 'b', birthDate: { year: '2000', month: '1', day: '1' } });

     const result = await useRegistrationStore.checkDuplicates({ form, isPrimaryMember: true });
      expect(useRegistrationStore.householdCreate.isDuplicateMember)
      .toHaveBeenCalledWith({ ...form,
      dateOfBirth: libHelpers.getBirthDateUTCString({ year: '2000', month: '1', day: '1' }),
      duplicateStatusInCurrentHousehold: undefined }, true, -1, '');
      expect(form.duplicateStatusInCurrentHousehold).toBe(MemberDuplicateStatus.Duplicate);
      expect(useRegistrationStore.householdCreate.primaryBeneficiary.identitySet.duplicateStatusInCurrentHousehold).toBe(MemberDuplicateStatus.Duplicate);
      expect(result).toBe(true);
    });

    it('calls isDuplicateMember on the household and set the result into the member identity set and the form passed as argument - additional member', async () => {
      useRegistrationStore = initStore();
      useRegistrationStore.setHouseholdCreate(mockHouseholdCreateData());
      useRegistrationStore.householdCreate.additionalMembers = [mockMember()];
      useRegistrationStore.householdCreate.isDuplicateMember = jest.fn(() => true);
      const form = new IdentitySet({ ...mockIdentitySet(), firstName: 'a', lastName: 'b', birthDate: { year: '2000', month: '1', day: '1' } });

      const result = await useRegistrationStore.checkDuplicates({ form, isPrimaryMember: false, index: 0 });
      expect(useRegistrationStore.householdCreate.isDuplicateMember)
      .toHaveBeenCalledWith({ ...form,
      dateOfBirth: libHelpers.getBirthDateUTCString({ year: '2000', month: '1', day: '1' }),
      duplicateStatusInCurrentHousehold: undefined }, false, 0, '');
      expect(form.duplicateStatusInCurrentHousehold).toBe(MemberDuplicateStatus.Duplicate);
      expect(useRegistrationStore.householdCreate.additionalMembers[0].identitySet.duplicateStatusInCurrentHousehold).toBe(MemberDuplicateStatus.Duplicate);
      expect(result).toBe(true);
    });

    it(
      // eslint-disable-next-line vue/max-len
'calls household service checkForPossibleDuplicatePublic and set the result into the member identity set and the form passed as argument, if isDuplicateMember returns false - primary member',
    async () => {
      useRegistrationStore = initStore();
      useRegistrationStore.setHouseholdCreate(mockHouseholdCreate({ id: '123' }));
      useRegistrationStore.householdCreate.isDuplicateMember = jest.fn(() => false);
      householdApi.checkForPossibleDuplicatePublic = jest.fn(() => ({ duplicateFound: true, duplicateHouseholdId: '123', registeredToEvent: false }));
      const form = new IdentitySet({ ...mockIdentitySet(), firstName: 'a', lastName: 'b', birthDate: { year: '2000', month: '1', day: '1' } });

     const result = await useRegistrationStore.checkDuplicates({ form, isPrimaryMember: true });
      const member = new Member();
      member.setIdentity(new IdentitySet({ ...form,
      dateOfBirth: libHelpers.getBirthDateUTCString({ year: '2000', month: '1', day: '1' }),
      duplicateStatusInDb: undefined } as IIdentitySetData));
      expect(householdApi.checkForPossibleDuplicatePublic).toHaveBeenCalledWith(null, member, '123');
      expect(form.duplicateStatusInDb).toBe(MemberDuplicateStatus.Duplicate);
      expect(useRegistrationStore.householdCreate.primaryBeneficiary.identitySet.duplicateStatusInDb).toBe(MemberDuplicateStatus.Duplicate);
      expect(result).toBe(true);
    },
);

    it(
      // eslint-disable-next-line vue/max-len
'calls household service checkForPossibleDuplicatePublic and set the result into the member identity set and the form passed as argument, if isDuplicateMember returns false - additional member',
    async () => {
      useRegistrationStore = initStore();
      useRegistrationStore.setHouseholdCreate(mockHouseholdCreate({ id: '123' }));
      useRegistrationStore.householdCreate.additionalMembers = [mockMember()];
      useRegistrationStore.householdCreate.isDuplicateMember = jest.fn(() => false);
      householdApi.checkForPossibleDuplicatePublic = jest.fn(() => ({ duplicateFound: true, duplicateHouseholdId: '123', registeredToEvent: false }));
      const form = new IdentitySet({ ...mockIdentitySet(), firstName: 'a', lastName: 'b', birthDate: { year: '2000', month: '1', day: '1' } });

     const result = await useRegistrationStore.checkDuplicates({ form, isPrimaryMember: false, index: 0 });
      const member = new Member();
      member.setIdentity(new IdentitySet({ ...form,
      dateOfBirth: libHelpers.getBirthDateUTCString({ year: '2000', month: '1', day: '1' }),
      duplicateStatusInDb: undefined } as IIdentitySetData));
      expect(householdApi.checkForPossibleDuplicatePublic)
      .toHaveBeenCalledWith(null, member, '123');
      expect(form.duplicateStatusInDb).toBe(MemberDuplicateStatus.Duplicate);
      expect(useRegistrationStore.householdCreate.additionalMembers[0].identitySet.duplicateStatusInDb).toBe(MemberDuplicateStatus.Duplicate);
      expect(result).toBe(true);
    },
);

    it('calls household service checkForPossibleDuplicatePublic and returns false if the result duplicateFound is false', async () => {
      useRegistrationStore = initStore();
      useRegistrationStore.setHouseholdCreate(mockHouseholdCreateData());
      useRegistrationStore.householdCreate.additionalMembers = [mockMember()];
      useRegistrationStore.householdCreate.isDuplicateMember = jest.fn(() => false);
      householdApi.checkForPossibleDuplicatePublic = jest.fn(() => ({ duplicateFound: false, duplicateHouseholdId: '12', registeredToEvent: false }));
      const form = new IdentitySet({ ...mockIdentitySet(), firstName: 'a', lastName: 'b', birthDate: { year: '2000', month: '1', day: '1' } });

      const result = await useRegistrationStore.checkDuplicates({ form, isPrimaryMember: false, index: 0 });
      expect(result).toBe(false);
    });

    it('does not call household service checkForPossibleDuplicatePublic if passed the param preventDbCheck', async () => {
      useRegistrationStore = initStore();
      useRegistrationStore.setHouseholdCreate(mockHouseholdCreateData());
      useRegistrationStore.householdCreate.additionalMembers = [mockMember()];
      useRegistrationStore.householdCreate.isDuplicateMember = jest.fn(() => false);
      householdApi.checkForPossibleDuplicatePublic = jest.fn();
      const form = new IdentitySet({ ...mockIdentitySet(), firstName: 'a', lastName: 'b', birthDate: { year: '2000', month: '1', day: '1' } });

      await useRegistrationStore.checkDuplicates({ form, isPrimaryMember: false, index: 0, preventDbCheck: true });
      expect(householdApi.checkForPossibleDuplicatePublic).not.toHaveBeenCalledWith(null, member);
    });
  });

  describe('fetchEvent', () => {
    it('calls the getEvent service', async () => {
      useRegistrationStore = initStore();
      expect(publicApi.fetchRegistrationEvent).toHaveBeenCalledTimes(0);

      await useRegistrationStore.fetchEvent('en', 'link');

      expect(publicApi.fetchRegistrationEvent).toHaveBeenCalledTimes(1);
    });

    it('maps IEventSummary to IEvent, and sets the event', async () => {
      useRegistrationStore = initStore();
      expect(useRegistrationStore.getEvent()).toEqual(new RegistrationEvent());

      await useRegistrationStore.fetchEvent('en', 'link');

      expect(useRegistrationStore.getEvent()).toEqual(mockEventSummary());
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
      useRegistrationStore.event = mockEventSummary();
      await useRegistrationStore.fetchIndigenousCommunities();
      expect(householdApi.getIndigenousCommunities).toHaveBeenCalledTimes(1);
    });
  });

  describe('submitRegistration', () => {
    it('should call proper service for CRC Registration', async () => {
      useRegistrationStore = initStore();
      useRegistrationStore.event = mockEventSummary();
      await useRegistrationStore.submitRegistration();
      expect(householdApi.submitRegistration).toHaveBeenCalledTimes(0);
      expect(householdApi.submitCRCRegistration).toHaveBeenCalledTimes(1);
      expect(householdApi.submitCRCRegistration).toHaveBeenCalledWith(useRegistrationStore.householdCreate, useRegistrationStore.event.id);
      expect(useRegistrationStore.tier2State.mustDoTier2).toBeFalsy();
    });

    it('should call proper service for Self Registration', async () => {
      useRegistrationStore = initStore(ERegistrationMode.Self);
      useRegistrationStore.event = mockEventSummary();
      await useRegistrationStore.submitRegistration();
      expect(householdApi.submitRegistration).toHaveBeenCalledTimes(1);
      expect(householdApi.submitCRCRegistration).toHaveBeenCalledTimes(0);

      expect(householdApi.submitRegistration).toHaveBeenCalledWith({
        household: useRegistrationStore.householdCreate,
        eventId: mockEventSummary().id,
      });
    });

    it('sets registrationResponse in case of success', async () => {
      useRegistrationStore = initStore();
      expect(useRegistrationStore.registrationResponse).toBeNull();

      useRegistrationStore.event = mockEventSummary();

      await useRegistrationStore.submitRegistration();

      expect(useRegistrationStore.registrationResponse).toStrictEqual(mockDetailedRegistrationResponse());
    });

    it('sets registrationErrors in case of error', async () => {
      useRegistrationStore = initStore(ERegistrationMode.Self);
      const error = { response: { data: { errors: 'mock-errors' } } };
      useRegistrationStore.event = mockEventSummary();
      householdApi.submitRegistration = jest.fn(() => {
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw error;
      });
      await useRegistrationStore.submitRegistration();
      expect(useRegistrationStore.registrationErrors).toEqual({ response: { data: { errors: 'mock-errors' } } });
    });

    it('adds tier2Tab if required by result', async () => {
      useRegistrationStore = initStore(ERegistrationMode.Self);
      useRegistrationStore.event = mockEventSummary();
      await useRegistrationStore.submitRegistration();
      expect(useRegistrationStore.tabs.find((x) => x.id === TabId.Tier2auth)).toBeFalsy();
      householdApi.submitRegistration = jest.fn(() => ({
        ...mockDetailedRegistrationResponse(), mustDoTier2authentication: true,
      }));
      await useRegistrationStore.submitRegistration();
      expect(useRegistrationStore.tabs.find((x) => x.id === TabId.Tier2auth)).toBeTruthy();
      expect(useRegistrationStore.tier2State.mustDoTier2).toBeTruthy();
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
        false,
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
        false,
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

      expect(householdApi.updatePersonAddress).toHaveBeenCalledWith(member.id, false, member.currentAddress);
    });

    it('calls the right mutation when member is primary', async () => {
      useRegistrationStore = initStore();
      const member = mockMember();
      const isPrimaryMember = true;
      householdApi.updatePersonAddress = jest.fn(() => mockMember({ id: '1' }));
      useRegistrationStore.householdCreate.setPrimaryBeneficiary = jest.fn();

      await useRegistrationStore.updatePersonAddress({ member, isPrimaryMember });

      expect(useRegistrationStore.householdCreate.setPrimaryBeneficiary).toHaveBeenCalledWith(mockMember({ id: '1' }));
    });

    it('call the updatePersonAddress service and mutation with proper params when member is not primary and sameAddress is false', async () => {
      useRegistrationStore = initStore();
      const result = mockMember({ id: '1' });
      householdApi.updatePersonAddress = jest.fn(() => result);
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
      useRegistrationStore.internalMethods.addShelterLocationData = jest.fn(() => Promise.resolve([result]));

      await useRegistrationStore.updatePersonAddress({
        member, isPrimaryMember, index, sameAddress,
      });

      expect(householdApi.updatePersonAddress).toHaveBeenCalledWith(member.id, false, member.currentAddress);
      expect(useRegistrationStore.internalMethods.addShelterLocationData).toHaveBeenCalledWith([result]);
      expect(useRegistrationStore.householdCreate.additionalMembers[0].currentAddress).toEqual(mockMember({ id: '1' }).currentAddress);
    });

    it('call the updatePersonAddress service and mutation with proper params when member is not primary and sameAddress is true', async () => {
      useRegistrationStore = initStore();
      const result = mockMember({ id: '1' });
      householdApi.updatePersonAddress = jest.fn(() => result);
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
      useRegistrationStore.internalMethods.addShelterLocationData = jest.fn(() => Promise.resolve([result]));

      await useRegistrationStore.updatePersonAddress({
        member, isPrimaryMember, index, sameAddress,
      });

      expect(householdApi.updatePersonAddress).toHaveBeenCalledWith(member.id, false, {
        ...mockMember().currentAddress,
        addressType: ECurrentAddressTypes.Other,
      });
      expect(useRegistrationStore.internalMethods.addShelterLocationData).toHaveBeenCalledWith([result]);

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

      expect(householdApi.addMember).toHaveBeenCalledWith(householdId, false, member);
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

      expect(householdApi.deleteAdditionalMember).toHaveBeenCalledWith(householdId, false, memberId);
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
      useRegistrationStore.event = mockEventSummary({ id: 'event-id' });
      await useRegistrationStore.splitHousehold();
      expect(householdApi.splitHousehold).toHaveBeenCalledWith(mockHouseholdCreate(), mockSplitHousehold().originHouseholdId, 'event-id');
    });

    it('call the mutation setRegistrationResponse after the resolution', async () => {
      useRegistrationStore = initStore();
      householdApi.splitHousehold = jest.fn(() => (mockDetailedRegistrationResponse()));
      useRegistrationStore.householdCreate = mockHouseholdCreate() as HouseholdCreate;
      useRegistrationStore.splitHouseholdState = mockSplitHousehold();
      useRegistrationStore.event = mockEventSummary({ id: 'event-id' });
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
      useRegistrationStore.event = mockEventSummary({ id: 'event-id' });

      await useRegistrationStore.splitHousehold();
      expect(useRegistrationStore.registrationErrors).toEqual(new Error());
    });
  });

  describe('setAssessmentToComplete', () => {
    it('sets assessmentToComplete and adjusts tabs', () => {
      useRegistrationStore = initStore(ERegistrationMode.Self);
      useRegistrationStore.setAssessmentToComplete(null);
      expect(useRegistrationStore.assessmentToComplete).toEqual(null);
      expect(useRegistrationStore.tabs).not.toEqual(useRegistrationStore.allTabs);
      expect(useRegistrationStore.tabs).toEqual(useRegistrationStore.allTabs.filter((t) => t.id !== TabId.Assessment));

      const assessment = { assessmentForm: { status: Status.Active, publishStatus: PublishStatus.Unpublished } };
      useRegistrationStore.setAssessmentToComplete(assessment as any);

      expect(useRegistrationStore.assessmentToComplete).toEqual(assessment);
      expect(useRegistrationStore.tabs).toEqual(useRegistrationStore.allTabs.filter((t) => t.id !== TabId.Assessment));

      assessment.assessmentForm.publishStatus = PublishStatus.Published;
      useRegistrationStore.setAssessmentToComplete(assessment as any);

      expect(useRegistrationStore.assessmentToComplete).toEqual(assessment);
      const allTabsWithNextLabel = _cloneDeep(useRegistrationStore.allTabs);
      allTabsWithNextLabel.find((t) => t.id === TabId.Confirmation).nextButtonTextKey = 'common.button.next';
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

  describe('fetchMembersInformation', () => {
    it('should fetch information of each member', async () => {
      useRegistrationStore = initStore();
      const household = {
        primaryBeneficiary: '1',
        members: ['1', '2'],
      } as IHouseholdEntity;
      const shelterLocations = mockShelterLocations();
      await useRegistrationStore.internalMethods.fetchMembersInformation(household, shelterLocations);
      expect(householdApi.getPerson).toHaveBeenCalledWith('1');
      expect(householdApi.getPerson).toHaveBeenCalledWith('2');
    });

    it('calls addShelterLocationData  with the member result of the storage call', async () => {
      const addShelterLocationData = jest.fn(() => [member]);
      useRegistrationStore = initStore(ERegistrationMode.CRC, { addShelterLocationData });
      const household = {
        primaryBeneficiary: '1',
        members: ['1'],
      } as IHouseholdEntity;
      const shelterLocations = mockShelterLocations();
      householdApi.getPerson = jest.fn(() => member);

      await useRegistrationStore.internalMethods.fetchMembersInformation(household, shelterLocations);
      expect(addShelterLocationData).toHaveBeenCalledWith([member], shelterLocations);
    });
  });

  describe('parseIdentitySet', () => {
    it('should rebuild identity of member', () => {
      useRegistrationStore = initStore();
      const member = mockMemberData();
      const communities = mockIndigenousCommunitiesGetData();
      const genderItems = mockGenders();

      member.identitySet.indigenousIdentity = {
        indigenousCommunityId: communities[0].id,
      };

      member.identitySet.gender.optionItemId = genderItems[0].id;

      const res = useRegistrationStore.internalMethods.parseIdentitySet(member, communities, genderItems);
      expect(res).toEqual({
        birthDate: {
          day: '12',
          month: 2,
          year: '1999',
        },
        gender: {
          id: '676eb98b-d432-4924-90ee-2489e3acdc26',
          isDefault: false,
          isOther: false,
          restrictFinancial: false,
          name: {
            translation: {
              en: 'Female',
              fr: 'Femme',
            },
          },
          orderRank: 0,
          status: 1,
        },
        genderOther: undefined,
        indigenousCommunityId: '434be79f-6713-0847-a0d9-c6bd7f9f12f5',
        indigenousType: 1,
        indigenousCommunityOther: undefined,
      });
    });

    describe('getShelterLocationDatafromId', () => {
      it('returns the shelterLocation data from the parameters if it finds one', async () => {
        useRegistrationStore = initStore();
        expect(await useRegistrationStore.internalMethods.getShelterLocationDatafromId('sl-1', [{ id: 'sl-1', name: 'SL-1' } as any])).toEqual({ id: 'sl-1', name: 'SL-1' });
      });

      it('calls the events search with the right filter if it does not find the shelter in the parameters and stores the result in otherShelterLocations', async () => {
        useRegistrationStore = initStore();
        publicApi.searchEvents = jest.fn(() => ({ value: [{ shelterLocations: [{ id: 'sl-1', name: 'SL-1' }] }] } as any));
        await useRegistrationStore.internalMethods.getShelterLocationDatafromId('sl-1', []);
        expect(publicApi.searchEvents).toHaveBeenCalledWith({
          filter: {
            ShelterLocations: {
              any: { Id: { value: 'sl-1', type: 'guid' } },
            },
          },
        });
        expect(useRegistrationStore.storeShelterLocations).toEqual([{ id: 'sl-1', name: 'SL-1' }]);
      });
    });
  });

  describe('addShelterLocationData', () => {
    it('calls getShelterLocationDatafromId and stores the data in the right place in the member object, if the member has a shelterLocationId', async () => {
      const getShelterLocationDatafromId = jest.fn(() => ({ id: 'sl-1', name: 'SL 1' }));
      useRegistrationStore = initStore(ERegistrationMode.Self, { getShelterLocationDatafromId });

      const members = [{ currentAddress: { shelterLocationId: 'sl-1' }, addressHistory: [{ shelterLocationId: 'sl-1' }] }] as any[];
      const result = await useRegistrationStore.internalMethods.addShelterLocationData(members, []);
      expect(getShelterLocationDatafromId).toHaveBeenCalledWith('sl-1', []);
      expect(result).toEqual(
        [{
          currentAddress: { shelterLocationId: 'sl-1', shelterLocation: { id: 'sl-1', name: 'SL 1' } },
          addressHistory: [{ shelterLocationId: 'sl-1', shelterLocation: { id: 'sl-1', name: 'SL 1' } }],
        }],
      );
    });
  });

  describe('parseContactInformation', () => {
    it('should rebuild contact information of member', () => {
      useRegistrationStore = initStore();
      const member = mockMemberData();
      const preferredLanguagesItems = mockPreferredLanguages();
      const primarySpokenLanguagesItems = mockPrimarySpokenLanguages();

      member.contactInformation.preferredLanguage.optionItemId = preferredLanguagesItems[0].id;
      member.contactInformation.primarySpokenLanguage.optionItemId = primarySpokenLanguagesItems[0].id;

      const res = useRegistrationStore.internalMethods.parseContactInformation(member, preferredLanguagesItems, primarySpokenLanguagesItems);
      expect(res).toEqual({
        alternatePhoneNumber: {
          countryCode: 'CA',
          e164Number: '15145454548',
          extension: '1234',
          number: '(438) 888-8888',
        },
        homePhoneNumber: {
          countryCode: 'CA',
          e164Number: '15145454548',
          number: '(514) 545-4548',
        },
        mobilePhoneNumber: {
          countryCode: 'CA',
          e164Number: '15145454548',
          number: '(866) 866-6666',
        },
        preferredLanguage: {
          id: '3dd21738-e599-443a-aae1-496d7decc458',
          isDefault: false,
          isOther: false,
          restrictFinancial: false,
          name: {
            translation: {
              en: 'French',
              fr: 'Français',
            },
          },
          orderRank: 0,
          status: 1,
        },
        primarySpokenLanguage: {
          id: '5d0c1c8d-c3cd-4818-a670-c92b3cb84081',
          isDefault: true,
          isOther: false,
          restrictFinancial: false,
          name: {
            translation: {
              en: 'English',
              fr: 'Anglais',
            },
          },
          orderRank: 0,
          status: 1,
        },
        preferredLanguageOther: '',
        primarySpokenLanguageOther: '',
      });
    });
  });

  describe('buildHouseholdCreateData', () => {
    it('should call fetchMembersInformation', async () => {
      const fetchMembersInformation = jest.fn(() => []);
      const parseIdentitySet = jest.fn();
      const parseContactInformation = jest.fn();
      useRegistrationStore = initStore(ERegistrationMode.CRC, { fetchMembersInformation, parseIdentitySet, parseContactInformation });
      const household = mockHouseholdEntity();
      await useRegistrationStore.buildHouseholdCreateData(household);

      expect(fetchMembersInformation).toHaveBeenCalledWith(household, undefined);
    });

    it('should return the final object of household to be used in the UI', async () => {
      const parseIdentitySet = jest.fn(() => 'identitySet');
      const parseContactInformation = jest.fn(() => 'contact');
      useRegistrationStore = initStore(ERegistrationMode.CRC, { parseIdentitySet, parseContactInformation });

      const expected = {
        registrationNumber: '12345',
        additionalMembers: [],
        consentInformation: {
          crcUserName: '',
          registrationLocationId: '',
          registrationMethod: null,
          privacyDateTimeConsent: '',
        },
        homeAddress: {
          city: 'New York',
          country: 'USA',
          latitude: 90,
          longitude: 180,
          postalCode: '123456',
          province: 1,
          specifiedOtherProvince: 'string',
          streetAddress: 'West str.',
          unitSuite: '100',
        },
        noFixedHome: false,
        primaryBeneficiary: {
          contactInformation: 'contact',
          currentAddress: {
            address: {
              city: 'Ottawa',
              country: 'CA',
              latitude: 0,
              longitude: 0,
              postalCode: 'K1W 1G7',
              province: 9,
              streetAddress: '247 Some Street',
              unitSuite: '123',
            },
            addressType: 2,
            placeName: 'test',
            placeNumber: '',
          },
          identitySet: 'identitySet',
        },
      } as any;

      const household = mockHouseholdEntity();
      household.registrationNumber = '12345';

      const res = await useRegistrationStore.buildHouseholdCreateData(household);

      expect(res).toMatchObject(expected);
    });
  });

  describe('loadHousehold', () => {
    it('sets householdCreate from the api and sets consent information', async () => {
      useRegistrationStore = initStore(ERegistrationMode.Self);
      const consent = {} as any;
      useRegistrationStore.householdCreate.consentInformation = consent;
      useRegistrationStore.householdCreate.primaryBeneficiary.contactInformation.emailValidatedByBackend = false;

      const result = await useRegistrationStore.loadHousehold('someid');
      expect(householdApi.publicGetHousehold).toHaveBeenCalledWith('someid');
      expect(result).toEqual(useRegistrationStore.householdCreate);
      expect(result.consentInformation).toBe(consent);
      expect(result.primaryBeneficiary.contactInformation.emailValidatedByBackend).toBeTruthy();
    });
  });
});
