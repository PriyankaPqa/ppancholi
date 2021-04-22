import { Store } from 'vuex';
import { IState as IRegistrationState } from '@crctech/registration-lib/src/store/modules/registration/registration.types';
import { IState as IBeneficiaryState } from '@crctech/registration-lib/src/store/modules/beneficiary/beneficiary.types';

export interface IRootState {
  version: string;
  registration?: IRegistrationState;
  beneficiary?: IBeneficiaryState;
}

export type IState = IRootState;

export type IStore = Store<IState>
