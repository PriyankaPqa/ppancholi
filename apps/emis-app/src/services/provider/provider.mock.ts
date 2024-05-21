import { mockPublicService } from '@libs/services-lib/public';
import { mockHouseholdsService } from '@libs/services-lib/households/entity';
import { mockMassActionService } from '@libs/services-lib/mass-actions/entity';
import { mockCaseFilesService } from '@libs/services-lib/case-files/entity';
import { mockOptionItemsService } from '@libs/services-lib/optionItems';
import { mockTeamsService } from '@libs/services-lib/teams/entity';
import { mockProgramsService } from '@libs/services-lib/programs/entity';
import { mockFinancialAssistanceTablesService } from '@libs/services-lib/financial-assistance-tables/entity';
import { mockUserAccountsService } from '@libs/services-lib/user-accounts/entity';
import { mockEventsService } from '@libs/services-lib/events/entity';
import { mockCaseNotesService } from '@libs/services-lib/case-notes/entity';
import { mockCaseFileReferralsService } from '@libs/services-lib/case-file-referrals/entity';
import { mockCaseFileDocumentsService } from '@libs/services-lib/case-file-documents/entity';
import { mockFinancialAssistanceService } from '@libs/services-lib/financial-assistance-payments/entity';
import { mockTenantSettingsService } from '@libs/services-lib/tenantSettings/entity';
import { mockErrorReportingService } from '@libs/services-lib/error-reporting';
import { mockCaseFilesMetadataService } from '@libs/services-lib/case-files/metadata';
import { mockApprovalTablesService } from '@libs/services-lib/approval-tables/entity';
import { mockAssessmentResponsesService } from '@libs/services-lib/assessment-response/entity';
import { mockAssessmentFormsService } from '@libs/services-lib/assessment-form/entity';
import { mockTaskService } from '@libs/services-lib/task/entity';
import { mockPotentialDuplicatesService } from '@libs/services-lib/potential-duplicates/entity';
import { mockNotificationsService } from '@libs/services-lib/notifications/entity';
import { mockQueriesService } from '@libs/services-lib/queries/entity';
import { mockPersonsService } from '@libs/services-lib/persons/entity';
import { IProviderMock } from './provider.types';

export const mockProvider = (): IProviderMock => ({
  approvalTables: mockApprovalTablesService(),
  caseFiles: mockCaseFilesService(),
  caseFilesMetadata: mockCaseFilesMetadataService(),
  caseFileNotes: mockCaseNotesService(),
  caseFileReferrals: mockCaseFileReferralsService(),
  caseFileDocuments: mockCaseFileDocumentsService(),
  optionItems: mockOptionItemsService(),
  teams: mockTeamsService(),
  programs: mockProgramsService(),
  publicApi: mockPublicService(),
  households: mockHouseholdsService(),
  financialAssistanceTables: mockFinancialAssistanceTablesService(),
  financialAssistancePaymentsService: mockFinancialAssistanceService(),
  userAccounts: mockUserAccountsService(),
  events: mockEventsService(),
  massActions: mockMassActionService(),
  tenantSettings: mockTenantSettingsService(),
  errorReporting: mockErrorReportingService(),
  assessmentResponses: mockAssessmentResponsesService(),
  assessmentForms: mockAssessmentFormsService(),
  task: mockTaskService(),
  potentialDuplicates: mockPotentialDuplicatesService(),
  notifications: mockNotificationsService(),
  queries: mockQueriesService(),
  persons: mockPersonsService(),
});
