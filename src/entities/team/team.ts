import _cloneDeep from 'lodash/cloneDeep';
import { MAX_LENGTH_MD } from '@/constants/validations';
import { IMultilingual } from '@/types';
import utils from '../utils';
import {
  ETeamStatus, ETeamType, ITeam, ITeamEvent, ITeamSearchDataAggregate, ITeamMemberData,
} from './team.types';
import { EUserAccountStatus } from '../user-account';

export class Team implements ITeam {
  id: string;

  tenantId: string;

  name: string;

  teamType: ETeamType;

  teamTypeName: IMultilingual;

  primaryContactDisplayName: string;

  status: ETeamStatus;

  statusName: IMultilingual;

  events: Array<ITeamEvent>;

  eventCount: number;

  teamMembers: Array<ITeamMemberData>;

  teamMemberCount: number;

  constructor(data?: ITeamSearchDataAggregate) {
    if (data) {
      this.id = data.teamId;
      this.tenantId = data.tenantId;
      this.name = data.teamName;
      this.teamType = data.teamType;
      this.teamTypeName = utils.initMultilingualAttributes(data.teamTypeName);
      this.primaryContactDisplayName = data.primaryContactDisplayName;
      this.statusName = utils.initMultilingualAttributes(data.teamStatusName);
      this.status = data.teamStatus;
      this.teamMembers = data.teamMembers;
      this.teamMemberCount = data.teamMemberCount;
      this.events = data.events;
      this.eventCount = data.eventCount;
    } else {
      this.reset();
    }
  }

  addTeamMembers(members: ITeamMemberData | ITeamMemberData[]) {
    if (Array.isArray(members)) {
      const teamMembers = _cloneDeep(members);
      // Increment the team count for newly added members to account for their new team
      teamMembers.forEach((m) => {
        m.teamCount += 1;
      });

      this.teamMembers = this.teamMembers.concat(teamMembers);
    } else {
      this.teamMembers.push({
        ...members,
        // Increment the team count for newly added members to account for their new team
        teamCount: members.teamCount + 1,
      });
    }
  }

  removeTeamMember(userId: uuid): boolean {
    const member = this.teamMembers.find((u) => u.userAccountId === userId);

    if (!member) return false;

    if (member && member.isPrimaryContact) {
      return false;
    }

    this.teamMembers = this.teamMembers.filter((u) => u.userAccountId !== userId);

    return true;
  }

  setPrimaryContact(member: ITeamMemberData) {
    let isUserInTeam = false;
    const updatedTeam = this.teamMembers.map((m: ITeamMemberData) => {
      // If the userId is the Id of a team member, its primaryContact status is set to true
      if (m.userAccountId === member.userAccountId) {
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

  getPrimaryContact(): ITeamMemberData {
    if (this.teamMembers) {
      const primaryContact = this.teamMembers.find((m) => m.isPrimaryContact) as ITeamMemberData;
      return primaryContact || null;
    }
    return null;
  }

  setEvents(events: ITeamEvent | ITeamEvent[]) {
    this.events = Array.isArray(events) ? [...events] : [events];
  }

  getActiveMemberCount(): number {
    if (!this.teamMembers) return 0;
    return this.teamMembers.filter((member) => member.userAccountStatus === EUserAccountStatus.Active).length;
  }

  private reset() {
    this.name = '';
    this.tenantId = '';
    this.teamType = null;
    this.teamTypeName = null;
    this.primaryContactDisplayName = '';
    this.status = ETeamStatus.Active;
    this.statusName = null;
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

    if (!this.statusName) {
      errors.push('The statusName is required');
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
