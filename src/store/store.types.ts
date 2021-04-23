import { Store } from 'vuex';
import { IProvider, IProviderMock } from '@/services/provider';
import { IState as IRegistrationState } from './modules/registration/registration.types';
import { IState as IBeneficiaryState } from './modules/beneficiary/beneficiary.types';

export interface IRootState {
  version: string;
  registration?: IRegistrationState;
  beneficiary?: IBeneficiaryState;
}

export type IState = IRootState;

export interface IStore<S> extends Store<S> {
  $services: IProvider | IProviderMock;
}
