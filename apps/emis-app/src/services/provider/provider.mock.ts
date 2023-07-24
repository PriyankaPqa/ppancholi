import { mockPublicService } from '@libs/services-lib/public';
import { mockHouseholdsService } from '@libs/services-lib/households/entity';
import { mockMassActionService } from '@libs/services-lib/mass-actions/entity';
import { mockAppUsersService } from '@libs/services-lib/app-users';
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
import { mockApprovalTablesMetadataService } from '@libs/services-lib/approval-tables/metadata/approvalsTables.mock';
import { mockAssessmentResponsesService } from '@libs/services-lib/assessment-response/entity';
import { mockAssessmentFormsService } from '@libs/services-lib/assessment-form/entity';
import { mockPotentialDuplicatesService } from '@libs/services-lib/potential-duplicates/entity';
import { IProviderMock } from './provider.types';

export const mockProvider = (): IProviderMock => ({
  approvalTables: mockApprovalTablesService(),
  approvalTablesMetadata: mockApprovalTablesMetadataService(),
  appUsers: mockAppUsersService(),
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
  potentialDuplicates: mockPotentialDuplicatesService(),
});
