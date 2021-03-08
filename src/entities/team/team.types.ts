/**
 * Enums
 */

import { IMultilingual } from '@/types';

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

export interface ITeamMember {
  id: uuid,
  isPrimaryContact: boolean,
}

/**
* Interface that maps to the response structure from the API
*/
export interface ITeamData {
   id: uuid;
   name: string;
   status: ETeamStatus;
   teamType: ETeamType;
   teamMembers: Array<ITeamMember>;
   eventIds: Array<uuid>;
}

export interface ITeamSearchData {
  '@searchScore': number;
  teamId: uuid;
  tenantId: string;
  teamName: string;
  teamType: ETeamType;
  teamTypeName: IMultilingual;
  eventCount: number;
  primaryContactDisplayName: string;
  teamMemberCount: number;
  events: Array<{
    id: uuid;
    name: IMultilingual,
  }>,
  teamStatus: ETeamStatus;
  teamMembers: Array<{
    id: uuid;
    displayName: string;
    isPrimaryContact: boolean;
    emailAddress: string;
    phoneNumber: string;
    role: IMultilingual;
    teamCount: number;
    caseFilesCount: number;
    openCaseFilesCount: number;
    inactiveCaseFilesCount: number;
  }>,
}

/**
 * Interface used for the Team entity class
 */
export interface ITeam extends ITeamData {
  addTeamMember(userId: uuid, isPrimaryContact: boolean): void;
  setPrimaryContact(userId: uuid): void;
  getPrimaryContact(): ITeamMember;
  validate(): Array<string> | boolean;
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
