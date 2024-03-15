import { PublicService } from '@libs/services-lib/public';
import { HouseholdsService } from '@libs/services-lib/households/entity';
import { HouseholdMetadataService } from '@libs/services-lib/households/metadata';
import { httpClient as client } from '@/services/httpClient';
import { CaseFilesService } from '@libs/services-lib/case-files/entity';
import { OptionItemsService } from '@libs/services-lib/optionItems';
import { ErrorReportingService } from '@libs/services-lib/error-reporting';
import { TeamsService } from '@libs/services-lib/teams/entity';
import { ProgramsService } from '@libs/services-lib/programs/entity';
import { FinancialAssistanceTablesService } from '@libs/services-lib/financial-assistance-tables/entity';
import { UserAccountsService } from '@libs/services-lib/user-accounts/entity';
import { EventsService } from '@libs/services-lib/events/entity';
import { CaseFileReferralsService } from '@libs/services-lib/case-file-referrals/entity';
import { CaseFileDocumentsService } from '@libs/services-lib/case-file-documents/entity';
import { CaseNotesService } from '@libs/services-lib/case-notes/entity';
import { FinancialAssistancePaymentsService } from '@libs/services-lib/financial-assistance-payments/entity';
import { CaseFilesMetadataService } from '@libs/services-lib/case-files/metadata';
import { EventsMetadataService } from '@libs/services-lib/events/metadata';
import { FinancialAssistancePaymentsMetadataService } from '@libs/services-lib/financial-assistance-payments/metadata';
import { TenantSettingsService } from '@libs/services-lib/tenantSettings/entity';
import { MassActionService } from '@libs/services-lib/mass-actions/entity';
import { ApprovalTablesService } from '@libs/services-lib/approval-tables/entity';
import { ApprovalTablesMetadataService } from '@libs/services-lib/approval-tables/metadata/approvalTables';
import { AssessmentResponsesService } from '@libs/services-lib/assessment-response/entity';
import { AssessmentFormsService } from '@libs/services-lib/assessment-form/entity';
import { TaskService } from '@libs/services-lib/task/entity';
import { PotentialDuplicatesService } from '@libs/services-lib/potential-duplicates/entity';
import { NotificationsService } from '@libs/services-lib/notifications/entity';
import { QueriesService } from '@libs/services-lib/queries/entity';
import { IProvider } from './provider.types';

export const provider = (httpClient = client): IProvider => ({
  approvalTables: new ApprovalTablesService(httpClient),
  approvalTablesMetadata: new ApprovalTablesMetadataService(httpClient),
  caseFiles: new CaseFilesService(httpClient),
  caseFilesMetadata: new CaseFilesMetadataService(httpClient),
  caseFileNotes: new CaseNotesService(httpClient),
  caseFileReferrals: new CaseFileReferralsService(httpClient),
  caseFileDocuments: new CaseFileDocumentsService(httpClient),
  events: new EventsService(httpClient),
  eventsMetadata: new EventsMetadataService(httpClient),
  optionItems: new OptionItemsService(httpClient),
  teams: new TeamsService(httpClient),
  programs: new ProgramsService(httpClient),
  publicApi: new PublicService(httpClient),
  households: new HouseholdsService(httpClient),
  householdsMetadata: new HouseholdMetadataService(httpClient),
  financialAssistanceTables: new FinancialAssistanceTablesService(httpClient),
  financialAssistancePaymentsService: new FinancialAssistancePaymentsService(httpClient),
  financialAssistancePaymentsServiceMetadata: new FinancialAssistancePaymentsMetadataService(httpClient),
  userAccounts: new UserAccountsService(httpClient),
  massActions: new MassActionService(httpClient),
  tenantSettings: new TenantSettingsService(httpClient),
  errorReporting: new ErrorReportingService(httpClient),
  assessmentForms: new AssessmentFormsService(httpClient),
  assessmentResponses: new AssessmentResponsesService(httpClient),
  task: new TaskService(httpClient),
  potentialDuplicates: new PotentialDuplicatesService(httpClient),
  notifications: new NotificationsService(httpClient),
  queries: new QueriesService(httpClient),
});
