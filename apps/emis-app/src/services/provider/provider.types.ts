import { IHouseholdsService, IHouseholdsServiceMock } from '@libs/services-lib/households/entity';
import {
  IPublicService,
  IPublicServiceMock,
} from '@libs/services-lib/public';
import { IHouseholdMetadataService } from '@libs/services-lib/households/metadata';
import { IMassActionService, IMassActionServiceMock } from '@libs/services-lib/mass-actions/entity';
import { ICaseFilesService, ICaseFilesServiceMock } from '@libs/services-lib/case-files/entity';
import { IOptionItemsService, IOptionItemsServiceMock } from '@libs/services-lib/optionItems';
import { ITeamsService, ITeamsServiceMock } from '@libs/services-lib/teams/entity';
import { IAppUsersService, IAppUsersServiceMock } from '@libs/services-lib/app-users';
import { IProgramsService, IProgramsServiceMock } from '@libs/services-lib/programs/entity';
import { IUserAccountsServiceMock, UserAccountsService } from '@libs/services-lib/user-accounts/entity';
import { IEventsService, IEventsServiceMock } from '@libs/services-lib/events/entity';
import { ICaseNotesService, ICaseNotesServiceMock } from '@libs/services-lib/case-notes/entity';
import { ICaseFileReferralsService, ICaseFileReferralsServiceMock } from '@libs/services-lib/case-file-referrals/entity';
import { ICaseFileDocumentsService, ICaseFileDocumentsServiceMock } from '@libs/services-lib/case-file-documents/entity';
import { IFinancialAssistanceTablesService, IFinancialAssistanceTablesServiceMock } from '@libs/services-lib/financial-assistance-tables/entity';
import { IFinancialAssistancePaymentsService, IFinancialAssistancePaymentsServiceMock } from '@libs/services-lib/financial-assistance-payments/entity';
import { ICaseFilesMetadataService, ICaseFilesMetadataServiceMock } from '@libs/services-lib/case-files/metadata';
import { ICaseNotesMetadataService } from '@libs/services-lib/case-notes/metadata';
import { ICaseFileReferralsMetadataService } from '@libs/services-lib/case-file-referrals/metadata';
import { ICaseFileDocumentsMetadataService } from '@libs/services-lib/case-file-documents/metadata';
import { IEventsMetadataService } from '@libs/services-lib/events/metadata';
import { IFinancialAssistancePaymentsMetadataService } from '@libs/services-lib/financial-assistance-payments/metadata';
import { ITenantSettingsService, ITenantSettingsServiceMock } from '@libs/services-lib/tenantSettings/entity';
import { IErrorReportingService, IErrorReportingServiceMock } from '@libs/services-lib/error-reporting';
import { IApprovalTablesService, IApprovalTablesServiceMock } from '@libs/services-lib/approval-tables/entity';
import { IApprovalTablesMetadataService, IApprovalTablesMetadataServiceMock } from '@libs/services-lib/approval-tables/metadata/approvals.types';
import { IAssessmentResponsesService, IAssessmentResponsesServiceMock } from '@libs/services-lib/assessment-response/entity';
import { IAssessmentFormsService, IAssessmentFormsServiceMock } from '@libs/services-lib/assessment-form/entity';
import { ITaskService, ITaskServiceMock } from '@libs/services-lib/task/entity';
import { IPotentialDuplicatesService, IPotentialDuplicatesServiceMock } from '@libs/services-lib/potential-duplicates/entity';
import { INotificationsService, INotificationsServiceMock } from '@libs/services-lib/notifications/entity';

export interface IProvider {
  approvalTables: IApprovalTablesService,
  approvalTablesMetadata: IApprovalTablesMetadataService,
  appUsers: IAppUsersService,
  caseFiles: ICaseFilesService,
  caseFilesMetadata: ICaseFilesMetadataService,
  caseFileNotes: ICaseNotesService,
  caseFileNotesMetadata: ICaseNotesMetadataService,
  caseFileReferrals: ICaseFileReferralsService
  caseFileReferralsMetadata: ICaseFileReferralsMetadataService
  caseFileDocuments: ICaseFileDocumentsService
  caseFileDocumentsMetadata: ICaseFileDocumentsMetadataService
  events: IEventsService;
  eventsMetadata: IEventsMetadataService;
  optionItems: IOptionItemsService;
  teams: ITeamsService,
  programs: IProgramsService,
  publicApi: IPublicService,
  households: IHouseholdsService,
  householdsMetadata: IHouseholdMetadataService,
  financialAssistanceTables: IFinancialAssistanceTablesService,
  financialAssistancePaymentsService: IFinancialAssistancePaymentsService,
  financialAssistancePaymentsServiceMetadata: IFinancialAssistancePaymentsMetadataService,
  userAccounts: UserAccountsService,
  massActions: IMassActionService;
  tenantSettings: ITenantSettingsService;
  errorReporting: IErrorReportingService;
  assessmentForms: IAssessmentFormsService;
  assessmentResponses: IAssessmentResponsesService;
  task: ITaskService;
  potentialDuplicates: IPotentialDuplicatesService;
  notifications: INotificationsService;
}

export interface IProviderMock {
  approvalTables: IApprovalTablesServiceMock,
  approvalTablesMetadata: IApprovalTablesMetadataServiceMock,
  appUsers: IAppUsersServiceMock,
  caseFiles: ICaseFilesServiceMock,
  caseFilesMetadata: ICaseFilesMetadataServiceMock,
  caseFileNotes: ICaseNotesServiceMock,
  caseFileReferrals: ICaseFileReferralsServiceMock,
  caseFileDocuments: ICaseFileDocumentsServiceMock,
  events: IEventsServiceMock;
  optionItems: IOptionItemsServiceMock;
  teams: ITeamsServiceMock,
  programs: IProgramsServiceMock,
  publicApi: IPublicServiceMock,
  households: IHouseholdsServiceMock,
  financialAssistanceTables: IFinancialAssistanceTablesServiceMock,
  financialAssistancePaymentsService: IFinancialAssistancePaymentsServiceMock,
  userAccounts: IUserAccountsServiceMock,
  massActions: IMassActionServiceMock,
  tenantSettings: ITenantSettingsServiceMock;
  errorReporting: IErrorReportingServiceMock;
  assessmentForms: IAssessmentFormsServiceMock;
  assessmentResponses: IAssessmentResponsesServiceMock;
  task: ITaskServiceMock;
  potentialDuplicates: IPotentialDuplicatesServiceMock;
  notifications: INotificationsServiceMock;
}
