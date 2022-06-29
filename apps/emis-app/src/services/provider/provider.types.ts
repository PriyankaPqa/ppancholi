import { IHouseholdsService, IHouseholdsServiceMock } from '@libs/registration-lib/services/households/entity';
import {
  IPublicService,
  IPublicServiceMock,
} from '@libs/registration-lib/services/public';
import { IHouseholdMetadataService } from '@libs/registration-lib/services/households/metadata';
import { IMassActionService, IMassActionServiceMock } from '@/services/mass-actions/entity';
import { ICaseFilesService, ICaseFilesServiceMock } from '../case-files/entity';
import { IOptionItemsService, IOptionItemsServiceMock } from '../optionItems';
import { ITeamsService, ITeamsServiceMock } from '../teams/entity';
import { IAppUsersService, IAppUsersServiceMock } from '../app-users';
import { IProgramsService, IProgramsServiceMock } from '../programs/entity';
import { IUserAccountsServiceMock, UserAccountsService } from '../user-accounts/entity';
import { IEventsService, IEventsServiceMock } from '../events/entity';
import { ICaseNotesService, ICaseNotesServiceMock } from '../case-notes/entity';
import { ICaseFileReferralsService, ICaseFileReferralsServiceMock } from '../case-file-referrals/entity';
import { ICaseFileDocumentsService, ICaseFileDocumentsServiceMock } from '../case-file-documents/entity';
import { IFinancialAssistanceTablesService, IFinancialAssistanceTablesServiceMock } from '../financial-assistance-tables/entity';
import { IFinancialAssistanceCategoriesService, IFinancialAssistanceCategoriesServiceMock } from '../financial-assistance-categories/entity';
import { IFinancialAssistancePaymentsService, IFinancialAssistancePaymentsServiceMock } from '../financial-assistance-payments/entity';
import { ICaseFilesMetadataService, ICaseFilesMetadataServiceMock } from '../case-files/metadata';
import { ICaseNotesMetadataService } from '../case-notes/metadata';
import { ICaseFileReferralsMetadataService } from '../case-file-referrals/metadata';
import { ICaseFileDocumentsMetadataService } from '../case-file-documents/metadata';
import { IEventsMetadataService } from '../events/metadata';
import { IFinancialAssistancePaymentsMetadataService } from '../financial-assistance-payments/metadata';
import { ITenantSettingsService, ITenantSettingsServiceMock } from '../tenantSettings/entity';
import { IErrorReportingService, IErrorReportingServiceMock } from '../error-reporting';

export interface IProvider {
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
  financialAssistanceCategories: IFinancialAssistanceCategoriesService,
  massActions: IMassActionService;
  tenantSettings: ITenantSettingsService;
  errorReporting: IErrorReportingService;
}

export interface IProviderMock {
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
  financialAssistanceCategories: IFinancialAssistanceCategoriesServiceMock,
  massActions: IMassActionServiceMock,
  tenantSettings: ITenantSettingsServiceMock;
  errorReporting: IErrorReportingServiceMock;
}
