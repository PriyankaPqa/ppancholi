import { Store } from 'vuex';

export interface IRootState {
  version: string
}

export type IState = IRootState;

export type IStore = Store<IState>
