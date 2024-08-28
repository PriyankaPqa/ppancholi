/* eslint-disable */
import {
  IQuery, QueryType, ReportingTopic,
} from '@libs/entities-lib/reporting';
import { DataCorrectionFAL6En, DataCorrectionFAL6Fr } from './DataCorrectionFAL6';
import { DataCorrectionHomeAddressL6En, DataCorrectionHomeAddressL6Fr } from './DataCorrectionHomeAddressL6';
import { DataCorrectionIdentitySetL6En, DataCorrectionIdentitySetL6Fr } from './DataCorrectionIdentitySetL6';
import { DataCorrectionLabelL6En, DataCorrectionLabelL6Fr } from './DataCorrectionLabelL6';
import { DataCorrectionTemporaryAddressL6En, DataCorrectionTemporaryAddressL6Fr } from './DataCorrectionTemporaryAddressL6';
import { HouseholdActivitiesL6En, HouseholdActivitiesL6Fr } from './HouseholdActivitiesL6';
import { IDAuthenticationL6En, IDAuthenticationL6Fr } from './IDAuthenticationL6';
import { MassActionFinancial2L6En, MassActionFinancial2L6Fr } from './MassActionFinancial2L6';
import { MassActionFinancialAssistanceSamePaymentL6En, MassActionFinancialAssistanceSamePaymentL6Fr } from './MassActionFinancialAssistanceSamePaymentL6';
import { MassActionQuickReferenceL6En, MassActionQuickReferenceL6Fr } from './MassActionQuickReferenceL6';
import { MassActionValidationOfImpactL6En, MassActionValidationOfImpactL6Fr } from './MassActionValidationOfImpactL6';
import { PaymentApprovalsL6En, PaymentApprovalsL6Fr } from './PaymentApprovalsL6';
import { RegistrationByBeneficiaryL6En, RegistrationByBeneficiaryL6Fr } from './RegistrationByBeneficiaryL6';
import { RegistrationByCaseFileL6En, RegistrationByCaseFileL6Fr } from './RegistrationByCaseFileL6';
import { RegistrationByBeneficiaryL5En, RegistrationByBeneficiaryL5Fr } from './RegistrationByBeneficiaryL5';
import { RegistrationByCaseFileL5En, RegistrationByCaseFileL5Fr } from './RegistrationByCaseFileL5';
import { ReferralsL5En, ReferralsL5Fr } from './ReferralsL5';
import { PaymentLinesL5En, PaymentLinesL5Fr } from './PaymentLinesL5';
import { PaymentsL6En, PaymentsL6Fr } from './PaymentsL6';
import { PaymentsL5En, PaymentsL5Fr } from './PaymentsL5';
import { CaseFileStatusAndActionL6En, CaseFileStatusAndActionL6Fr } from './CaseFileStatusAndActionL6';
import { UserListL6En, UserListL6Fr } from './UserListL6';
import { UserAccessListEMISL6En, UserAccessListEMISL6Fr } from './UserAccessListEMISL6';
import { CaseNotesL6En, CaseNotesL6Fr } from './CaseNotesL6';
import { DataCorrectionAuthenticationL6En, DataCorrectionAuthenticationL6Fr } from './DataCorrectionAuthenticationL6';
import { DataCorrectionContactInformationL6En, DataCorrectionContactInformationL6Fr } from './DataCorrectionContactInformationL6';
import { PotentialDuplicatesL6En, PotentialDuplicatesL6Fr } from './PotentialDuplicatesL6';
import { TasksL6En, TasksL6Fr } from './TasksL6';
import { DocumentsL6En, DocumentsL6Fr } from './DocumentsL6';
import { DataCorrectionTriageL6En, DataCorrectionTriageL6Fr } from './DataCorrectionTriageL6';
import { LodgingOverviewWithHistoryL6En, LodgingOverviewWithHistoryL6Fr } from './LodgingOverviewWithHistoryL6';
import { SentEmailIssuesL6En, SentEmailIssuesL6Fr } from './SentEmailIssuesL6';
import { LocationOfEmailL6En, LocationOfEmailL6Fr } from './LocationOfEmailL6';


import { AllPbiReports } from './PowerBiEmbedded';

/* clones of other queries available for different levels */
export const LodgingOverviewWithHistoryL5En = {
  ...LodgingOverviewWithHistoryL6En,
  id: 'LodgingOverviewWithHistoryL5',
  queryType: QueryType.StandardL5en,
} as IQuery;

export const LodgingOverviewWithHistoryL5Fr = {
  ...LodgingOverviewWithHistoryL6Fr,
  id: 'LodgingOverviewWithHistoryL5',
  queryType: QueryType.StandardL5fr,
} as IQuery;

export const LodgingOverviewWithHistoryL4En = {
  ...LodgingOverviewWithHistoryL6En,
  id: 'LodgingOverviewWithHistoryL4',
  queryType: QueryType.StandardL4en,
} as IQuery;

export const LodgingOverviewWithHistoryL4Fr = {
  ...LodgingOverviewWithHistoryL6Fr,
  id: 'LodgingOverviewWithHistoryL4',
  queryType: QueryType.StandardL4fr,
} as IQuery;

export const LodgingOverviewWithHistoryIMEn = {
  ...LodgingOverviewWithHistoryL6En,
  id: 'LodgingOverviewWithHistoryIM',
  queryType: QueryType.StandardIMen,
} as IQuery;

export const LodgingOverviewWithHistoryIMFr = {
  ...LodgingOverviewWithHistoryL6Fr,
  id: 'LodgingOverviewWithHistoryIM',
  queryType: QueryType.StandardIMfr,
} as IQuery;

export const UsersL5En = {
  ...UserListL6En,
  id: 'UserListL5',
  queryType: QueryType.StandardL5en,
} as IQuery;

export const UsersL5Fr = {
  ...UserListL6Fr,
  id: 'UserListL5',
  queryType: QueryType.StandardL5fr,
} as IQuery;

export const UserListIMEn = {
  ...UserListL6En,
  id: 'UserListIM',
  queryType: QueryType.StandardIMen,
} as IQuery;

export const UserListIMFr = {
  ...UserListL6Fr,
  id: 'UserListIM',
  queryType: QueryType.StandardIMfr,
} as IQuery;

export const UserAccessListEMISIMEn = {
  ...UserAccessListEMISL6En,
  id: 'UserAccessListEMISIM',
  queryType: QueryType.StandardIMen,
} as IQuery;

export const UserAccessListEMISIMFr = {
  ...UserAccessListEMISL6Fr,
  id: 'UserAccessListEMIS',
  queryType: QueryType.StandardIMfr,
} as IQuery;

export const DocumentsL5En = {
  ...DocumentsL6En,
  id: 'DocumentsL5',
  queryType: QueryType.StandardL5en,
} as IQuery;

export const DocumentsL5Fr = {
  ...DocumentsL6Fr,
  id: 'DocumentsL5',
  queryType: QueryType.StandardL5fr,
} as IQuery;

export const DocumentsL4En = {
  ...DocumentsL6En,
  id: 'DocumentsL4',
  queryType: QueryType.StandardL4en,
} as IQuery;

export const DocumentsL4Fr = {
  ...DocumentsL6Fr,
  id: 'DocumentsL4',
  queryType: QueryType.StandardL4fr,
} as IQuery;

export const DocumentsIMEn = {
  ...DocumentsL6En,
  id: 'DocumentsIM',
  queryType: QueryType.StandardIMen,
} as IQuery;

export const DocumentsIMFr = {
  ...DocumentsL6Fr,
  id: 'DocumentsIM',
  queryType: QueryType.StandardIMfr,
} as IQuery;

export const TasksL5En = {
  ...TasksL6En,
  id: 'TasksL5',
  queryType: QueryType.StandardL5en,
} as IQuery;

export const TasksL5Fr = {
  ...TasksL6Fr,
  id: 'TasksL5',
  queryType: QueryType.StandardL5fr,
} as IQuery;

export const TasksL4En = {
  ...TasksL6En,
  id: 'TasksL4',
  queryType: QueryType.StandardL4en,
} as IQuery;

export const TasksL4Fr = {
  ...TasksL6Fr,
  id: 'TasksL4',
  queryType: QueryType.StandardL4fr,
} as IQuery;

export const TasksIMEn = {
  ...TasksL6En,
  id: 'TasksIM',
  queryType: QueryType.StandardIMen,
} as IQuery;

export const TasksIMFr = {
  ...TasksL6Fr,
  id: 'TasksIM',
  queryType: QueryType.StandardIMfr,
} as IQuery;

export const IDAuthenticationL5En = {
  ...IDAuthenticationL6En,
  id: 'AuthenticationL5',
  queryType: QueryType.StandardL5en,
} as IQuery;

export const IDAuthenticationL5Fr = {
  ...IDAuthenticationL6Fr,
  id: 'AuthenticationL5',
  queryType: QueryType.StandardL5fr,
} as IQuery;

export const ReferralsL4En = {
  ...ReferralsL5En,
  id: 'ReferralsL4',
  queryType: QueryType.StandardL4en,
} as IQuery;

export const ReferralsL4Fr = {
  ...ReferralsL5Fr,
  id: 'ReferralsL4',
  queryType: QueryType.StandardL4fr,
} as IQuery;

export const ReferralsIMEn = {
  ...ReferralsL5En,
  id: 'ReferralsIM',
  queryType: QueryType.StandardIMen,
} as IQuery;

export const ReferralsIMFr = {
  ...ReferralsL5Fr,
  id: 'ReferralsIM',
  queryType: QueryType.StandardIMfr,
} as IQuery;

export const CaseNotesL5En = {
  ...CaseNotesL6En,
  id: 'CaseNotesL5',
  queryType: QueryType.StandardL5en,
} as IQuery;

export const CaseNotesL5Fr = {
  ...CaseNotesL6Fr,
  id: 'CaseNotesL5',
  queryType: QueryType.StandardL5fr,
} as IQuery;

export const CaseNotesL4En = {
  ...CaseNotesL6En,
  id: 'CaseNotesL4',
  queryType: QueryType.StandardL4en,
} as IQuery;

export const CaseNotesL4Fr = {
  ...CaseNotesL6Fr,
  id: 'CaseNotesL4',
  queryType: QueryType.StandardL4fr,
} as IQuery;

export const CaseNotesIMEn = {
  ...CaseNotesL6En,
  id: 'CaseNotesIM',
  queryType: QueryType.StandardIMen,
} as IQuery;

export const CaseNotesIMFr = {
  ...CaseNotesL6Fr,
  id: 'CaseNotesIM',
  queryType: QueryType.StandardIMfr,
} as IQuery;

export const CaseFileStatusAndActionIMEn = {
  ...CaseFileStatusAndActionL6En,
  id: 'CaseFileStatusAndActionIM',
  queryType: QueryType.StandardIMen,
} as IQuery;

export const CaseFileStatusAndActionIMFr = {
  ...CaseFileStatusAndActionL6Fr,
  id: 'CaseFileStatusAndActionIM',
  queryType: QueryType.StandardIMfr,
} as IQuery;

export const HouseholdActivitiesIMEn = {
  ...HouseholdActivitiesL6En,
  id: 'HouseholdActivitiesIM',
  queryType: QueryType.StandardIMen,
} as IQuery;

export const HouseholdActivitiesIMFr = {
  ...HouseholdActivitiesL6Fr,
  id: 'HouseholdActivitiesIM',
  queryType: QueryType.StandardIMfr,
} as IQuery;

export const PotentialDuplicatesIMEn = {
  ...PotentialDuplicatesL6En,
  id: 'PotentialDuplicatesIM',
  queryType: QueryType.StandardIMen,
} as IQuery;

export const PotentialDuplicatesIMFr = {
  ...PotentialDuplicatesL6Fr,
  id: 'PotentialDuplicatesIM',
  queryType: QueryType.StandardIMfr,
} as IQuery;

export const RegistrationByCaseFileL4En = {
  ...RegistrationByCaseFileL5En,
  id: 'RegistrationByCaseFileL4',
  queryType: QueryType.StandardL4en,
} as IQuery;

export const RegistrationByCaseFileL4Fr = {
  ...RegistrationByCaseFileL5Fr,
  id: 'RegistrationByCaseFileL4',
  queryType: QueryType.StandardL4fr,
} as IQuery;

export const RegistrationByBeneficiaryL4En = {
  ...RegistrationByBeneficiaryL5En,
  id: 'RegistrationByBeneficiaryL4',
  queryType: QueryType.StandardL4en,
} as IQuery;

export const RegistrationByBeneficiaryL4Fr = {
  ...RegistrationByBeneficiaryL5Fr,
  id: 'RegistrationByBeneficiaryL4',
  queryType: QueryType.StandardL4fr,
} as IQuery;

export const RegistrationByBeneficiaryIMEn = {
  ...RegistrationByBeneficiaryL6En,
  id: 'RegistrationByBeneficiaryIM',
  queryType: QueryType.StandardIMen,
} as IQuery;

export const RegistrationByBeneficiaryIMFr = {
  ...RegistrationByBeneficiaryL6Fr,
  id: 'RegistrationByBeneficiaryIM',
  queryType: QueryType.StandardIMfr,
} as IQuery;

export const RegistrationByCaseFileIMEn = {
  ...RegistrationByCaseFileL6En,
  id: 'RegistrationByCaseFileIM',
  queryType: QueryType.StandardIMen,
} as IQuery;

export const RegistrationByCaseFileIMFr = {
  ...RegistrationByCaseFileL6Fr,
  id: 'RegistrationByCaseFileIM',
  queryType: QueryType.StandardIMfr,
} as IQuery;

export const IDAuthenticationIMEn = {
  ...IDAuthenticationL6En,
  id: 'AuthenticationIM',
  queryType: QueryType.StandardIMen,
} as IQuery;

export const IDAuthenticationIMFr = {
  ...IDAuthenticationL6Fr,
  id: 'AuthenticationIM',
  queryType: QueryType.StandardIMfr,
} as IQuery;

export const ValidationOfImpactIMEn = {
  ...MassActionValidationOfImpactL6En,
  id: 'ValidationOfImpactIM',
  queryType: QueryType.StandardIMen,
  name: 'Validation of impact',
} as IQuery;

export const ValidationOfImpactIMFr = {
  ...MassActionValidationOfImpactL6Fr,
  id: 'ValidationOfImpactIM',
  queryType: QueryType.StandardIMfr,
  name: 'Validation d\'impact',
} as IQuery;

export const PaymentApprovalsIMEn = {
  ...PaymentApprovalsL6En,
  id: 'PaymentApprovalsIM',
  queryType: QueryType.StandardIMen,
} as IQuery;

export const PaymentApprovalsIMFr = {
  ...PaymentApprovalsL6Fr,
  id: 'PaymentApprovalsIM',
  queryType: QueryType.StandardIMfr,
} as IQuery;

export const PaymentsIMEn = {
  ...PaymentsL6En,
  id: 'PaymentsIM',
  queryType: QueryType.StandardIMen,
} as IQuery;

export const PaymentsIMFr = {
  ...PaymentsL6Fr,
  id: 'PaymentsIM',
  queryType: QueryType.StandardIMfr,
} as IQuery;

export const PaymentLinesIMEn = {
  ...PaymentLinesL5En,
  id: 'PaymentLinesIM',
  queryType: QueryType.StandardIMen,
} as IQuery;

export const PaymentLinesIMFr = {
  ...PaymentLinesL5Fr,
  id: 'PaymentLinesIM',
  queryType: QueryType.StandardIMfr,
} as IQuery;

export const AllReports : IQuery[] = [
  ...AllPbiReports,
  LodgingOverviewWithHistoryL6En, LodgingOverviewWithHistoryL6Fr,
  LodgingOverviewWithHistoryL5En, LodgingOverviewWithHistoryL5Fr,
  LodgingOverviewWithHistoryL4En, LodgingOverviewWithHistoryL4Fr,
  LodgingOverviewWithHistoryIMEn, LodgingOverviewWithHistoryIMFr,
  PaymentsL6En, PaymentsL6Fr,
  RegistrationByBeneficiaryL6En, RegistrationByBeneficiaryL6Fr,
  RegistrationByCaseFileL6En, RegistrationByCaseFileL6Fr,
  DataCorrectionIdentitySetL6En, DataCorrectionIdentitySetL6Fr,
  DataCorrectionTemporaryAddressL6En, DataCorrectionTemporaryAddressL6Fr,
  DataCorrectionHomeAddressL6En, DataCorrectionHomeAddressL6Fr,
  DataCorrectionLabelL6En, DataCorrectionLabelL6Fr,
  MassActionFinancialAssistanceSamePaymentL6En, MassActionFinancialAssistanceSamePaymentL6Fr,
  MassActionFinancial2L6En, MassActionFinancial2L6Fr,
  MassActionValidationOfImpactL6En, MassActionValidationOfImpactL6Fr,
  MassActionQuickReferenceL6En, MassActionQuickReferenceL6Fr,
  PaymentApprovalsL6En, PaymentApprovalsL6Fr,
  DataCorrectionFAL6En, DataCorrectionFAL6Fr,
  IDAuthenticationL6En, IDAuthenticationL6Fr,
  HouseholdActivitiesL6En, HouseholdActivitiesL6Fr,
  HouseholdActivitiesIMEn, HouseholdActivitiesIMFr,
  RegistrationByBeneficiaryL5En, RegistrationByBeneficiaryL5Fr,
  RegistrationByBeneficiaryL4En, RegistrationByBeneficiaryL4Fr,
  RegistrationByCaseFileL5En, RegistrationByCaseFileL5Fr,
  RegistrationByCaseFileL4En, RegistrationByCaseFileL4Fr,
  ReferralsL5En, ReferralsL5Fr,
  ReferralsL4En, ReferralsL4Fr,
  ReferralsIMEn, ReferralsIMFr,
  CaseNotesL6En, CaseNotesL6Fr,
  CaseNotesL5En, CaseNotesL5Fr,
  CaseNotesL4En, CaseNotesL4Fr,
  CaseNotesIMEn, CaseNotesIMFr,
  PaymentLinesL5En, PaymentLinesL5Fr,
  PaymentLinesIMEn, PaymentLinesIMFr,
  PaymentsL5En, PaymentsL5Fr,
  PaymentsIMEn, PaymentsIMFr,
  IDAuthenticationL5En, IDAuthenticationL5Fr,
  UsersL5En, UsersL5Fr,
  RegistrationByBeneficiaryIMEn, RegistrationByBeneficiaryIMFr,
  RegistrationByCaseFileIMEn, RegistrationByCaseFileIMFr,
  IDAuthenticationIMEn, IDAuthenticationIMFr,
  ValidationOfImpactIMEn, ValidationOfImpactIMFr,
  PaymentApprovalsIMEn, PaymentApprovalsIMFr,
  CaseFileStatusAndActionL6En, CaseFileStatusAndActionL6Fr,
  CaseFileStatusAndActionIMEn, CaseFileStatusAndActionIMFr,
  UserListL6En, UserListL6Fr,
  UserListIMEn, UserListIMFr,
  UserAccessListEMISL6En, UserAccessListEMISL6Fr,
  UserAccessListEMISIMEn, UserAccessListEMISIMFr,
  DataCorrectionAuthenticationL6En, DataCorrectionAuthenticationL6Fr,
  DataCorrectionContactInformationL6En, DataCorrectionContactInformationL6Fr,
  PotentialDuplicatesL6En, PotentialDuplicatesL6Fr,
  PotentialDuplicatesIMEn, PotentialDuplicatesIMFr,
  DataCorrectionTriageL6En, DataCorrectionTriageL6Fr,
  TasksL6En, TasksL6Fr,
  TasksL5En, TasksL5Fr,
  TasksL4En, TasksL4Fr,
  TasksIMEn, TasksIMFr,
  DocumentsL6En, DocumentsL6Fr,
  DocumentsL5En, DocumentsL5Fr,
  DocumentsL4En, DocumentsL4Fr,
  DocumentsIMEn, DocumentsIMFr,
  SentEmailIssuesL6En, SentEmailIssuesL6Fr,
  LocationOfEmailL6En, LocationOfEmailL6Fr
];
