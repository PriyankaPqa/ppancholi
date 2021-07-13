import { Store } from 'vuex';
import { IState as IRegistrationState } from '@crctech/registration-lib/src/store/modules/registration/registration.types';
import { IHouseholdEntityState } from '@crctech/registration-lib/src/store/modules/household/householdEntity.types';
import { IProvider, IProviderMock } from '@/services/provider';
import * as vuexModule from '@/constants/vuex-modules';
import { IUserAccountMetadata } from '@/entities/user-account';
import { ICaseFileMetadata } from '@/entities/case-file';
import { IHouseholdMetadata } from '@crctech/registration-lib/src/entities/household';
import { ICaseNoteMetadata } from '@/entities/case-note';
import { IEventMetadata } from '@/entities/event';
import { ICaseFileReferralMetadata } from '@/entities/case-file-referral';
import { IState as IUserState } from './modules/user/user.types';
import { IUserAccountEntityState } from './modules/user-account/userAccountEntity.types';
import { ICaseFileEntityState } from './modules/case-file/caseFileEntity.types';
import { IState as IDashboardState } from './modules/dashboard/dashboard.types';
import { IState as IOptionListState } from './modules/optionList/optionList.types';
import { IState as ITeamState } from './modules/team/team.types';
import { IState as IProgramState } from './modules/program/program.types';
import { IState as IBaseState } from './modules/base/base.types';
import { IState as IFinancialAssistanceState } from './modules/financial-assistance/financial-assistance.types';
import { ICaseNoteEntityState } from './modules/case-note/caseNoteEntity.types';
import { IEventEntityState } from './modules/event/eventEntity.types';
import { ICaseFileReferralEntityState } from './modules/case-file-referral/caseFileReferralEntity.types';

export interface IRootState {
  version: string;
  [vuexModule.CASE_FILE_ENTITIES]?: ICaseFileEntityState,
  [vuexModule.CASE_FILE_METADATA]?: IBaseState<ICaseFileMetadata>
  [vuexModule.CASE_NOTE_ENTITIES]?: ICaseNoteEntityState,
  [vuexModule.CASE_NOTE_METADATA]?: IBaseState<ICaseNoteMetadata>
  [vuexModule.CASE_REFERRAL_ENTITIES]?: ICaseFileReferralEntityState,
  [vuexModule.CASE_REFERRAL_METADATA]?: IBaseState<ICaseFileReferralMetadata>
  [vuexModule.USER_MODULE]?: IUserState,
  [vuexModule.USER_ACCOUNT_ENTITIES]?: IUserAccountEntityState,
  [vuexModule.USER_ACCOUNT_METADATA]?: IBaseState<IUserAccountMetadata>,
  [vuexModule.DASHBOARD_MODULE]?: IDashboardState,
  [vuexModule.EVENT_ENTITIES]?: IEventEntityState,
  [vuexModule.EVENT_METADATA]?: IBaseState<IEventMetadata>
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
