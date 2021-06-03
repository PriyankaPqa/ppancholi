/**
 * Enums
 */

import { IMultilingual } from '@/types';
import { IUserAccountSearchData } from '@/entities/user-account';

export enum ETeamType {
  Standard = 1,
  AdHoc = 2,
}

export enum ETeamStatus {
  Active = 1,
  Inactive = 2,
}

/**
 * Interfaces
 */

export interface ITeamEvent {
  id: uuid;
  name: IMultilingual;
}

// Member schema from teams projection
export interface ITeamMemberSearchData {
  id: uuid;
  isPrimaryContact: boolean,
}

// Member schema from user-accounts projection, plus isPrimaryContact
export interface ITeamMemberData extends IUserAccountSearchData {
  isPrimaryContact: boolean;
}

/**
* Interface that maps to the response structure from the API
*/
export interface ITeamData {
   id: uuid;
   name: string;
   status: ETeamStatus;
   teamType: ETeamType;
   teamMembers: Array<ITeamMemberSearchData>;
   eventIds: Array<uuid>,
}

/**
 * Team schema from teams projection
 */
export interface ITeamSearchData {
  '@searchScore'?: number;
  teamId: uuid;
  tenantId: string;
  teamName: string;
  teamType: ETeamType;
  teamTypeName: IMultilingual;
  eventCount: number;
  primaryContactDisplayName: string;
  teamMemberCount: number;
  events: Array<ITeamEvent>,
  teamStatus: ETeamStatus;
  teamStatusName: IMultilingual;
  teamMembers: Array<ITeamMemberSearchData>,
}

/**
 * Team schema from teams projection aggregated with users from user-accounts projection
 */
export interface ITeamSearchDataAggregate {
  '@searchScore'?: number;
  teamId: uuid;
  tenantId: string;
  teamName: string;
  teamType: ETeamType;
  teamTypeName: IMultilingual;
  eventCount: number;
  primaryContactDisplayName: string;
  teamMemberCount: number;
  events: Array<ITeamEvent>,
  teamStatus: ETeamStatus;
  teamStatusName: IMultilingual;
  teamMembers: Array<ITeamMemberData>,
}

/**
 * Interface used for the Team entity class
 */
export interface ITeam {
  id: uuid;
  tenantId: string;
  name: string;
  status: ETeamStatus;
  statusName: IMultilingual;
  teamType: ETeamType;
  teamTypeName: IMultilingual;
  primaryContactDisplayName: string;
  teamMembers: Array<ITeamMemberData>;
  teamMemberCount: number;
  events?: Array<ITeamEvent>,
  eventCount: number;
  addTeamMembers(members: ITeamMemberData | ITeamMemberData[]): void;
  setPrimaryContact(member: ITeamMemberData): void;
  getPrimaryContact(): ITeamMemberData;
  getActiveMemberCount(): number;
  validate(): Array<string> | boolean;
  setEvents(events: ITeamEvent | ITeamEvent[]): void;
}

/**
 * Interface for the Team edit payload
 */
export interface IEditTeamRequest {
  name: string;
  eventIds: Array<uuid>;
  primaryContact: ITeamMemberSearchData;
  status: ETeamStatus;
 }

export interface ICreateTeamRequest {
  name: string;
  eventIds: Array<uuid>;
  teamMembers: ITeamMemberSearchData[];
  teamType: ETeamType;
}

export interface IAddTeamMembersRequest {
  teamMemberIds: Array<uuid>;
}
