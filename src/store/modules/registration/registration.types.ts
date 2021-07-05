import { ECanadaProvinces, IOptionItemData } from '../../../types';
import { IError } from '../../../services/httpClient';
import { IRegistrationMenuItem } from '../../../types/interfaces/IRegistrationMenuItem';
import {
  HouseholdCreate,
  IIndigenousIdentityData,
} from '../../../entities/household-create';

import { IHouseholdEntity } from '../../../entities/household';
import { IEventData } from '../../../entities/event';

export type IState = {
  event: IEventData;
  isLeftMenuOpen: boolean;
  tabs: IRegistrationMenuItem[];
  currentTabIndex: number;
  genders: IOptionItemData[];
  preferredLanguages: IOptionItemData[];
  primarySpokenLanguages: IOptionItemData[];
  indigenousIdentities: Record<ECanadaProvinces, IIndigenousIdentityData[]>;
  loadingIndigenousIdentities: boolean;
  isPrivacyAgreed: boolean;
  registrationResponse: IHouseholdEntity;
  registrationErrors: IError[];
  submitLoading: boolean;
  inlineEditCounter: number;
  householdResultsShown: boolean;
  householdCreate: HouseholdCreate;
  householdAssociationMode: boolean;
  householdAlreadyRegistered: boolean;
};
