import { Store } from 'vuex';
import { IState as IRegistrationState } from './modules/registration/registration.types';

export interface IRootState {
  version: string;
  registration?: IRegistrationState;
}

export type IState = IRootState;

export type IStore = Store<IState>
