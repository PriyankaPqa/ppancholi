import { MAX_LENGTH_MD } from '@/constants/validations';
import {
  ETeamStatus, ETeamType, ITeam, ITeamData, ITeamMember,
} from './team.types';

export class Team implements ITeam {
  id: string;

  name: string;

  teamType: ETeamType;

  status: ETeamStatus;

  eventIds: Array<uuid>;

  teamMembers: Array<ITeamMember>;

  constructor(data?: ITeamData) {
    if (data) {
      this.id = data.id;
      this.name = data.name;
      this.teamType = data.teamType;
      this.status = data.status;
      this.teamMembers = data.teamMembers;
      this.eventIds = data.eventIds;
    } else {
      this.reset();
    }
  }

  addTeamMember(userId: uuid, isPrimaryContact = false) {
    this.teamMembers.push({ id: userId, isPrimaryContact });
  }

  setPrimaryContact(userId: uuid) {
    let isUserInTeam = false;
    const updatedTeam = this.teamMembers.map((member: ITeamMember) => {
      // If the userId is the Id of a team member, its primaryContact status is set to true
      if (member.id === userId) {
        member.isPrimaryContact = true;
        isUserInTeam = true;
      } else {
        // All other team members' primaryContact status is set to false
        member.isPrimaryContact = false;
      }
      return member;
    });

    if (isUserInTeam) {
      this.teamMembers = updatedTeam;
    } else {
      // If the userId doesn't belong to an existent team member, the userId is added as primaryContact
      this.addTeamMember(userId, true);
    }
  }

  getPrimaryContact(): ITeamMember {
    if (this.teamMembers) {
      const primaryContact = this.teamMembers.find((m) => m.isPrimaryContact) as ITeamMember;
      return primaryContact || null;
    }
    return null;
  }

  private reset() {
    this.name = '';
    this.teamType = null;
    this.status = ETeamStatus.Active;
    this.teamMembers = [];
    this.eventIds = [];
  }

  private validateAttributes(errors: Array<string>) {
    if (!this.id) {
      errors.push('The id is required');
    }
    if (!this.name) {
      errors.push('The team name is required');
    }
    if (this.name && this.name.length > MAX_LENGTH_MD) {
      errors.push(`The team name should not be longer than ${MAX_LENGTH_MD} characters`);
    }
    if (!this.teamType) {
      errors.push('The team type is required');
    }
    if (!this.status) {
      errors.push('The team status is required');
    }
    if (!this.teamMembers || !this.teamMembers.length || !this.teamMembers.find((m) => m.isPrimaryContact)) {
      errors.push('A primary contact team member is required');
    }
    if (this.teamType === ETeamType.AdHoc && this.eventIds.length !== 1) {
      errors.push('An ad-hoc team should have one eventId');
    }
  }

  /**
  * Validate business rules (non specific to the application)
  */
  validate(): Array<string> | boolean {
    const errors: Array<string> = [];

    this.validateAttributes(errors);
    if (!errors.length) {
      return true;
    }

    return errors;
  }
}
