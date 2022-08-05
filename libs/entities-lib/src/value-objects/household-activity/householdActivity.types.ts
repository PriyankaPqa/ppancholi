import VueI18n from 'vue-i18n';
import { IMultilingual } from '@libs/core-lib/src/types';
import { ICurrentAddress } from '../current-address/currentAddress.types';
import { IContactInformation } from '../contact-information';
import { EIndigenousTypes, IIdentitySet } from '../identity-set/identitySet.types';

import { IHistoryItemTemplateData } from '../versioned-entity';

export enum HouseholdActivityType {
  ContactInformationEdited = 1,
  IdentitySetEdited = 2,
  MemberAdded = 3,
  MemberRemoved = 4,
  OriginalHouseholdSplit = 5,
  HouseholdMoved = 6,
  HomeAddressEdited = 7,
  TempAddressEdited = 8,
  PrimaryAssigned = 9
}

export interface IHouseholdActivityPerson {
  personId: uuid;
  personFullName: string;
}

export interface IHouseholdActivityIdentity {
  identitySet: IIdentitySet;
  genderName: IMultilingual;
  indigenousIdentityInfo: {
    communityType: EIndigenousTypes;
    name: string;
  };
}

export interface IHouseholdActivityContactInfo extends IHouseholdActivityPerson {
  contactInformation: IContactInformation;
  preferredLanguageName: IMultilingual;
  primarySpokenLanguageName: IMultilingual;
}

export interface IHouseholdActivityTempAddress extends IHouseholdActivityPerson {
  currentAddress: ICurrentAddress;
  shelterLocationName: IMultilingual;
}

export interface IHouseholdActivityMembers {
  memberDetails: (IHouseholdActivityIdentity & IHouseholdActivityTempAddress)[];
}

export interface IHouseholdActivity {
  householdId: uuid;
  timestamp: string |Date;
  user: {
    id: uuid;
    name: string;
  };
  role: {
    id: uuid;
    name: IMultilingual;
  };
  activityType: HouseholdActivityType;
  newDetails: unknown;
  previousDetails: unknown;

  getActivityName? (): string;
  getTemplateData?(isPreviousValue: boolean, i18n: VueI18n): IHistoryItemTemplateData[];
}
