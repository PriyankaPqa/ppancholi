import {
  IIndigenousIdentityData,
  IOptionItemData,
} from '@/entities/beneficiary';
import { IEventData } from '@/entities/event';
import { ILeftMenuItem } from '@/types/interfaces/ILeftMenuItem';

export type IState = {
  event: IEventData;
  isLeftMenuOpen: boolean;
  tabs: ILeftMenuItem[];
  currentTabIndex: number;
  genders: IOptionItemData[];
  preferredLanguages: IOptionItemData[];
  primarySpokenLanguages: IOptionItemData[];
  indigenousIdentities: IIndigenousIdentityData[];
  loadingIndigenousIdentities: boolean;
};
