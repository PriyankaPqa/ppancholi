import { IEntity } from '../base';

export enum QueryType {
  Custom = 1,
  StandardL6en = 2,
  StandardL6fr = 3,
}

export enum ReportingTopic {
  HouseholdMembers = 1,
  HouseholdPrimary = 2,
  PaymentLine = 3,
  HouseholdActivities = 4,
  CaseFileActivities = 5,
  Referrals = 6,
  PaymentGroup = 7,
  CaseNotes = 9,
  UsersInTeams = 8,
  LatestCaseFileActivities = 10,
}

export interface IQuery extends IEntity {
  name: string;
  queryType: QueryType;
  topic: ReportingTopic;
  owner?: uuid;
  state: string;
}
