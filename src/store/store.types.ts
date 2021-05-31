import { Store } from 'vuex';
import { IState as IRegistrationState } from '@crctech/registration-lib/src/store/modules/registration/registration.types';
import { IState as IHouseholdState } from '@crctech/registration-lib/src/store/modules/household/household.types';
import { IProvider, IProviderMock } from '@/services/provider';

export interface IRootState {
  version: string;
  registration?: IRegistrationState;
  household?: IHouseholdState;
}

export type IState = IRootState;

export interface IStore<S> extends Store<S> {
  $services: IProvider | IProviderMock;
}
