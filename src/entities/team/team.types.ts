import { IMultilingual } from '@/types';
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

export interface ITeamEvent {
  id: uuid;
  name?: IMultilingual;
}

export interface ITeamMember {
  id: uuid;
  isPrimaryContact: boolean,
}

export interface ITeamMemberAsUser extends IUserAccountCombined {
  isPrimaryContact: boolean,
}

/**
 * Interface used for the Team entity class
 */
export interface ITeamEntity extends IEntity {
  name: string;
  teamType: TeamType;
  teamMembers: Array<ITeamMember>;
  eventIds: Array<uuid>;
  setPrimaryContact?(member: ITeamMember): void;
  getPrimaryContact?(): ITeamMember;
  validate?(): Array<string> | boolean;
  setEventIds?(eventIds: uuid | uuid[]): void;
}

export interface ITeamMetadata extends IEntity {
  primaryContactDisplayName: string;
  eventCount: number;
  teamMemberCount: number;
  events?: Array<ITeamEvent>;
  teamTypeName: IMultilingual;
  teamStatusName: IMultilingual;
}

export type ITeamCombined = IEntityCombined<ITeamEntity, ITeamMetadata>
