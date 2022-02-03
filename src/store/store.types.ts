import { Store } from 'vuex';
import { IState as IRegistrationState } from './modules/registration/registration.types';
import { IHouseholdEntityState } from './modules/household/householdEntity.types';
import { ITenantSettingsEntityState } from './modules/tenantSettings/tenantSettingsEntity.types';

export interface IRootState {
  version: string;
  registration?: IRegistrationState;
  household?: IHouseholdEntityState;
  tenantSettings?: ITenantSettingsEntityState;
}

export type IState = IRootState;

export interface IStore<S> extends Store<S> {
  // eslint-disable-next-line
  $services: any;
  // eslint-disable-next-line
  _vm?: any;
}
