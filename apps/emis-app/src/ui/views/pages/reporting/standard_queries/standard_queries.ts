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
import { CaseFileStatusAndActionL6En, CaseFileStatusAndActionL6Fr } from './CaseFileStatusAndActionL6';
import { UserListL6En, UserListL6Fr } from './UserListL6';
import { UserAccessListEMISL6En, UserAccessListEMISL6Fr } from './UserAccessListEMISL6';
import { CaseNotesL6En, CaseNotesL6Fr } from './CaseNotesL6';
import { DataCorrectionAuthenticationL6En, DataCorrectionAuthenticationL6Fr } from './DataCorrectionAuthenticationL6';
import { DataCorrectionContactInformationL6En, DataCorrectionContactInformationL6Fr } from './DataCorrectionContactInformationL6';
import { PotentialDuplicatesL6En, PotentialDuplicatesL6Fr } from './PotentialDuplicatesL6';

import { AllPbiReports } from './PowerBiEmbedded';

/* clones of other queries available for different levels */
export const PaymentsL5En = {
  ...PaymentsL6En,
  id: 'PaymentsL5',
  queryType: QueryType.StandardL5en,
} as IQuery;

export const PaymentsL5Fr = {
  ...PaymentsL6Fr,
  id: 'PaymentsL5',
  queryType: QueryType.StandardL5fr,
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

export const AllReports : IQuery[] = [
  ...AllPbiReports,
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
  RegistrationByBeneficiaryL5En, RegistrationByBeneficiaryL5Fr,
  RegistrationByBeneficiaryL4En, RegistrationByBeneficiaryL4Fr,
  RegistrationByCaseFileL5En, RegistrationByCaseFileL5Fr,
  RegistrationByCaseFileL4En, RegistrationByCaseFileL4Fr,
  ReferralsL5En, ReferralsL5Fr,
  ReferralsL4En, ReferralsL4Fr,
  CaseNotesL6En, CaseNotesL6Fr,
  CaseNotesL5En, CaseNotesL5Fr,
  CaseNotesL4En, CaseNotesL4Fr,
  PaymentLinesL5En, PaymentLinesL5Fr,
  PaymentsL5En, PaymentsL5Fr,
  IDAuthenticationL5En, IDAuthenticationL5Fr,
  UsersL5En, UsersL5Fr,
  RegistrationByBeneficiaryIMEn, RegistrationByBeneficiaryIMFr,
  RegistrationByCaseFileIMEn, RegistrationByCaseFileIMFr,
  IDAuthenticationIMEn, IDAuthenticationIMFr,
  ValidationOfImpactIMEn, ValidationOfImpactIMFr,
  PaymentApprovalsIMEn, PaymentApprovalsIMFr,
  CaseFileStatusAndActionL6En, CaseFileStatusAndActionL6Fr,
  UserListL6En, UserListL6Fr,
  UserAccessListEMISL6En, UserAccessListEMISL6Fr,
  DataCorrectionAuthenticationL6En, DataCorrectionAuthenticationL6Fr,
  DataCorrectionContactInformationL6En, DataCorrectionContactInformationL6Fr,
  PotentialDuplicatesL6En, PotentialDuplicatesL6Fr,
];
