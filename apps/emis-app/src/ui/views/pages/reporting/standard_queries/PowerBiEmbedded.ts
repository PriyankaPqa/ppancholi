import {
  QueryType, ReportingTopic, IQuery,
} from '@libs/entities-lib/reporting';

export const AssessmentPbiL6En = {
  id: 'Assessments',
  queryType: QueryType.StandardL6en,
  name: 'Assessment',
  topic: ReportingTopic.PowerBi,
} as IQuery;

export const AssessmentPbiL6Fr = {
  id: 'Assessments',
  queryType: QueryType.StandardL6fr,
  name: 'Analyses',
  topic: ReportingTopic.PowerBi,
} as IQuery;

export const QuarterlyReportHHIDPbiL6En = {
  id: 'QuarterlyReportHHID',
  queryType: QueryType.StandardL6en,
  name: 'Quarterly Report - HH + ID',
  topic: ReportingTopic.PowerBi,
} as IQuery;

export const QuarterlyReportHHIDPbiL6Fr = {
  id: 'QuarterlyReportHHID',
  queryType: QueryType.StandardL6fr,
  name: 'Rapport semestriel - HH + ID',
  topic: ReportingTopic.PowerBi,
} as IQuery;

export const QuarterlyReportBeneficiariesPbiL6En = {
  id: 'QuarterlyReportBeneficiaries',
  queryType: QueryType.StandardL6en,
  name: 'Quarterly Report - Household members',
  topic: ReportingTopic.PowerBi,
} as IQuery;

export const QuarterlyReportBeneficiariesPbiL6Fr = {
  id: 'QuarterlyReportBeneficiaries',
  queryType: QueryType.StandardL6fr,
  name: 'Rapport semestriel - Membres des ménages',
  topic: ReportingTopic.PowerBi,
} as IQuery;

export const QuarterlyReportPaymentsPbiL6En = {
  id: 'QuarterlyReportPayments',
  queryType: QueryType.StandardL6en,
  name: 'Quarterly Report - Payments',
  topic: ReportingTopic.PowerBi,
} as IQuery;

export const QuarterlyReportPaymentsPbiL6Fr = {
  id: 'QuarterlyReportPayments',
  queryType: QueryType.StandardL6fr,
  name: 'Rapport semestriel - Paiements',
  topic: ReportingTopic.PowerBi,
} as IQuery;

export const AssessmentPbiL5En = {
  ...AssessmentPbiL6En,
  queryType: QueryType.StandardL5en,
} as IQuery;

export const AssessmentPbiL5Fr = {
  ...AssessmentPbiL6Fr,
  queryType: QueryType.StandardL5fr,
} as IQuery;

export const AssessmentPbiIMEn = {
  ...AssessmentPbiL6En,
  queryType: QueryType.StandardIMen,
} as IQuery;

export const AssessmentPbiIMFr = {
  ...AssessmentPbiL6Fr,
  queryType: QueryType.StandardIMfr,
} as IQuery;

export const QuarterlyReportHHIDPbiIMEn = {
  ...QuarterlyReportHHIDPbiL6En,
  queryType: QueryType.StandardIMen,
} as IQuery;

export const QuarterlyReportHHIDPbiIMFr = {
  ...QuarterlyReportHHIDPbiL6Fr,
  queryType: QueryType.StandardIMfr,
} as IQuery;

export const QuarterlyReportBeneficiariesPbiIMEn = {
  ...QuarterlyReportBeneficiariesPbiL6En,
  queryType: QueryType.StandardIMen,
} as IQuery;

export const QuarterlyReportBeneficiariesPbiIMFr = {
  ...QuarterlyReportBeneficiariesPbiL6Fr,
  queryType: QueryType.StandardIMfr,
} as IQuery;

export const QuarterlyReportPaymentsPbiIMEn = {
  ...QuarterlyReportPaymentsPbiL6En,
  queryType: QueryType.StandardIMen,
} as IQuery;

export const QuarterlyReportPaymentsPbiIMFr = {
  ...QuarterlyReportPaymentsPbiL6Fr,
  queryType: QueryType.StandardIMfr,
} as IQuery;

export const HouseholdStatisticsL6En = {
  id: 'HouseholdStatistics',
  queryType: QueryType.Cardslevel6en,
  name: 'Household Statistics',
  topic: ReportingTopic.PowerBi,
} as IQuery;

export const HouseholdStatisticsL6Fr = {
  ...HouseholdStatisticsL6En,
  queryType: QueryType.Cardslevel6fr,
  name: 'Statistiques des ménages',
} as IQuery;

export const HouseholdStatisticsL5En = {
  ...HouseholdStatisticsL6En,
  queryType: QueryType.Cardslevel5en,
} as IQuery;

export const HouseholdStatisticsL5Fr = {
  ...HouseholdStatisticsL6Fr,
  queryType: QueryType.Cardslevel5fr,
} as IQuery;

export const HouseholdStatisticsL4En = {
  ...HouseholdStatisticsL6En,
  queryType: QueryType.Cardslevel4en,
} as IQuery;

export const HouseholdStatisticsL4Fr = {
  ...HouseholdStatisticsL6Fr,
  queryType: QueryType.Cardslevel4fr,
} as IQuery;

export const HouseholdStatisticsIMEn = {
  ...HouseholdStatisticsL6En,
  queryType: QueryType.CardscontributorIMen,
} as IQuery;

export const HouseholdStatisticsIMFr = {
  ...HouseholdStatisticsL6Fr,
  queryType: QueryType.CardscontributorIMfr,
} as IQuery;

export const FinancialStatisticsL6En = {
  id: 'FinancialStatistics',
  queryType: QueryType.Cardslevel6en,
  name: 'Financial Statistics',
  topic: ReportingTopic.PowerBi,
} as IQuery;

export const FinancialStatisticsL6Fr = {
  ...FinancialStatisticsL6En,
  queryType: QueryType.Cardslevel6fr,
  name: 'Statistiques financières',
} as IQuery;

export const FinancialStatisticsL5En = {
  ...FinancialStatisticsL6En,
  queryType: QueryType.Cardslevel5en,
} as IQuery;

export const FinancialStatisticsL5Fr = {
  ...FinancialStatisticsL6Fr,
  queryType: QueryType.Cardslevel5fr,
} as IQuery;

export const FinancialStatisticsL4En = {
  ...FinancialStatisticsL6En,
  queryType: QueryType.Cardslevel4en,
} as IQuery;

export const FinancialStatisticsL4Fr = {
  ...FinancialStatisticsL6Fr,
  queryType: QueryType.Cardslevel4fr,
} as IQuery;

export const FinancialStatisticsIMEn = {
  ...FinancialStatisticsL6En,
  queryType: QueryType.CardscontributorIMen,
} as IQuery;

export const FinancialStatisticsIMFr = {
  ...FinancialStatisticsL6Fr,
  queryType: QueryType.CardscontributorIMfr,
} as IQuery;

export const AllPbiReports : IQuery[] = [
  AssessmentPbiL6En, AssessmentPbiL6Fr,
  AssessmentPbiL5En, AssessmentPbiL5Fr,
  AssessmentPbiIMEn, AssessmentPbiIMFr,
  QuarterlyReportHHIDPbiL6En, QuarterlyReportHHIDPbiL6Fr,
  QuarterlyReportHHIDPbiIMEn, QuarterlyReportHHIDPbiIMFr,
  QuarterlyReportBeneficiariesPbiL6En, QuarterlyReportBeneficiariesPbiL6Fr,
  QuarterlyReportBeneficiariesPbiIMEn, QuarterlyReportBeneficiariesPbiIMFr,
  QuarterlyReportPaymentsPbiL6En, QuarterlyReportPaymentsPbiL6Fr,
  QuarterlyReportPaymentsPbiIMEn, QuarterlyReportPaymentsPbiIMFr,
  HouseholdStatisticsL6En, HouseholdStatisticsL6Fr,
  HouseholdStatisticsL5En, HouseholdStatisticsL5Fr,
  HouseholdStatisticsL4En, HouseholdStatisticsL4Fr,
  HouseholdStatisticsIMEn, HouseholdStatisticsIMFr,
  FinancialStatisticsL6En, FinancialStatisticsL6Fr,
  FinancialStatisticsL5En, FinancialStatisticsL5Fr,
  FinancialStatisticsL4En, FinancialStatisticsL4Fr,
  FinancialStatisticsIMEn, FinancialStatisticsIMFr,
];
