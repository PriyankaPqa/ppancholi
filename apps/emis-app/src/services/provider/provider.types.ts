import { IHouseholdsService, IHouseholdsServiceMock } from '@libs/services-lib/households/entity';
import {
  IPublicService,
  IPublicServiceMock,
} from '@libs/services-lib/public';
import { IMassActionService, IMassActionServiceMock } from '@libs/services-lib/mass-actions/entity';
import { ICaseFilesService, ICaseFilesServiceMock } from '@libs/services-lib/case-files/entity';
import { IOptionItemsService, IOptionItemsServiceMock } from '@libs/services-lib/optionItems';
import { ITeamsService, ITeamsServiceMock } from '@libs/services-lib/teams/entity';
import { IProgramsService, IProgramsServiceMock } from '@libs/services-lib/programs/entity';
import { IUserAccountsServiceMock, UserAccountsService } from '@libs/services-lib/user-accounts/entity';
import { IEventsService, IEventsServiceMock } from '@libs/services-lib/events/entity';
import { ICaseNotesService, ICaseNotesServiceMock } from '@libs/services-lib/case-notes/entity';
import { ICaseFileReferralsService, ICaseFileReferralsServiceMock } from '@libs/services-lib/case-file-referrals/entity';
import { ICaseFileDocumentsService, ICaseFileDocumentsServiceMock } from '@libs/services-lib/case-file-documents/entity';
import { IFinancialAssistanceTablesService, IFinancialAssistanceTablesServiceMock } from '@libs/services-lib/financial-assistance-tables/entity';
import { IFinancialAssistancePaymentsService, IFinancialAssistancePaymentsServiceMock } from '@libs/services-lib/financial-assistance-payments/entity';
import { ICaseFilesMetadataService, ICaseFilesMetadataServiceMock } from '@libs/services-lib/case-files/metadata';
import { ITenantSettingsService, ITenantSettingsServiceMock } from '@libs/services-lib/tenantSettings/entity';
import { IErrorReportingService, IErrorReportingServiceMock } from '@libs/services-lib/error-reporting';
import { IApprovalTablesService, IApprovalTablesServiceMock } from '@libs/services-lib/approval-tables/entity';
import { IAssessmentResponsesService, IAssessmentResponsesServiceMock } from '@libs/services-lib/assessment-response/entity';
import { IAssessmentFormsService, IAssessmentFormsServiceMock } from '@libs/services-lib/assessment-form/entity';
import { ITaskService, ITaskServiceMock } from '@libs/services-lib/task/entity';
import { IPotentialDuplicatesService, IPotentialDuplicatesServiceMock } from '@libs/services-lib/potential-duplicates/entity';
import { INotificationsService, INotificationsServiceMock } from '@libs/services-lib/notifications/entity';
import { IQueriesService, IQueriesServiceMock } from '@libs/services-lib/queries/entity';
import { IPersonsService, IPersonsServiceMock } from '@libs/services-lib/persons/entity';
import { ICaseFileIndividualsService, ICaseFileIndividualsServiceMock } from '@libs/services-lib/case-file-individuals';
import { IBookingRequestsService, IBookingRequestsServiceMock } from '@libs/services-lib/booking-requests';
import { IAppointmentStaffMembersService, IAppointmentStaffMembersServiceMock } from '@libs/services-lib/appointment-staff-members';

export interface IProvider {
  approvalTables: IApprovalTablesService,
  bookingRequests: IBookingRequestsService,
  caseFiles: ICaseFilesService,
  caseFileIndividuals: ICaseFileIndividualsService,
  caseFilesMetadata: ICaseFilesMetadataService,
  caseFileNotes: ICaseNotesService,
  caseFileReferrals: ICaseFileReferralsService
  caseFileDocuments: ICaseFileDocumentsService
  events: IEventsService;
  optionItems: IOptionItemsService;
  teams: ITeamsService,
  programs: IProgramsService,
  publicApi: IPublicService,
  households: IHouseholdsService,
  persons: IPersonsService,
  financialAssistanceTables: IFinancialAssistanceTablesService,
  financialAssistancePaymentsService: IFinancialAssistancePaymentsService,
  userAccounts: UserAccountsService,
  massActions: IMassActionService;
  tenantSettings: ITenantSettingsService;
  errorReporting: IErrorReportingService;
  assessmentForms: IAssessmentFormsService;
  assessmentResponses: IAssessmentResponsesService;
  task: ITaskService;
  potentialDuplicates: IPotentialDuplicatesService;
  notifications: INotificationsService;
  queries: IQueriesService,
  appointmentStaffMembers: IAppointmentStaffMembersService,
}

export interface IProviderMock {
  approvalTables: IApprovalTablesServiceMock,
  bookingRequests: IBookingRequestsServiceMock,
  caseFiles: ICaseFilesServiceMock,
  caseFileIndividuals: ICaseFileIndividualsServiceMock,
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
  persons: IPersonsServiceMock,
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
  queries: IQueriesServiceMock;
  appointmentStaffMembers: IAppointmentStaffMembersServiceMock;
}
