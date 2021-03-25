/**
 * Enums
 */

import { IMultilingual } from '@/types';
import { IAppUserData } from '@/entities/app-user';

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

export interface ITeamMember extends IAppUserData {
  isPrimaryContact: boolean,
  teamCount?: number;
  caseFilesCount?: number;
  openCaseFilesCount?: number;
  inactiveCaseFilesCount?: number;
}

/**
* Interface that maps to the response structure from the API
*/
export interface ITeamData {
   id: uuid;
   name: string;
   status: ETeamStatus;
   teamType: ETeamType;
   teamMembers: Array<{ id: uuid; isPrimaryContact: boolean }>;
   eventIds: Array<uuid>,
}

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
  teamMembers: Array<ITeamMember>,
}

/**
 * Interface used for the Team entity class
 */
export interface ITeam {
  id: uuid;
  tenantId: string;
  name: string;
  status: ETeamStatus;
  teamType: ETeamType;
  teamTypeName: IMultilingual;
  primaryContactDisplayName: string;
  teamMembers: Array<ITeamMember>;
  teamMemberCount: number;
  events?: Array<ITeamEvent>,
  eventCount: number;
  addTeamMembers(members: ITeamMember | ITeamMember[]): void;
  setPrimaryContact(member: ITeamMember | IAppUserData): void;
  getPrimaryContact(): ITeamMember;
  validate(): Array<string> | boolean;
  setEvents(events: ITeamEvent | ITeamEvent[]): void;
}

/**
 * Interface for the Team edit payload
 */

export interface IEditTeamRequest {
  name: string;
  eventIds: Array<uuid>;
  primaryContact: ITeamMember;
  status: ETeamStatus;
 }

export interface ICreateTeamRequest {
  name: string;
  eventIds: Array<uuid>;
  teamMembers: ITeamMember[];
  teamType: ETeamType
}

export interface IAddTeamMembersRequest {
  teamMemberIds: Array<uuid>;
}
