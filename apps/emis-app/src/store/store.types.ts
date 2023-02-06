import { Store } from 'vuex';
import * as vuexModule from '@/constants/vuex-modules';

import { IState as IBaseState } from '@/store/modules/base/base.types';

import { IFinancialAssistanceEntityState } from '@/store/modules/financial-assistance/financialAssistanceEntity.types';
import { IFinancialAssistanceTableMetadata } from '@libs/entities-lib/financial-assistance';

import { IProvider, IProviderMock } from '@/services/provider';

export interface IRootState {
  version: string;
  [vuexModule.FINANCIAL_ASSISTANCE_ENTITIES]?: IFinancialAssistanceEntityState,
  [vuexModule.FINANCIAL_ASSISTANCE_METADATA]?: IBaseState<IFinancialAssistanceTableMetadata>,
}

export type IState = IRootState;

export interface IStore<S> extends Store<S> {
  $services: IProvider | IProviderMock;
  _actions?: Record<string, Array<unknown>>
}
