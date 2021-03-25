import { MAX_LENGTH_MD } from '@/constants/validations';

import { IAppUserData } from '@/entities/app-user';
import { IMultilingual } from '@/types';
import {
  ETeamStatus, ETeamType, ITeam, ITeamSearchData, ITeamMember, ITeamEvent,
} from './team.types';

export class Team implements ITeam {
  id: string;

  tenantId: string;

  name: string;

  teamType: ETeamType;

  teamTypeName: IMultilingual;

  primaryContactDisplayName: string;

  status: ETeamStatus;

  events: Array<ITeamEvent>;

  eventCount: number;

  teamMembers: Array<ITeamMember>;

  teamMemberCount: number;

  constructor(data?: ITeamSearchData) {
    if (data) {
      this.id = data.teamId;
      this.tenantId = data.tenantId;
      this.name = data.teamName;
      this.teamType = data.teamType;
      this.teamTypeName = data.teamTypeName;
      this.primaryContactDisplayName = data.primaryContactDisplayName;
      this.status = data.teamStatus;
      this.teamMembers = data.teamMembers;
      this.teamMemberCount = data.teamMemberCount;
      this.events = data.events;
      this.eventCount = data.eventCount;
    } else {
      this.reset();
    }
  }

  addTeamMembers(members: ITeamMember | ITeamMember[]) {
    if (Array.isArray(members)) {
      this.teamMembers = this.teamMembers.concat(members);
    } else {
      this.teamMembers.push(members);
    }
  }

  removeTeamMember(userId: uuid): boolean {
    const member = this.teamMembers.find((u) => u.id === userId);

    if (!member) return false;

    if (member && member.isPrimaryContact) {
      return false;
    }

    this.teamMembers = this.teamMembers.filter((u) => u.id !== userId);

    return true;
  }

  setPrimaryContact(member: ITeamMember | IAppUserData) {
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
      this.addTeamMembers({ ...member, isPrimaryContact: true });
    }
  }

  getPrimaryContact(): ITeamMember {
    if (this.teamMembers) {
      const primaryContact = this.teamMembers.find((m) => m.isPrimaryContact) as ITeamMember;
      return primaryContact || null;
    }
    return null;
  }

  setEvents(events: ITeamEvent | ITeamEvent[]) {
    this.events = Array.isArray(events) ? [...events] : [events];
  }

  private reset() {
    this.name = '';
    this.tenantId = '';
    this.teamType = null;
    this.teamTypeName = null;
    this.primaryContactDisplayName = '';
    this.status = ETeamStatus.Active;
    this.teamMemberCount = null;
    this.teamMembers = [];
    this.events = [];
    this.eventCount = null;
  }

  private validateAttributes(errors: Array<string>) {
    if (!this.id) {
      errors.push('The id is required');
    }

    if (!this.tenantId) {
      errors.push('The tenantId is required');
    }

    if (!this.teamTypeName) {
      errors.push('The teamTypeName is required');
    }

    if (!this.primaryContactDisplayName) {
      errors.push('The primaryContactDisplayName is required');
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
    if (this.teamType === ETeamType.AdHoc && this.events.length !== 1) {
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
