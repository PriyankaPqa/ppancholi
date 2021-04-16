import {
  IIndigenousIdentityData,
} from '@/entities/beneficiary';
import { IEventData } from '@/entities/event';
import { ILeftMenuItem } from '@/types/interfaces/ILeftMenuItem';

import { ECanadaProvinces, IOptionItemData } from '@/types';

export type IState = {
  event: IEventData;
  isLeftMenuOpen: boolean;
  tabs: ILeftMenuItem[];
  currentTabIndex: number;
  genders: IOptionItemData[];
  preferredLanguages: IOptionItemData[];
  primarySpokenLanguages: IOptionItemData[];
  indigenousIdentities: Record<ECanadaProvinces, IIndigenousIdentityData[]>;
  loadingIndigenousIdentities: boolean;
  isPrivacyAgreed: boolean,
  privacyDateTimeConsent: string,
};
