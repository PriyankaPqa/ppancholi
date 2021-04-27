import { ECanadaProvinces, IOptionItemData } from '../../../types';
import { IRegistrationMenuItem } from '../../../types/interfaces/IRegistrationMenuItem';
import {
  IIndigenousIdentityData,
} from '../../../entities/beneficiary';
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
};
