/**
 * Enums
 */

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
  id: string,
  isPrimaryContact: boolean,
}

/**
* Interface that maps to the response structure from the API
*/
export interface ITeamData {
   id: string;
   name: string;
   status: ETeamStatus;
   teamType: ETeamType;
   teamMembers: Array<ITeamMember>;
   eventIds: Array<uuid>;
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
