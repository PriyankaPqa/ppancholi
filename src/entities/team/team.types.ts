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
  readonly id: string;
  readonly name: string;
  readonly status: ETeamStatus;
  readonly teamType: ETeamType;
  readonly teamMembers: Array<ITeamMember>;
  readonly events: Array<uuid>;
}

/**
 * Interface used for the Team entity class
 */
export interface ITeam {
  readonly id: string;
  readonly name: string;
  readonly teamType: ETeamType;
  readonly status: ETeamStatus;
  readonly teamMembers: Array<ITeamMember>;
  readonly eventIds: Array<uuid>;
}
