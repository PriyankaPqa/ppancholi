import { IHouseholdsService, IHouseholdsServiceMock } from '@crctech/registration-lib/src/services/households/entity';
import {
  IPublicService,
  IPublicServiceMock,
} from '@crctech/registration-lib/src/services/public';
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
import { IMassActionService, IMassActionServiceMock } from '@/services/mass-actions/entity';
import { IFinancialAssistancePaymentsService, IFinancialAssistancePaymentsServiceMock } from '../financial-assistance-payments/entity';
import { ITenantSettingsService, ITenantSettingsServiceMock } from '../tenantSettings/entity';
import { IFeaturesService, IFeaturesServiceMock } from '../features/entity';

export interface IProvider {
  appUsers: IAppUsersService,
  caseFiles: ICaseFilesService,
  caseFileNotes: ICaseNotesService,
  caseFileReferrals: ICaseFileReferralsService
  caseFileDocuments: ICaseFileDocumentsService
  events: IEventsService;
  optionItems: IOptionItemsService;
  teams: ITeamsService,
  programs: IProgramsService,
  publicApi: IPublicService,
  households: IHouseholdsService,
  financialAssistanceTables: IFinancialAssistanceTablesService,
  financialAssistancePaymentsService: IFinancialAssistancePaymentsService,
  userAccounts: UserAccountsService,
  financialAssistanceCategories: IFinancialAssistanceCategoriesService,
  massActions: IMassActionService;
  tenantSettings: ITenantSettingsService;
  features: IFeaturesService;
}

export interface IProviderMock {
  appUsers: IAppUsersServiceMock,
  caseFiles: ICaseFilesServiceMock,
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
  features: IFeaturesServiceMock,
}
