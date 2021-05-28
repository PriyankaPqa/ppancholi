import { Store } from 'vuex';
import { IProvider, IProviderMock } from '@/services/provider';
import { IState as IRegistrationState } from './modules/registration/registration.types';
import { IState as IHouseholdState } from './modules/household/household.types';

export interface IRootState {
  version: string;
  registration?: IRegistrationState;
  household?: IHouseholdState;
}

export type IState = IRootState;

export interface IStore<S> extends Store<S> {
  $services: IProvider | IProviderMock;
}
