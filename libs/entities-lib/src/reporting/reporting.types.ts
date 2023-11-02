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
  CaseFileActivities = 5,
  Referrals = 6,
}

export interface IQuery extends IEntity {
  name: string;
  queryType: QueryType;
  topic: ReportingTopic;
  owner?: uuid;
  state: string;
}
