import { Store } from 'vuex';
import { IState as IDashboardState } from './modules/dashboard/dashboard.types';

export interface IRootState {
  version: string
  dashboard?: IDashboardState
}

export type IState = IRootState;

export type IStore = Store<IState>
