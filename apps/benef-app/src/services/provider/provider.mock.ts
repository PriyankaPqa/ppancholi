import { mockPublicService } from '@libs/services-lib/public';
import { mockHouseholdsService } from '@libs/services-lib/households/entity';
import { mockTenantSettingsService } from '@libs/services-lib/tenantSettings/entity';
import { mockAssessmentResponsesService } from '@libs/services-lib/assessment-response/entity';
import { mockAssessmentFormsService } from '@libs/services-lib/assessment-form/entity';
import { IProviderMock } from './provider.types';

export const mockProvider = (): IProviderMock => ({
  publicApi: mockPublicService(),
  households: mockHouseholdsService(),
  tenantSettings: mockTenantSettingsService(),
  assessmentResponses: mockAssessmentResponsesService(),
  assessmentForms: mockAssessmentFormsService(),
});
