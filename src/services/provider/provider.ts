import { PublicService } from '@crctech/registration-lib/src/services/public';
import { HouseholdsService } from '@crctech/registration-lib/src/services/households/entity';
import { HouseholdMetadataService } from '@crctech/registration-lib/src/services/households/metadata';
import { httpClient } from '@/services/httpClient';
import { IProvider } from './provider.types';
import { CaseFilesService } from '../case-files/entity';
import { AppUsersService } from '../app-users';
import { OptionItemsService } from '../optionItems';
import { TeamsService } from '../teams/entity';
import { ProgramsService } from '../programs/entity';
import { FinancialAssistanceTablesService } from '../financial-assistance-tables/entity';
import { UserAccountsService } from '../user-accounts/entity';
import { EventsService } from '../events/entity';
import { CaseFileReferralsService } from '../case-file-referrals/entity';
import { CaseFileDocumentsService } from '../case-file-documents/entity';
import { CaseNotesService } from '../case-notes/entity';
import { FinancialAssistanceCategoriesService } from '../financial-assistance-categories/entity';
import { MassActionService } from '@/services/mass-actions/entity';
import { FinancialAssistancePaymentsService } from '../financial-assistance-payments/entity';
import { CaseFilesMetadataService } from '../case-files/metadata';
import { CaseNotesMetadataService } from '../case-notes/metadata';
import { CaseFileReferralsMetadataService } from '../case-file-referrals/metadata';
import { CaseFileDocumentsMetadataService } from '../case-file-documents/metadata';
import { EventsMetadataService } from '../events/metadata';
import { FinancialAssistancePaymentsMetadataService } from '../financial-assistance-payments/metadata';
import { TenantSettingsService } from '../tenantSettings/entity';

export const provider = (): IProvider => ({
  appUsers: new AppUsersService(httpClient),
  caseFiles: new CaseFilesService(httpClient),
  caseFilesMetadata: new CaseFilesMetadataService(httpClient),
  caseFileNotes: new CaseNotesService(httpClient),
  caseFileNotesMetadata: new CaseNotesMetadataService(httpClient),
  caseFileReferrals: new CaseFileReferralsService(httpClient),
  caseFileReferralsMetadata: new CaseFileReferralsMetadataService(httpClient),
  caseFileDocuments: new CaseFileDocumentsService(httpClient),
  caseFileDocumentsMetadata: new CaseFileDocumentsMetadataService(httpClient),
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
  financialAssistanceCategories: new FinancialAssistanceCategoriesService(httpClient),
  massActions: new MassActionService(httpClient),
  tenantSettings: new TenantSettingsService(httpClient),
});
