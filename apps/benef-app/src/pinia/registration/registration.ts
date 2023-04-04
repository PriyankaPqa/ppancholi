import { storeFactory } from '@libs/stores-lib/registration/registration';
import { i18n } from '@/ui/plugins';
import { ERegistrationMode } from '@libs/shared-lib/types';
import { httpClient } from '@/services/httpClient';
import { PublicService } from '@libs/services-lib/public';
import { HouseholdsService } from '@libs/services-lib/households/entity';
import { CaseFilesService } from '@libs/services-lib/case-files/entity';
import { tabs } from './tabs';

export const useRegistrationStore = () => storeFactory({
  pTabs: tabs(),
  i18n,
  skipAgeRestriction: false,
  skipEmailPhoneRules: false,
  mode: ERegistrationMode.Self,
  publicApi: new PublicService(httpClient),
  householdApi: new HouseholdsService(httpClient),
  caseFileApi: new CaseFilesService(httpClient),
});
