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
  name: 'Quarterly Report - Beneficiaries',
  topic: ReportingTopic.PowerBi,
} as IQuery;

export const QuarterlyReportBeneficiariesPbiL6Fr = {
  id: 'QuarterlyReportBeneficiaries',
  queryType: QueryType.StandardL6fr,
  name: 'Rapport semestriel - Bénéficiaires',
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
];
