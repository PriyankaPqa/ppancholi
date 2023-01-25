import { Store } from 'vuex';
import { IHouseholdEntityState } from './modules/household/householdEntity.types';

export interface IRootState {
  version: string;
  household?: IHouseholdEntityState;
}

export type IState = IRootState;

export interface IStore<S> extends Store<S> {
  // eslint-disable-next-line
  $services: any;
  // eslint-disable-next-line
  _vm?: any;
}
