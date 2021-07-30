import { Store } from 'vuex';
import { IState as IRegistrationState } from '@crctech/registration-lib/src/store/modules/registration/registration.types';
import { IProvider, IProviderMock } from '@/services/provider';
import * as vuexModule from '@/constants/vuex-modules';
import { IState as IDashboardState } from '@/store/modules/dashboard/dashboard.types';
import { IState as IOptionListState } from '@/store/modules/optionList/optionList.types';
import { IState as ITeamState } from '@/store/modules/team/team.types';
import { IState as IProgramState } from '@/store/modules/program/program.types';
import { IState as IBaseState } from '@/store/modules/base/base.types';
import { IState as IUserState } from '@/store/modules/user/user.types';

import { IUserAccountEntityState } from '@/store/modules/user-account/userAccountEntity.types';
import { IUserAccountMetadata } from '@/entities/user-account';

import { ICaseFileEntityState } from '@/store/modules/case-file/caseFileEntity.types';
import { ICaseFileMetadata } from '@/entities/case-file';

import { ICaseNoteEntityState } from '@/store/modules/case-note/caseNoteEntity.types';
import { ICaseNoteMetadata } from '@/entities/case-note';

import { IEventEntityState } from '@/store/modules/event/eventEntity.types';
import { IEventMetadata } from '@/entities/event';

import { ICaseFileReferralEntityState } from '@/store/modules/case-file-referral/caseFileReferralEntity.types';
import { ICaseFileReferralMetadata } from '@/entities/case-file-referral';

import { ICaseFileDocumentEntityState } from '@/store/modules/case-file-document/caseFileDocumentEntity.types';
import { ICaseFileDocumentMetadata } from '@/entities/case-file-document';

import { IHouseholdEntityState } from '@crctech/registration-lib/src/store/modules/household/householdEntity.types';
import { IHouseholdMetadata } from '@crctech/registration-lib/src/entities/household';

import { IFinancialAssistanceEntityState } from '@/store/modules/financial-assistance/financialAssistanceEntity.types';
import { IFinancialAssistanceTableMetadata } from '@/entities/financial-assistance';

export interface IRootState {
  version: string;
  [vuexModule.CASE_FILE_ENTITIES]?: ICaseFileEntityState,
  [vuexModule.CASE_FILE_METADATA]?: IBaseState<ICaseFileMetadata>
  [vuexModule.CASE_NOTE_ENTITIES]?: ICaseNoteEntityState,
  [vuexModule.CASE_NOTE_METADATA]?: IBaseState<ICaseNoteMetadata>
  [vuexModule.CASE_REFERRAL_ENTITIES]?: ICaseFileReferralEntityState,
  [vuexModule.CASE_REFERRAL_METADATA]?: IBaseState<ICaseFileReferralMetadata>
  [vuexModule.CASE_DOCUMENT_ENTITIES]?: ICaseFileDocumentEntityState,
  [vuexModule.CASE_DOCUMENT_METADATA]?: IBaseState<ICaseFileDocumentMetadata>
  [vuexModule.USER_ACCOUNT_ENTITIES]?: IUserAccountEntityState,
  [vuexModule.USER_ACCOUNT_METADATA]?: IBaseState<IUserAccountMetadata>,
  [vuexModule.EVENT_ENTITIES]?: IEventEntityState,
  [vuexModule.EVENT_METADATA]?: IBaseState<IEventMetadata>
  [vuexModule.FINANCIAL_ASSISTANCE_ENTITIES]?: IFinancialAssistanceEntityState,
  [vuexModule.FINANCIAL_ASSISTANCE_METADATA]?: IBaseState<IFinancialAssistanceTableMetadata>,
  [vuexModule.HOUSEHOLD_ENTITIES]?: IHouseholdEntityState
  [vuexModule.HOUSEHOLD_METADATA]?: IBaseState<IHouseholdMetadata>

  [vuexModule.USER_MODULE]?: IUserState,
  [vuexModule.DASHBOARD_MODULE]?: IDashboardState,
  [vuexModule.OPTION_LIST_MODULE]?: IOptionListState,
  [vuexModule.TEAM_MODULE]?: ITeamState,
  [vuexModule.PROGRAM_MODULE]?: IProgramState,
  [vuexModule.REGISTRATION_MODULE]?: IRegistrationState
}

export type IState = IRootState;

export interface IStore<S> extends Store<S> {
  $services: IProvider | IProviderMock;
}
