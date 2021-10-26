import { Store } from 'vuex';
import { IState as IRegistrationState } from '@crctech/registration-lib/src/store/modules/registration/registration.types';
import { IHouseholdEntityState } from '@crctech/registration-lib/src/store/modules/household/householdEntity.types';
import { IHouseholdMetadata } from '@crctech/registration-lib/src/entities/household';
import { IProvider, IProviderMock } from '@/services/provider';
import * as vuexModule from '@/constants/vuex-modules';
import { IState as IDashboardState } from '@/store/modules/dashboard/dashboard.types';
import { IState as IOptionListState } from '@/store/modules/optionList/optionList.types';

import { IProgramEntityState } from '@/store/modules/program/programEntity.types';
import { IProgramMetadata } from '@/entities/program';

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

import { IFinancialAssistanceEntityState } from '@/store/modules/financial-assistance/financialAssistanceEntity.types';
import { IFinancialAssistanceTableMetadata } from '@/entities/financial-assistance';

import { ITeamEntityState } from '@/store/modules/team/teamEntity.types';
import { ITeamMetadata } from '@/entities/team';

import { IFinancialAssistanceCategoryEntityState } from '@/store/modules/financial-assistance-category/financialAssistanceCategoryEntity.types';
import { IFinancialAssistancePaymentMetadata } from '@/entities/financial-assistance-payment';
import { IFinancialAssistancePaymentEntityState } from './modules/financial-assistance-payments/financialAssistancePaymentEntity.types';

import { IBrandingEntityState } from '@/store/modules/branding/brandingEntity.types';
import { IFeatureEntityState } from '@/store/modules/feature/featureEntity.types';
import { ITenantSettingsEntityState } from './modules/tenantSettings/tenantSettingsEntity.types';

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
  [vuexModule.TEAM_ENTITIES]?: ITeamEntityState,
  [vuexModule.TEAM_METADATA]?: IBaseState<ITeamMetadata>,
  [vuexModule.PROGRAM_ENTITIES]?: IProgramEntityState,
  [vuexModule.PROGRAM_METADATA]?: IBaseState<IProgramMetadata>,
  [vuexModule.REGISTRATION_MODULE]?: IRegistrationState,
  [vuexModule.FINANCIAL_ASSISTANCE_CATEGORY_ENTITIES]?: IFinancialAssistanceCategoryEntityState,
  [vuexModule.FINANCIAL_ASSISTANCE_PAYMENT_ENTITIES]?: IFinancialAssistancePaymentEntityState,
  [vuexModule.FINANCIAL_ASSISTANCE_PAYMENT_METADATA]?: IBaseState<IFinancialAssistancePaymentMetadata>,
  [vuexModule.BRANDING_ENTITIES]?: IBrandingEntityState,
  [vuexModule.FEATURE_ENTITIES]?: IFeatureEntityState,
  [vuexModule.TENANT_SETTINGS_ENTITIES]?: ITenantSettingsEntityState,
}

export type IState = IRootState;

export interface IStore<S> extends Store<S> {
  $services: IProvider | IProviderMock;
  _actions?: Record<string, Array<unknown>>
}
