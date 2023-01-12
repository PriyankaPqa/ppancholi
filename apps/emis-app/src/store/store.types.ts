import { Store } from 'vuex';
import { IState as IRegistrationState } from '@libs/registration-lib/store/modules/registration/registration.types';
import { IHouseholdEntityState } from '@libs/registration-lib/store/modules/household/householdEntity.types';
import { IHouseholdMetadata } from '@libs/entities-lib/household';
import * as vuexModule from '@/constants/vuex-modules';
import { IState as IOptionListState } from '@/store/modules/optionList/optionList.types';

import { IState as IBaseState } from '@/store/modules/base/base.types';

import { IUserAccountEntityState } from '@/store/modules/user-account/userAccountEntity.types';
import { IUserAccountMetadata } from '@libs/entities-lib/user-account';

import { ICaseFileEntityState } from '@/store/modules/case-file/caseFileEntity.types';
import { ICaseFileMetadata } from '@libs/entities-lib/case-file';

import { ICaseNoteEntityState } from '@/store/modules/case-note/caseNoteEntity.types';
import { ICaseNoteMetadata } from '@libs/entities-lib/case-note';

import { IFinancialAssistanceEntityState } from '@/store/modules/financial-assistance/financialAssistanceEntity.types';
import { IFinancialAssistanceTableMetadata } from '@libs/entities-lib/financial-assistance';

import { ITeamEntityState } from '@/store/modules/team/teamEntity.types';
import { ITeamMetadata } from '@libs/entities-lib/team';

import { IFinancialAssistanceCategoryEntityState } from '@/store/modules/financial-assistance-category/financialAssistanceCategoryEntity.types';
import { IFinancialAssistancePaymentMetadata } from '@libs/entities-lib/financial-assistance-payment';
import { IProvider, IProviderMock } from '@/services/provider';
import { IApprovalTableMetadata } from '@libs/entities-lib/approvals/approvals-table';
import { IApprovalTableEntityState } from '@/store/modules/approval-table/approvalTableEntity.types';
import { IFinancialAssistancePaymentEntityState } from './modules/financial-assistance-payments/financialAssistancePaymentEntity.types';

export interface IRootState {
  version: string;
  [vuexModule.CASE_FILE_ENTITIES]?: ICaseFileEntityState,
  [vuexModule.CASE_FILE_METADATA]?: IBaseState<ICaseFileMetadata>
  [vuexModule.CASE_NOTE_ENTITIES]?: ICaseNoteEntityState,
  [vuexModule.CASE_NOTE_METADATA]?: IBaseState<ICaseNoteMetadata>
  [vuexModule.USER_ACCOUNT_ENTITIES]?: IUserAccountEntityState,
  [vuexModule.USER_ACCOUNT_METADATA]?: IBaseState<IUserAccountMetadata>,
  [vuexModule.FINANCIAL_ASSISTANCE_ENTITIES]?: IFinancialAssistanceEntityState,
  [vuexModule.FINANCIAL_ASSISTANCE_METADATA]?: IBaseState<IFinancialAssistanceTableMetadata>,
  [vuexModule.HOUSEHOLD_ENTITIES]?: IHouseholdEntityState
  [vuexModule.HOUSEHOLD_METADATA]?: IBaseState<IHouseholdMetadata>
  [vuexModule.OPTION_LIST_MODULE]?: IOptionListState,
  [vuexModule.TEAM_ENTITIES]?: ITeamEntityState,
  [vuexModule.TEAM_METADATA]?: IBaseState<ITeamMetadata>,
  [vuexModule.REGISTRATION_MODULE]?: IRegistrationState,
  [vuexModule.FINANCIAL_ASSISTANCE_CATEGORY_ENTITIES]?: IFinancialAssistanceCategoryEntityState,
  [vuexModule.FINANCIAL_ASSISTANCE_PAYMENT_ENTITIES]?: IFinancialAssistancePaymentEntityState,
  [vuexModule.FINANCIAL_ASSISTANCE_PAYMENT_METADATA]?: IBaseState<IFinancialAssistancePaymentMetadata>,
  [vuexModule.APPROVALS_TABLE_ENTITIES]?: IApprovalTableEntityState,
  [vuexModule.APPROVALS_TABLE_METADATA]?: IBaseState<IApprovalTableMetadata>,
}

export type IState = IRootState;

export interface IStore<S> extends Store<S> {
  $services: IProvider | IProviderMock;
  _actions?: Record<string, Array<unknown>>
}
