import { IOptionItemData } from '@/entities/optionItem';
import { IEvent } from '@/entities/event';

export type IState = {
  agreementTypes: IOptionItemData[];
  eventTypes: IOptionItemData[];
  events: IEvent[];
  agreementTypesFetched: boolean;
  eventTypesFetched: boolean;
  eventsFetched: boolean;
  getLoading: boolean;
  searchLoading: boolean,
};
