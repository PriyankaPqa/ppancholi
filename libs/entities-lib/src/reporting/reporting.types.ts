import { IEntity } from '../base';

export enum QueryType {
  Custom = 1,
  StandardL6en = 2,
  StandardL6fr = 3,
  StandardL5en = 4,
  StandardL5fr = 5,
  StandardL4en = 6,
  StandardL4fr = 7,
  StandardIMen = 8,
  StandardIMfr = 9,
}

export enum ReportingTopic {
  HouseholdMembers = 1,
  HouseholdPrimary = 2,
  PaymentLine = 3,
  HouseholdActivities = 4,
  CaseFileActivities = 5,
  Referrals = 6,
  PaymentGroup = 7,
  UsersInTeams = 8,
  CaseNotes = 9,
  LatestCaseFileActivities = 10,
  CaseFileAuthenticationIds = 11,
}

export interface IQuery extends IEntity {
  name: string;
  queryType: QueryType;
  topic: ReportingTopic;
  owner?: uuid;
  state: string;
}
