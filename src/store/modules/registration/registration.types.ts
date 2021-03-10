import {
  IOptionItemData,
  IIndigenousCommunityData,
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
  indigenousTypes: IOptionItemData[];
  indigenousCommunities: IIndigenousCommunityData[];
};
