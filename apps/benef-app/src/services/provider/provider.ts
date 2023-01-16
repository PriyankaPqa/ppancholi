import { PublicService } from '@libs/services-lib/public';
import { HouseholdsService } from '@libs/services-lib/households/entity';
import { TenantSettingsService } from '@libs/services-lib/tenantSettings/entity';
import { AssessmentResponsesService } from '@libs/services-lib/assessment-response/entity';
import { AssessmentFormsService } from '@libs/services-lib/assessment-form/entity';
import { httpClient as client } from '@/services/httpClient';
import { IProvider } from './provider.types';

export const provider = (httpClient = client): IProvider => ({
  publicApi: new PublicService(httpClient),
  households: new HouseholdsService(httpClient),
  tenantSettings: new TenantSettingsService(httpClient),
  assessmentForms: new AssessmentFormsService(httpClient),
  assessmentResponses: new AssessmentResponsesService(httpClient),
});
