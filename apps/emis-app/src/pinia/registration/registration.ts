import { storeFactory } from '@libs/stores-lib/registration/registration';
import { ERegistrationMode } from '@libs/shared-lib/types';
import { PublicService } from '@libs/services-lib/public';
import { HouseholdsService } from '@libs/services-lib/households/entity';
import { CaseFilesService } from '@libs/services-lib/case-files/entity';
import { httpClient } from '../../services/httpClient';
import { i18n } from '../../ui/plugins';
import { tabs } from './tabs';

export const useRegistrationStore = () => storeFactory({
  pTabs: tabs(),
  i18n,
  skipAgeRestriction: true,
  skipEmailPhoneRules: true,
  mode: ERegistrationMode.CRC,
  publicApi: new PublicService(httpClient),
  householdApi: new HouseholdsService(httpClient),
  caseFileApi: new CaseFilesService(httpClient),
});
