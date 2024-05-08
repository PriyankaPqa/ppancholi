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
  Cardslevel6en = 10,
  Cardslevel6fr = 11,
  Cardslevel5en = 12,
  Cardslevel5fr = 13,
  Cardslevel4en = 14,
  Cardslevel4fr = 15,
  CardscontributorIMen = 16,
  CardscontributorIMfr = 17,
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
  PotentialDuplicates = 12,
  HouseholdMembersAddressHistory = 13,
  Tasks = 14,
  TasksHistory = 15,
  Documents = 16,
  PowerBi = 99,
}

export interface ODataResult<T> {
  count?: number;
  value: T[];
}

export interface EnumEntry {
  entity: string;
  english: string;
  french: string;
  value: number;
}

export interface ListOption {
  id: uuid;
  discriminator: string;
  english: string;
  french: string;
  orderRank: number;
  isOther: boolean;
  isDefault: boolean;
  restrictFinancial: boolean;
  isHidden: boolean;
  parentListOptionId?: uuid;
}

export interface ObjectName {
  id: uuid;
  english: string;
  french: string;
}

export interface IQuery extends IEntity {
  name: string;
  queryType: QueryType;
  topic: ReportingTopic;
  owner?: uuid;
  state: string;
}

export interface IEmbedReport {
  reportId: uuid;
  reportName: string;
  embedUrl: string;
  reportPageId?: string;
}

export interface IEmbedToken {
  token: string;
  tokenId: uuid;
  expiration: string;
}

export interface IPowerBiTokenDetails {
  type: string;
  embedReport: IEmbedReport[];
  embedToken: IEmbedToken;
}
