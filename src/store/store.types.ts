import { Store } from 'vuex';
import { IState as IRegistrationState } from '@crctech/registration-lib/src/store/modules/registration/registration.types';
import { IHouseholdEntityState } from '@crctech/registration-lib/src/store/modules/household/householdEntity.types';
import { IProvider, IProviderMock } from '@/services/provider';
import * as vuexModule from '@/constants/vuex-modules';
import { IUserAccountMetadata } from '@/entities/user-account';
import { IHouseholdMetadata } from '@crctech/registration-lib/src/entities/household';
import { IState as IUserState } from './modules/user/user.types';
import { IUserAccountEntityState } from './modules/user-account/userAccountEntity.types';
import { IState as ICaseFileState } from './modules/case-file/case-file.types';
import { IState as IDashboardState } from './modules/dashboard/dashboard.types';
import { IState as IEventState } from './modules/event/event.types';
import { IState as IOptionListState } from './modules/optionList/optionList.types';
import { IState as ITeamState } from './modules/team/team.types';
import { IState as IProgramState } from './modules/program/program.types';
import { IState as IBaseState } from './modules/base/base.types';
import { IState as IFinancialAssistanceState } from './modules/financial-assistance/financial-assistance.types';

export interface IRootState {
  version: string;
  [vuexModule.CASE_FILE_MODULE]?: ICaseFileState,
  [vuexModule.USER_MODULE]?: IUserState,
  [vuexModule.USER_ACCOUNT_ENTITIES]?: IUserAccountEntityState,
  [vuexModule.USER_ACCOUNT_METADATA]?: IBaseState<IUserAccountMetadata>,
  [vuexModule.DASHBOARD_MODULE]?: IDashboardState,
  [vuexModule.EVENT_MODULE]?: IEventState,
  [vuexModule.OPTION_LIST_MODULE]?: IOptionListState,
  [vuexModule.TEAM_MODULE]?: ITeamState,
  [vuexModule.PROGRAM_MODULE]?: IProgramState,
  [vuexModule.FINANCIAL_ASSISTANCE_MODULE]?: IFinancialAssistanceState,
  [vuexModule.HOUSEHOLD_ENTITIES]?: IHouseholdEntityState
  [vuexModule.HOUSEHOLD_METADATA]?: IBaseState<IHouseholdMetadata>
  [vuexModule.REGISTRATION_MODULE]?: IRegistrationState
}

export type IState = IRootState;

export interface IStore<S> extends Store<S> {
  $services: IProvider | IProviderMock;
}
