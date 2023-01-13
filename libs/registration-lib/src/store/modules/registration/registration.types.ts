import { IServerError, IOptionItemData } from '@libs/shared-lib/types';
import { ISplitHousehold } from '@libs/entities-lib/household-create/householdCreate.types';
import {
  HouseholdCreate,
  IIndigenousCommunityData,
} from '@libs/entities-lib/household-create';

import { IHouseholdEntity } from '@libs/entities-lib/household';
import { IEventData } from '@libs/entities-lib/registration-event';
import { IRegistrationMenuItem, IInformationFromBeneficiarySearch } from '../../../types';

export type IState = {
  event: IEventData;
  isLeftMenuOpen: boolean;
  tabs: IRegistrationMenuItem[];
  currentTabIndex: number;
  genders: IOptionItemData[];
  preferredLanguages: IOptionItemData[];
  primarySpokenLanguages: IOptionItemData[];
  indigenousCommunities: IIndigenousCommunityData[];
  loadingIndigenousCommunities: boolean;
  isPrivacyAgreed: boolean;
  registrationResponse: IHouseholdEntity;
  registrationErrors: IServerError;
  submitLoading: boolean;
  inlineEditCounter: number;
  householdResultsShown: boolean;
  householdCreate: HouseholdCreate;
  householdAssociationMode: boolean;
  householdAlreadyRegistered: boolean;
  splitHousehold: ISplitHousehold;
  primarySpokenLanguagesFetched: boolean;
  gendersFetched: boolean;
  informationFromBeneficiarySearch: IInformationFromBeneficiarySearch;
};
