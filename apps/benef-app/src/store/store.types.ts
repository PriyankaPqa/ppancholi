import { Store } from 'vuex';
import { IHouseholdEntityState } from '@libs/registration-lib/store/modules/household/householdEntity.types';
import { IHouseholdMetadata } from '@libs/entities-lib/household';
import { IState as IBaseState } from '@libs/registration-lib/store/modules/base/base.types';
import * as vuexModule from '@/constants/vuex-modules';
import { IProvider, IProviderMock } from '@/services/provider';

export interface IRootState {
  version: string;
  [vuexModule.HOUSEHOLD_ENTITIES]?: IHouseholdEntityState
  [vuexModule.HOUSEHOLD_METADATA]?: IBaseState<IHouseholdMetadata>
}

export type IState = IRootState;

export interface IStore<S> extends Store<S> {
  $services: IProvider | IProviderMock;
}
