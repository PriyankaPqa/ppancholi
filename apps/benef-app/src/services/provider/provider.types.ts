import { IHouseholdsService, IHouseholdsServiceMock } from '@libs/services-lib/households/entity';
import { IPublicService, IPublicServiceMock } from '@libs/services-lib/public';
import { ICaseFilesService, ICaseFilesServiceMock } from '@libs/services-lib/case-files/entity';
import { ITenantSettingsService, ITenantSettingsServiceMock } from '@libs/services-lib/tenantSettings/entity';
import { IAssessmentResponsesService, IAssessmentResponsesServiceMock } from '@libs/services-lib/assessment-response/entity';
import { IAssessmentFormsService, IAssessmentFormsServiceMock } from '@libs/services-lib/assessment-form/entity';

export interface IProvider {
  publicApi: IPublicService,
  households: IHouseholdsService,
  tenantSettings: ITenantSettingsService;
  assessmentForms: IAssessmentFormsService;
  assessmentResponses: IAssessmentResponsesService;
  caseFiles: ICaseFilesService;
}

export interface IProviderMock {
  publicApi: IPublicServiceMock,
  households: IHouseholdsServiceMock,
  tenantSettings: ITenantSettingsServiceMock;
  assessmentForms: IAssessmentFormsServiceMock;
  assessmentResponses: IAssessmentResponsesServiceMock;
  caseFiles: ICaseFilesServiceMock;
}
