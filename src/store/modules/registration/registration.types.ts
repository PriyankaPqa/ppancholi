import { ECanadaProvinces, ERegistrationMethod, IOptionItemData } from '../../../types';
import { IError } from '../../../services/httpClient';
import { IRegistrationMenuItem } from '../../../types/interfaces/IRegistrationMenuItem';
import {
  IIndigenousIdentityData,
} from '../../../entities/household-create';

import { IHouseholdData } from '../../../entities/household';
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
  privacyDateTimeConsent: string;
  privacyCRCUsername: string;
  privacyRegistrationMethod: ERegistrationMethod;
  privacyRegistrationLocationName: string;
  registrationResponse: IHouseholdData;
  registrationErrors: IError[];
  submitLoading: boolean;
  inlineEditCounter: number;
};
