import { IEntity, IEntityCombined } from '../base';
import { IUserAccountCombined } from '../user-account';

/**
 * Enums
 */

export enum TeamType {
  Standard = 1,
  AdHoc = 2,
}

/**
 * Interfaces
 */

export interface ITeamMember {
  id: uuid;
  isPrimaryContact: boolean,
}

export interface ITeamMemberAsUser extends IUserAccountCombined {
  isPrimaryContact: boolean,
  openCaseFileCount: number,
  inactiveCaseFileCount: number,
  caseFileCount: number
}

/**
 * Interface used for the Team entity class
 */
export interface ITeamEntity extends IEntity {
  name: string;
  teamType: TeamType;
  teamMembers: Array<ITeamMember>;
  eventIds: Array<uuid>;
  isEscalation: boolean;
  isAssignable: boolean;
  useForLodging: boolean;
  setPrimaryContact?(member: ITeamMember): void;
  getPrimaryContact?(): ITeamMember;
  validate?(): Array<string> | boolean;
  setEventIds?(eventIds: uuid | uuid[]): void;
}

export type ITeamCombined = IEntityCombined<ITeamEntity, IEntity>;

export type IdParams = uuid;
