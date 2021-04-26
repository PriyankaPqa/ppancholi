import { Store } from 'vuex';
import { IState as IRegistrationState } from '@crctech/registration-lib/src/store/modules/registration/registration.types';
import { IState as IBeneficiaryState } from '@crctech/registration-lib/src/store/modules/beneficiary/beneficiary.types';
import { IProvider, IProviderMock } from '@/services/provider';

export interface IRootState {
  version: string;
  registration?: IRegistrationState;
  beneficiary?: IBeneficiaryState;
}

export type IState = IRootState;

export interface IStore<S> extends Store<S> {
  $services: IProvider | IProviderMock;
}
