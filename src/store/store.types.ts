import { Store } from 'vuex';
import { IState as IRegistrationState } from './modules/registration/registration.types';
import { IHouseholdEntityState } from './modules/household/householdEntity.types';

export interface IRootState {
  version: string;
  registration?: IRegistrationState;
  household?: IHouseholdEntityState;
}

export type IState = IRootState;

export interface IStore<S> extends Store<S> {
  // eslint-disable-next-line
  $services: any;
}
