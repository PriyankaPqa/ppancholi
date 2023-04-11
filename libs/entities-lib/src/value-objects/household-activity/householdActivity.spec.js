import helpers from '@/helpers';
import { HouseholdActivity, mockHouseholdActivities, HouseholdActivityType } from './index';
import { Address } from '../address';
import { mockCampGround, mockShelter } from '../current-address';

const i18n = {
  t: jest.fn((t) => t),
};

const activity = mockHouseholdActivities()[0];
describe('>>> Household Activity', () => {
  describe('>> constructor', () => {
    it('should instantiate householdId', () => {
      const historyActivity = new HouseholdActivity(activity);
      expect(historyActivity.householdId).toBe(activity.householdId);
    });

    it('should instantiate timestamp', () => {
      const historyActivity = new HouseholdActivity(activity);
      expect(historyActivity.timestamp).toBe(activity.timestamp);
    });

    it('should instantiate user', () => {
      const historyActivity = new HouseholdActivity(activity);
      expect(historyActivity.user).toEqual(activity.user);
    });

    it('should instantiate role', () => {
      const historyActivity = new HouseholdActivity(activity);
      expect(historyActivity.role).toEqual(activity.role);
    });

    it('should instantiate activityType', () => {
      const historyActivity = new HouseholdActivity(activity);
      expect(historyActivity.activityType).toEqual(activity.activityType);
    });
    it('should instantiate newDetails', () => {
      const historyActivity = new HouseholdActivity(activity);
      expect(historyActivity.newDetails).toEqual(activity.newDetails);
    });
    it('should instantiate newDetails', () => {
      const historyActivity = new HouseholdActivity(activity);
      expect(historyActivity.newDetails).toEqual(activity.newDetails);
    });
    it('should instantiate previousDetails', () => {
      const historyActivity = new HouseholdActivity(activity);
      expect(historyActivity.previousDetails).toEqual(activity.previousDetails);
    });
  });

  describe('getActivityName', () => {
    it('returns the right data if activity type is IdentitySetEdited', () => {
      const activity = mockHouseholdActivities(HouseholdActivityType.IdentitySetEdited)[0];
      const historyActivity = new HouseholdActivity(activity);
      expect(historyActivity.getActivityName()).toEqual('household.history.action.personal_information_changed');
    });
    it('returns the right data if activity type is ContactInformationEdited', () => {
      const activity = mockHouseholdActivities(HouseholdActivityType.ContactInformationEdited)[0];
      const historyActivity = new HouseholdActivity(activity);
      expect(historyActivity.getActivityName()).toEqual('household.history.action.contact_information_changed');
    });
    it('returns the right data if activity type is MemberAdded', () => {
      const activity = mockHouseholdActivities(HouseholdActivityType.MemberAdded)[0];
      const historyActivity = new HouseholdActivity(activity);
      expect(historyActivity.getActivityName()).toEqual('household.history.action.household_member_added');
    });
    it('returns the right data if activity type is MemberRemoved', () => {
      const activity = mockHouseholdActivities(HouseholdActivityType.MemberRemoved)[0];
      const historyActivity = new HouseholdActivity(activity);
      expect(historyActivity.getActivityName()).toEqual('household.history.action.household_member_removed');
    });
    it('returns the right data if activity type is OriginalHouseholdSplit', () => {
      const activity = mockHouseholdActivities(HouseholdActivityType.OriginalHouseholdSplit)[0];
      const historyActivity = new HouseholdActivity(activity);
      expect(historyActivity.getActivityName()).toEqual('household.history.action.household_member_split');
    });
    it('returns the right data if activity type is HouseholdMoved', () => {
      const activity = mockHouseholdActivities(HouseholdActivityType.HouseholdMoved)[0];
      const historyActivity = new HouseholdActivity(activity);
      expect(historyActivity.getActivityName()).toEqual('household.history.action.household_member_moved');
    });
    it('returns the right data if activity type is HomeAddressEdited', () => {
      const activity = mockHouseholdActivities(HouseholdActivityType.HomeAddressEdited)[0];
      const historyActivity = new HouseholdActivity(activity);
      expect(historyActivity.getActivityName()).toEqual('household.history.action.address_information_changed');
    });
    it('returns the right data if activity type is TempAddressEdited', () => {
      const activity = mockHouseholdActivities(HouseholdActivityType.TempAddressEdited)[0];
      const historyActivity = new HouseholdActivity(activity);
      expect(historyActivity.getActivityName()).toEqual('household.history.action.temporary_address_changed');
    });
    it('returns the right data if activity type is PrimaryAssigned', () => {
      const activity = mockHouseholdActivities(HouseholdActivityType.PrimaryAssigned)[0];
      const historyActivity = new HouseholdActivity(activity);
      expect(historyActivity.getActivityName()).toEqual('household.history.action.household_member_assign_primary');
    });
    it('returns the right data if activity type is StatusChanged', () => {
      const activity = mockHouseholdActivities(HouseholdActivityType.StatusChanged)[0];
      const historyActivity = new HouseholdActivity(activity);
      expect(historyActivity.getActivityName()).toEqual('household.history.action.household_status_changed');
    });
  });

  describe('getTemplateData', () => {
    it('calls makeContactInfoTemplate if activity type is ContactInformationEdited ', () => {
      const activity = mockHouseholdActivities(HouseholdActivityType.ContactInformationEdited)[0];
      const historyActivity = new HouseholdActivity(activity);

      historyActivity.makeContactInfoTemplate = jest.fn();
      historyActivity.getTemplateData(true, i18n);
      expect(historyActivity.makeContactInfoTemplate).toHaveBeenCalledWith(historyActivity.previousDetails, i18n);
    });

    it('calls makePersonalInfoTemplate if activity type is IdentitySetEdited ', () => {
      const activity = mockHouseholdActivities(HouseholdActivityType.IdentitySetEdited)[0];
      const historyActivity = new HouseholdActivity(activity);

      historyActivity.makePersonalInfoTemplate = jest.fn();
      historyActivity.getTemplateData(true, i18n);
      expect(historyActivity.makePersonalInfoTemplate).toHaveBeenCalledWith(historyActivity.previousDetails, i18n);
    });

    it('calls makeFullMemberTemplate for the current entity if activity is MemberAdded', () => {
      const activity = mockHouseholdActivities(HouseholdActivityType.MemberAdded)[0];
      const historyActivity = new HouseholdActivity(activity);
      historyActivity.makeFullMemberTemplate = jest.fn();
      historyActivity.getTemplateData(false, i18n);

      expect(historyActivity.makeFullMemberTemplate).toHaveBeenCalledWith(historyActivity.newDetails, i18n);
    });

    it('calls makeEmptyTemplate for the previous entity if activity is MemberAdded', () => {
      const activity = mockHouseholdActivities(HouseholdActivityType.MemberAdded)[0];
      const historyActivity = new HouseholdActivity(activity);
      historyActivity.makeEmptyTemplate = jest.fn();
      historyActivity.getTemplateData(true, i18n);

      expect(historyActivity.makeEmptyTemplate).toHaveBeenCalled();
    });

    it('calls makeFullMemberTemplate for the previous entity if activity is MemberRemoved', () => {
      const activity = mockHouseholdActivities(HouseholdActivityType.MemberRemoved)[0];
      const historyActivity = new HouseholdActivity(activity);
      historyActivity.makeFullMemberTemplate = jest.fn();
      historyActivity.getTemplateData(true, i18n);

      expect(historyActivity.makeFullMemberTemplate).toHaveBeenCalledWith(historyActivity.previousDetails, i18n);
    });

    it('calls makeEmptyTemplate for the new entity if activity is MemberRemoved', () => {
      const activity = mockHouseholdActivities(HouseholdActivityType.MemberRemoved)[0];
      const historyActivity = new HouseholdActivity(activity);
      historyActivity.makeEmptyTemplate = jest.fn();
      historyActivity.getTemplateData(false, i18n);

      expect(historyActivity.makeEmptyTemplate).toHaveBeenCalled();
    });

    it('calls makeMultipleMembersTemplate if activity is OriginalHouseholdSplit', () => {
      const activity = mockHouseholdActivities(HouseholdActivityType.OriginalHouseholdSplit)[0];
      const historyActivity = new HouseholdActivity(activity);
      historyActivity.makeMultipleMembersTemplate = jest.fn();
      historyActivity.getTemplateData(true, i18n);

      expect(historyActivity.makeMultipleMembersTemplate).toHaveBeenCalledWith(historyActivity.previousDetails.memberDetails, i18n);
    });

    it('calls makeMultipleMembersTemplate if activity is HouseholdMoved', () => {
      const activity = mockHouseholdActivities(HouseholdActivityType.HouseholdMoved)[0];
      const historyActivity = new HouseholdActivity(activity);
      historyActivity.makeMultipleMembersTemplate = jest.fn();
      historyActivity.getTemplateData(true, i18n);

      expect(historyActivity.makeMultipleMembersTemplate).toHaveBeenCalledWith(historyActivity.previousDetails.memberDetails, i18n);
    });

    it('calls makeHomeTemplate for the previous entity if activity is HomeAddressEdited', () => {
      const activity = mockHouseholdActivities(HouseholdActivityType.HomeAddressEdited)[0];
      const historyActivity = new HouseholdActivity(activity);
      historyActivity.makeHomeTemplate = jest.fn();
      historyActivity.getTemplateData(true, i18n);

      expect(historyActivity.makeHomeTemplate).toHaveBeenCalledWith(historyActivity.previousDetails.address, i18n);
    });

    it('calls makeMemberNameTemplate and makeTemporaryAddressTemplate if activity is TempAddressEdited ', () => {
      const activity = mockHouseholdActivities(HouseholdActivityType.TempAddressEdited)[0];
      const historyActivity = new HouseholdActivity(activity);
      historyActivity.makeMemberNameTemplate = jest.fn(() => ([]));
      historyActivity.makeTemporaryAddressTemplate = jest.fn(() => ([]));
      historyActivity.getTemplateData(true, i18n);
      expect(historyActivity.makeMemberNameTemplate).toHaveBeenCalledWith(historyActivity.previousDetails.personFullName);
      expect(historyActivity.makeTemporaryAddressTemplate).toHaveBeenCalledWith(historyActivity.previousDetails, i18n);
    });

    it('calls makePrimaryTemplate for the current entity if activity PrimaryAssigned', () => {
      const activity = mockHouseholdActivities(HouseholdActivityType.PrimaryAssigned)[0];
      const historyActivity = new HouseholdActivity(activity);
      historyActivity.makePrimaryTemplate = jest.fn();
      historyActivity.getTemplateData(false, i18n);

      expect(historyActivity.makePrimaryTemplate).toHaveBeenCalledWith(historyActivity.newDetails);
    });

    it('calls makeEmptyTemplate for the current entity if entity type is not known', () => {
      const activity = { ...mockHouseholdActivities()[0], activityType: 'foo' };
      const historyActivity = new HouseholdActivity(activity);
      historyActivity.makeEmptyTemplate = jest.fn();
      historyActivity.getTemplateData(false, i18n);
      expect(historyActivity.makeEmptyTemplate).toHaveBeenCalled();
    });

    it('calls makeStatusTemplate if activity type is StatusChanged ', () => {
      const activity = mockHouseholdActivities(HouseholdActivityType.StatusChanged)[0];
      const historyActivity = new HouseholdActivity(activity);

      historyActivity.makeStatusTemplate = jest.fn();
      historyActivity.getTemplateData(true, i18n);
      expect(historyActivity.makeStatusTemplate).toHaveBeenCalledWith(historyActivity.previousDetails, i18n);
    });
  });

  describe('makeHomeTemplate', () => {
    it('calls the helper getAddressLines and returns the right data', () => {
      const activity = mockHouseholdActivities(HouseholdActivityType.HomeAddressEdited)[0];
      const historyActivity = new HouseholdActivity(activity);

      jest.spyOn(helpers, 'getAddressLines').mockImplementation(() => (['120 East Str.', '12345, NY, New York', 'USA']));
      const expected = historyActivity.makeHomeTemplate(activity.previousDetails.address, i18n);
      expect(helpers.getAddressLines).toHaveBeenCalledWith(new Address(activity.previousDetails.address), i18n);
      expect(expected).toEqual([{ label: 'household.history.label.home_address', value: '120 East Str.,\n12345, NY, New York, USA' }]);
    });

    it('displays the right text if there is no address', () => {
      const activity = mockHouseholdActivities(HouseholdActivityType.HomeAddressEdited)[0];
      const historyActivity = new HouseholdActivity(activity);
      const expected = historyActivity.makeHomeTemplate(null, i18n);
      expect(expected).toEqual([{ label: 'household.history.label.home_address', value: 'registration.addresses.temporaryAddressTypes.NoFixedAddress' }]);
    });
  });

  describe('makeContactInfoTemplate', () => {
    it('calls makeMemberNameTemplate and returns the right data', async () => {
      const activity = mockHouseholdActivities(HouseholdActivityType.ContactInformationEdited)[0];
      const historyActivity = new HouseholdActivity(activity);
      historyActivity.makeMemberNameTemplate = jest.fn(() => ([{ label: 'member', value: 'John Smith' }]));

      const contactInfoData = historyActivity.previousDetails;

      const expected = historyActivity.makeContactInfoTemplate(contactInfoData, i18n);
      expect(historyActivity.makeMemberNameTemplate).toHaveBeenCalledWith(contactInfoData.personFullName);

      expect(expected).toEqual([
        { label: 'member', value: 'John Smith' },
        {
          label: 'household.history.label.email',
          value: contactInfoData.contactInformation.email,
        },
        {
          label: 'household.history.label.home_phone',
          value: contactInfoData.contactInformation.homePhoneNumber.number,
        },
        {
          label: 'household.history.label.mobile_phone',
          value: contactInfoData.contactInformation.mobilePhoneNumber.number,
        },
        {
          label: 'household.history.label.alternate_phone',
          value: contactInfoData.contactInformation.alternatePhoneNumber.number,
        },
        {
          label: 'household.profile.member.phone_numbers.extension',
          value: contactInfoData.contactInformation.alternatePhoneNumber.extension,
        },
        {
          label: 'household.history.label.preferred_language',
          value: contactInfoData.preferredLanguageName.translation.en,
        },
        {
          label: 'household.history.label.primary_spoken_language',
          value: contactInfoData.primarySpokenLanguageName.translation.en,
        },
      ]);
    });
  });

  describe('makePersonalInfoTemplate', () => {
    it('calls makeMemberNameTemplate and getBirthDateAndAge helper and returns the right data', () => {
      const activity = mockHouseholdActivities(HouseholdActivityType.IdentitySetEdited)[0];
      const historyActivity = new HouseholdActivity(activity);
      historyActivity.makeMemberNameTemplate = jest.fn(() => ([{ label: 'member', value: 'John Smith' }]));
      jest.spyOn(helpers, 'getBirthDateAndAge').mockImplementation(() => ('Jan 13, 1955 (66 years)'));

      const identityData = historyActivity.previousDetails;

      const expected = historyActivity.makePersonalInfoTemplate(identityData, i18n);

      expect(helpers.getBirthDateAndAge).toHaveBeenCalledWith(identityData.identitySet.dateOfBirth, i18n);
      expect(historyActivity.makeMemberNameTemplate).toHaveBeenCalledWith(identityData.identitySet.firstName, identityData.identitySet.lastName);
      expect(expected).toEqual([
        { label: 'member', value: 'John Smith' },
        { label: 'household.profile.member.middle_name', value: identityData.identitySet.middleName },
        {
          label: 'household.profile.member.preferred_name',
          value: identityData.identitySet.preferredName,
        },
        {
          label: 'household.history.label.date_of_birth',
          value: 'Jan 13, 1955 (66 years)',
        },
        {
          label: 'household.history.label.gender',
          value: identityData.genderName.translation.en,
        },
        {
          label: 'household.history.label.indigenous_identity',
          value: `common.indigenous.types.FirstNation, ${identityData.indigenousIdentityInfo.name}`,
        },
      ]);
    });
  });

  describe('makeTemporaryAddressTemplate', () => {
    it('returns the right address if the address is a shelter', () => {
      const activity = mockHouseholdActivities(HouseholdActivityType.TempAddressEdited)[0];
      const historyActivity = new HouseholdActivity(activity);

      const previousData = { currentAddress: mockShelter(), shelterLocationName: { translation: { en: 'Mock Shelter Location', fr: '' } } };

      expect(historyActivity.makeTemporaryAddressTemplate(previousData, i18n)).toEqual([
        {
          label: 'household.history.label.temporary_address',
          value: 'registration.addresses.temporaryAddressTypes.Shelter, Mock Shelter Location',
        },
      ]);
    });

    it('returns the right address if the address is a shelter and has a place number', () => {
      const activity = mockHouseholdActivities(HouseholdActivityType.TempAddressEdited)[0];
      const historyActivity = new HouseholdActivity(activity);

      const previousData = { currentAddress: mockShelter(), shelterLocationName: { translation: { en: 'Mock Shelter Location', fr: '' } } };
      previousData.currentAddress.placeNumber = '1234';

      expect(historyActivity.makeTemporaryAddressTemplate(previousData, i18n)).toEqual([
        {
          label: 'household.history.label.temporary_address',
          value: 'registration.addresses.temporaryAddressTypes.Shelter, Mock Shelter Location #1234',
        },
      ]);
    });

    it('calls getAddressLines helper and returns the right address if the address has a place name and number', () => {
      jest.spyOn(helpers, 'getAddressLines').mockImplementation(() => (['120 East Str.', '12345, NY, New York', 'USA']));

      const activity = mockHouseholdActivities(HouseholdActivityType.TempAddressEdited)[0];
      const historyActivity = new HouseholdActivity(activity);

      const expected = historyActivity.makeTemporaryAddressTemplate(historyActivity.previousDetails, i18n);

      expect(helpers.getAddressLines).toHaveBeenCalledWith(new Address(mockCampGround().address), i18n);
      expect(expected).toEqual([
        {
          label: 'household.history.label.temporary_address',
          value: 'registration.addresses.temporaryAddressTypes.Campground, old name,\n120 East Str.,\n12345, NY, New York, USA',
        },
      ]);
    });
  });

  describe('makeMultipleMembersTemplate', () => {
    it('calls makeFullMemberTemplate with the right payload and returns the right data', () => {
      const activity = mockHouseholdActivities(HouseholdActivityType.OriginalHouseholdSplit)[0];
      const historyActivity = new HouseholdActivity(activity);
      historyActivity.makeFullMemberTemplate = jest.fn(() => ([{ label: 'foo', value: 'bar' }]));
      historyActivity.makeEmptyLine = jest.fn(() => ([{ label: '\n', value: '' }]));

      const expected = historyActivity.makeMultipleMembersTemplate(historyActivity.previousDetails.memberDetails);

      expect(historyActivity.makeFullMemberTemplate).toHaveBeenCalledTimes(2);
      expect(expected).toEqual([
        { label: 'foo', value: 'bar' },
        { label: '\n', value: '' },
        { label: 'foo', value: 'bar' },
      ]);
    });
  });

  describe('makePrimaryTemplate', () => {
    it('returns the right data', () => {
      const activity = mockHouseholdActivities(HouseholdActivityType.PrimaryAssigned)[0];
      const historyActivity = new HouseholdActivity(activity);
      const expected = historyActivity.makePrimaryTemplate(historyActivity);

      expect(expected).toEqual([
        { label: 'household.history.label.primaryMember', value: historyActivity.personFullName },
      ]);
    });
  });

  describe('makeMemberNameTemplate', () => {
    it('returns the right data', () => {
      const activity = mockHouseholdActivities()[0];
      const historyActivity = new HouseholdActivity(activity);

      expect(historyActivity.makeMemberNameTemplate('Jane', 'Doe')).toEqual([
        {
          label: 'household.history.label.member',
          value: 'Jane Doe',
        },
      ]);

      expect(historyActivity.makeMemberNameTemplate('John Doe')).toEqual([
        {
          label: 'household.history.label.member',
          value: 'John Doe',
        },
      ]);
    });
  });

  describe('makeEmptyTemplate', () => {
    it('returns the right data', () => {
      const activity = mockHouseholdActivities()[0];
      const historyActivity = new HouseholdActivity(activity);
      expect(historyActivity.makeEmptyTemplate()).toEqual([{ label: '—', value: '' }]);
    });
  });

  describe('makeEmptyLine', () => {
    it('returns the right data', () => {
      const activity = mockHouseholdActivities()[0];
      const historyActivity = new HouseholdActivity(activity);

      expect(historyActivity.makeEmptyLine()).toEqual([
        { label: '\n', value: '' },
      ]);
    });
  });

  describe('makeFullMemberTemplate', () => {
    it('calls makePersonalInfoTemplate, makeTemporaryAddressTemplate, makeEmptyLine and concatenates the responses', () => {
      const activity = mockHouseholdActivities(HouseholdActivityType.MemberRemoved)[0];
      const historyActivity = new HouseholdActivity(activity);

      historyActivity.makePersonalInfoTemplate = jest.fn(() => ([{ label: 'name', value: 'foo' }]));
      historyActivity.makeTemporaryAddressTemplate = jest.fn(() => ([{ label: 'address', value: 'bar' }]));
      historyActivity.makeEmptyLine = jest.fn(() => ([{ label: '\n', value: '' }]));

      const expected = historyActivity.makeFullMemberTemplate(historyActivity, i18n);
      expect(historyActivity.makePersonalInfoTemplate).toHaveBeenCalledTimes(1);
      expect(historyActivity.makeTemporaryAddressTemplate).toHaveBeenCalledTimes(1);
      expect(historyActivity.makeEmptyLine).toHaveBeenCalledTimes(1);
      expect(expected).toEqual([
        { label: 'name', value: 'foo' },
        { label: '\n', value: '' },
        { label: 'address', value: 'bar' },
      ]);
    });
  });

  describe('makeStatusTemplate', () => {
    it('returns the right data', () => {
      const activity = mockHouseholdActivities(HouseholdActivityType.StatusChanged)[0];
      const historyActivity = new HouseholdActivity(activity);
      const expected = historyActivity.makeStatusTemplate(historyActivity.previousDetails, i18n);

      expect(expected).toEqual([
        {
          label: 'household.history.label.status',
          value: 'household.profile.householdStatus.Closed',
        },
        {
          label: 'household.history.label.rationale',
          value: 'Test-close',
        },
      ]);
    });
  });
});
