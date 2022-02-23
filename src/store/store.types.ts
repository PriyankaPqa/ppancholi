import { Store } from 'vuex';
import { IState as IRegistrationState } from '@crctech/registration-lib/src/store/modules/registration/registration.types';
import { IHouseholdEntityState } from '@crctech/registration-lib/src/store/modules/household/householdEntity.types';
import { IProvider, IProviderMock } from '@/services/provider';
import { IHouseholdMetadata } from '@crctech/registration-lib/src/entities/household';
import * as vuexModule from '@/constants/vuex-modules';
import { IState as IBaseState } from '@crctech/registration-lib/src/store/modules/base/base.types';
import { ITenantSettingsEntityState } from '@crctech/registration-lib/src/store/modules/tenantSettings/tenantSettingsEntity.types';

export interface IRootState {
  version: string;
  registration?: IRegistrationState;
  [vuexModule.HOUSEHOLD_ENTITIES]?: IHouseholdEntityState
  [vuexModule.HOUSEHOLD_METADATA]?: IBaseState<IHouseholdMetadata>
  [vuexModule.TENANT_SETTINGS_ENTITIES]?: ITenantSettingsEntityState,
}

export type IState = IRootState;

export interface IStore<S> extends Store<S> {
  $services: IProvider | IProviderMock;
}
