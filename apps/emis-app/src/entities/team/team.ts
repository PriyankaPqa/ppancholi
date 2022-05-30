import _cloneDeep from 'lodash/cloneDeep';
import { MAX_LENGTH_MD } from '@/constants/validations';
import { BaseEntity } from '@libs/core-lib/entities/base';
import {
  TeamType, ITeamEntity, ITeamMember,
} from './team.types';

export class TeamEntity extends BaseEntity implements ITeamEntity {
  name: string;

  teamType: TeamType;

  eventIds: Array<uuid>;

  teamMembers: Array<ITeamMember>;

  constructor(data?: ITeamEntity) {
    if (data) {
      super(data);
      this.name = data.name;
      this.teamType = data.teamType;
      this.eventIds = data.eventIds ? [...data.eventIds] : [];
      this.teamMembers = _cloneDeep(data.teamMembers) || [];
    } else {
      super();
      this.eventIds = [];
      this.teamMembers = [];
    }
  }

  setPrimaryContact(member: ITeamMember) {
    let isUserInTeam = false;
    const updatedTeam = this.teamMembers.map((m: ITeamMember) => {
      // If the userId is the Id of a team member, its primaryContact status is set to true
      if (m.id === member.id) {
        m.isPrimaryContact = true;
        isUserInTeam = true;
      } else {
        // All other team members' primaryContact status is set to false
        m.isPrimaryContact = false;
      }
      return m;
    });

    if (isUserInTeam) {
      this.teamMembers = updatedTeam;
    } else {
      // If the userId doesn't belong to an existent team member, the userId is added as primaryContact
      this.teamMembers.push({ ...member, isPrimaryContact: true });
    }
  }

  getPrimaryContact(): ITeamMember {
    if (this.teamMembers) {
      const primaryContact = this.teamMembers.find((m) => m.isPrimaryContact) as ITeamMember;
      return primaryContact || null;
    }
    return null;
  }

  setEventIds(events: uuid | uuid[]) {
    this.eventIds = Array.isArray(events) ? [...events] : [events];
  }

  private validateAttributes(errors: Array<string>) {
    if (!this.id) {
      errors.push('The id is required');
    }

    if (!this.tenantId) {
      errors.push('The tenantId is required');
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

    if (this.teamType === TeamType.AdHoc && this.eventIds.length !== 1) {
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
