import { Store } from 'vuex';
import { IState as IRegistrationState } from './modules/registration/registration.types';
import { IState as IBeneficiaryState } from './modules/beneficiary/beneficiary.types';

export interface IRootState {
  version: string;
  registration?: IRegistrationState;
  beneficiary?: IBeneficiaryState;
}

export type IState = IRootState;

export type IStore = Store<IState>
