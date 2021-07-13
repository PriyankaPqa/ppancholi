import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';
import { makeRegistrationModule } from '@crctech/registration-lib/src/store/modules/registration';
import { i18n } from '@/ui/plugins';
import { ERegistrationMode } from '@crctech/registration-lib/src/types';
import { UserAccountEntityModule } from '@/store/modules/user-account/userAccountEntity';
import { CaseFileEntityModule } from '@/store/modules/case-file/caseFileEntity';
import { UserAccountsService } from '@/services/user-accounts/entity';
import { UserAccountsMetadataService } from '@/services/user-accounts/metadata';
import { httpClient } from '@/services/httpClient';
import { UserAccountMetadataModule } from '@/store/modules/user-account/userAccountMetadata';
import { CaseFileMetadataModule } from '@/store/modules/case-file/caseFileMetadata';
import * as vuexModule from '@/constants/vuex-modules';
import { CaseFilesService } from '@/services/case-files/entity';
import { CaseFilesMetadataService } from '@/services/case-files/metadata';
import { HouseholdMetadataModule } from '@crctech/registration-lib/src/store/modules/household/householdMetadata';
import { HouseholdMetadataService } from '@crctech/registration-lib/src/services/households/metadata';
import { HouseholdsService } from '@crctech/registration-lib/src/services/households/entity';
import { HouseholdEntityModule } from '@crctech/registration-lib/src/store/modules/household';
import { CaseNotesService } from '@/services/case-notes/entity';
import { CaseNotesMetadataService } from '@/services/case-notes/metadata';
import { CaseFileReferralsService } from '@/services/case-file-referrals/entity';
import { CaseFileReferralsMetadataService } from '@/services/case-file-referrals/metadata';
import { OptionItemsService } from '../services/optionItems/optionItems';
import { IRootState } from './store.types';
import { user } from './modules/user';
import { dashboard } from './modules/dashboard';
import { optionList } from './modules/optionList';
import { event } from './modules/event';
import { team } from './modules/team';
import { program } from './modules/program';
import { financialAssistance } from './modules/financial-assistance';

import { tabs } from './modules/registration/tabs';
import { CaseNoteEntityModule } from './modules/case-note/caseNoteEntity';
import { CaseNoteMetadataModule } from './modules/case-note/caseNoteMetadata';
import { CaseFileReferralEntityModule } from './modules/case-file-referral/caseFileReferralEntity';
import { CaseFileReferralMetadataModule } from './modules/case-file-referral/caseFileReferralMetadata';

Vue.use(Vuex);

const store: StoreOptions<IRootState> = {
  strict: process.env.NODE_ENV !== 'production',
  state: {
    version: '1.0.0', // a simple property
  },
  modules: {
    [vuexModule.CASE_FILE_ENTITIES]: new CaseFileEntityModule(new CaseFilesService(httpClient), new OptionItemsService(httpClient)).getModule(),
    [vuexModule.CASE_FILE_METADATA]: new CaseFileMetadataModule(new CaseFilesMetadataService(httpClient)).getModule(),
    [vuexModule.CASE_NOTE_ENTITIES]: new CaseNoteEntityModule(new CaseNotesService(httpClient), new OptionItemsService(httpClient)).getModule(),
    [vuexModule.CASE_NOTE_METADATA]: new CaseNoteMetadataModule(new CaseNotesMetadataService(httpClient)).getModule(),
    [vuexModule.CASE_REFERRAL_ENTITIES]:
      new CaseFileReferralEntityModule(new CaseFileReferralsService(httpClient), new OptionItemsService(httpClient)).getModule(),
    [vuexModule.CASE_REFERRAL_METADATA]:
      new CaseFileReferralMetadataModule(new CaseFileReferralsMetadataService(httpClient)).getModule(),
    [vuexModule.USER_MODULE]: user,
    [vuexModule.DASHBOARD_MODULE]: dashboard,
    [vuexModule.EVENT_MODULE]: event,
    [vuexModule.OPTION_LIST_MODULE]: optionList,
    [vuexModule.TEAM_MODULE]: team,
    [vuexModule.PROGRAM_MODULE]: program,
    [vuexModule.FINANCIAL_ASSISTANCE_MODULE]: financialAssistance,
    [vuexModule.HOUSEHOLD_ENTITIES]: new HouseholdEntityModule(new HouseholdsService(httpClient)).getModule(),
    [vuexModule.HOUSEHOLD_METADATA]: new HouseholdMetadataModule(new HouseholdMetadataService(httpClient)).getModule(),
    [vuexModule.REGISTRATION_MODULE]: makeRegistrationModule({
      i18n, tabs: tabs(), skipAgeRestriction: true, skipEmailPhoneRules: true, mode: ERegistrationMode.CRC,
    }),
    [vuexModule.USER_ACCOUNT_ENTITIES]: new UserAccountEntityModule(new UserAccountsService(httpClient)).getModule(),
    [vuexModule.USER_ACCOUNT_METADATA]: new UserAccountMetadataModule(new UserAccountsMetadataService(httpClient)).getModule(),
  },
};

export default new Vuex.Store<IRootState>(store);
