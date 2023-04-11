import { HouseholdStatus } from '../../household';
import {
  HouseholdActivityType, IHouseholdActivity, IHouseholdActivityIdentity, IHouseholdActivityMembers,
} from './householdActivity.types';
/* eslint-disable max-lines-per-function */
import { mockAddress } from '../address';
import { mockContactInformation } from '../contact-information';
import { mockCampGround, mockShelter } from '../current-address';
import { EIndigenousTypes, mockIdentitySet } from '../identity-set';

 const householdActivityBase = {
  householdId: '60983874-18bb-467d-b55a-94dc55818151',
  user: {
    id: '60983874-18bb-467d-b55a-94dc55818152',
    name: 'John Smith',
  },
  role: {
    id: '60983874-18bb-467d-b55a-94dc55818153',
    name: { translation: { en: 'sys admin', fr: 'admin de systeme' } },
  },
  timestamp: '2021-01-01',
};

 const householdActivityIdentity = (force? : Partial<IHouseholdActivityIdentity>) => ({
  identitySet: mockIdentitySet(),
  genderName: {
    translation: { en: 'Male', fr: 'Masculin' },
  },
  indigenousIdentityInfo: {
    communityType: '',
    name: '',
  },
  ...force,
});

export const mockHouseholdActivities = (type: HouseholdActivityType = null): IHouseholdActivity[] => {
  const activities = [{
    ...householdActivityBase,
    activityType: HouseholdActivityType.IdentitySetEdited,
    newDetails: householdActivityIdentity(),
    previousDetails: householdActivityIdentity({
      genderName: { translation: { en: 'Female', fr: 'Femme' } },
      indigenousIdentityInfo: { communityType: EIndigenousTypes.FirstNation, name: 'test name' },
    }),
  },
  {
    ...householdActivityBase,
    activityType: HouseholdActivityType.ContactInformationEdited,
    timestamp: '2021-01-03',
    newDetails: {
      personId: 'b2b528c3-e7d9-4b46-8062-3fa242fc3501',
      personFullName: 'John Doe',
      contactInformation: mockContactInformation(),
      preferredLanguageName: {
        translation: { en: 'French', fr: 'Francais' },
      },
      primarySpokenLanguageName: {
        translation: { en: 'French', fr: 'Francais' },
      },

    },
    previousDetails: {
      personId: 'b2b528c3-e7d9-4b46-8062-3fa242fc3501',
      personFullName: 'John Doe',
      contactInformation: mockContactInformation(),
      preferredLanguageName: {
        translation: { en: 'French', fr: 'Francais' },
      },
      primarySpokenLanguageName: {
        translation: { en: 'English', fr: 'Anglais' },
      },
    },
  },
  {
    ...householdActivityBase,
    activityType: HouseholdActivityType.MemberAdded,
    newDetails: {
      ...householdActivityIdentity(),
      personId: 'b2b528c3-e7d9-4b46-8062-3fa242fc3502',
      personFullName: 'John Doe',
      currentAddress: mockCampGround(),
    },
    previousDetails: [] as IHouseholdActivityIdentity[],
  },
  {
    ...householdActivityBase,
    activityType: HouseholdActivityType.MemberRemoved,
    newDetails: [] as IHouseholdActivityIdentity[],
    previousDetails: {
      ...householdActivityIdentity(),
      personId: 'b2b528c3-e7d9-4b46-8062-3fa242fc3503',
      personFullName: 'John Doe',
      currentAddress: mockCampGround(),
    },
  },
  {
    ...householdActivityBase,
    activityType: HouseholdActivityType.OriginalHouseholdSplit,
    newDetails: null as IHouseholdActivityMembers,
    previousDetails: {
      memberDetails: [
        {
          ...householdActivityIdentity(),
          personId: 'b2b528c3-e7d9-4b46-8062-3fa242fc3504',
          personFullName: 'John Doe',
          currentAddress: mockCampGround(),
        },
        {
          ...householdActivityIdentity(),
          personId: 'b2b528c3-e7d9-4b46-8062-3fa242fc3505',
          personFullName: 'Joe Doe',
          currentAddress: mockShelter(),
          shelterLocationName: { translation: { en: 'Acme shelter', fr: '' } },
        },
      ],
    },
  },
    {
      ...householdActivityBase,
      activityType: HouseholdActivityType.HouseholdMoved,
      newDetails: {
        memberDetails: [
          {
            ...householdActivityIdentity({ identitySet: mockIdentitySet({ firstName: 'Jack' }) }),
            personId: 'b2b528c3-e7d9-4b46-8062-3fa242fc3548',
            currentAddress: mockCampGround(),
          },
          {
            ...householdActivityIdentity(),
            personId: 'b2b528c3-e7d9-4b46-8062-3fa242fc3548',
            currentAddress: mockShelter(),
            shelterLocationName: { translation: { en: 'Acme shelter', fr: '' } },
          },
        ],
      },
      previousDetails: {
        memberDetails: [
          {
            ...householdActivityIdentity(),
            personId: 'newId',
            currentAddress: mockCampGround(),
          },
        ],
      },
    },
  {
    ...householdActivityBase,
    activityType: HouseholdActivityType.HomeAddressEdited,
    newDetails: { address: mockAddress() },
    previousDetails: { address: mockAddress({ postalCode: 'A1B C3D' }) },
  },
  {
    ...householdActivityBase,
    activityType: HouseholdActivityType.TempAddressEdited,
    newDetails: {
      personId: 'b2b528c3-e7d9-4b46-8062-3fa242fc3508',
      personFullName: 'John Doe',
      currentAddress: mockCampGround(),
    },
    previousDetails: {
      personId: 'b2b528c3-e7d9-4b46-8062-3fa242fc3508',
      personFullName: 'John Doe',
      currentAddress: mockCampGround({ placeName: 'old name' }),
    },
  },
  {
    ...householdActivityBase,
    activityType: HouseholdActivityType.PrimaryAssigned,
    newDetails: {
      personId: 'b2b528c3-e7d9-4b46-8062-3fa242fc3509',
      personFullName: 'Jack Doe',
    },
    previousDetails: {
      personId: 'b2b528c3-e7d9-4b46-8062-3fa242fc3509',
      personFullName: 'John Doe',
    },
  },
    {
      ...householdActivityBase,
      activityType: HouseholdActivityType.StatusChanged,
      newDetails: {
        status: HouseholdStatus.Open,
            rationale: {
      translation: {
        en: 'Test-reopen',
        fr: 'Test-reopen-fr',
      },
    },
      },
      previousDetails: {
        status: HouseholdStatus.Closed,
            rationale: {
      translation: {
        en: 'Test-close',
        fr: 'Test-close-fr',
      },
    },
      },
    },
  ];

  if (type) {
    return activities.filter((a) => a.activityType === type);
  }

  return activities;
};
