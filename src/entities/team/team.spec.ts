import { MAX_LENGTH_MD } from '@/constants/validations';
import { TeamEntity } from './team';
import {
  mockTeamMembersData, mockTeamsDataStandard, mockCombinedTeams,
} from './team.mock';
import { TeamType, ITeamMember } from './team.types';

const mockTeamData = mockTeamsDataStandard();

describe('>>> Team', () => {
  describe('>> constructor', () => {
    it('should instantiate id', () => {
      const team = new TeamEntity({ ...mockTeamData, id: '***' });
      expect(team.id).toBe('***');
    });

    it('should instantiate tenantId', () => {
      const team = new TeamEntity({ ...mockTeamData, tenantId: '***' });
      expect(team.tenantId).toBe('***');
    });

    it('should instantiate name', () => {
      const team = new TeamEntity({ ...mockTeamData, name: '***' });
      expect(team.name).toEqual('***');
    });

    it('should instantiate teamType', () => {
      const team = new TeamEntity({ ...mockTeamData, teamType: TeamType.Standard });
      expect(team.teamType).toEqual(TeamType.Standard);
    });

    it('should instantiate eventIds', () => {
      const team = new TeamEntity({ ...mockTeamData, eventIds: ['abc'] });
      expect(team.eventIds).toEqual(['abc']);
    });

    it('should instantiate teamMembers', () => {
      const team = new TeamEntity({ ...mockTeamData, teamMembers: mockTeamMembersData() });
      expect(team.teamMembers).toEqual(mockTeamMembersData());
    });
  });

  describe('Methods', () => {
    describe('setPrimaryContact', () => {
      let team: TeamEntity;

      beforeEach(() => {
        team = new TeamEntity(mockTeamData);
      });

      it('should set a user as primary contact and all other users should not be primary users', () => {
        const nonPrimaryContactMember = mockTeamMembersData()[1];
        team.setPrimaryContact(nonPrimaryContactMember);
        expect(team.teamMembers[0].isPrimaryContact).toBeFalsy();
        expect(team.teamMembers[1].isPrimaryContact).toBeTruthy();
      });

      it('should add a new member to the team and set it as primary contact if it is not already a member', () => {
        const member: ITeamMember = {
          id: 'guid-member-x',
          isPrimaryContact: true,
        };
        team.setPrimaryContact(member);
        expect(team.teamMembers[0].isPrimaryContact).toBeFalsy();
        expect(team.teamMembers[1].isPrimaryContact).toBeFalsy();
        expect(team.teamMembers[2].isPrimaryContact).toBeTruthy();
      });
    });

    describe('getPrimaryContact', () => {
      it('should return the primary contact', () => {
        const team = new TeamEntity(mockCombinedTeams()[0].entity);
        expect(team.getPrimaryContact()).toEqual(mockCombinedTeams()[0].entity.teamMembers[0]);
      });
    });

    describe('setEventIds', () => {
      it('should set events if an array', () => {
        const team = new TeamEntity();
        team.setEventIds(['abc', 'def']);
        expect(team.eventIds).toEqual(['abc', 'def']);
      });

      it('should set events if a string', () => {
        const team = new TeamEntity();
        team.setEventIds('abc');
        expect(team.eventIds).toEqual(['abc']);
      });
    });
  });

  describe('>> validation', () => {
    test('true is returned for a valid entity', () => {
      const team = new TeamEntity(mockTeamData);
      expect(team.validate()).toBe(true);
    });

    describe('> validation attributes', () => {
      test('id is required', () => {
        const team = new TeamEntity(mockTeamData);
        team.id = null;
        expect(team.validate()).toContain('The id is required');
      });

      test('tenantId is required', () => {
        const team = new TeamEntity(mockTeamData);
        team.tenantId = null;
        expect(team.validate()).toContain('The tenantId is required');
      });

      test('name is required', () => {
        const team = new TeamEntity(mockTeamData);
        team.name = null;
        expect(team.validate()).toContain('The team name is required');
      });

      test('team name length not longer than allowed', () => {
        const team = new TeamEntity(mockTeamData);
        team.name = 'x'.repeat(MAX_LENGTH_MD + 1);
        expect(team.validate()).toContain(`The team name should not be longer than ${MAX_LENGTH_MD} characters`);
      });

      test('teamType is required', () => {
        const team = new TeamEntity(mockTeamData);
        team.teamType = null;
        expect(team.validate()).toContain('The team type is required');
      });

      test('The team status is required', () => {
        const team = new TeamEntity(mockTeamData);
        team.status = null;
        expect(team.validate()).toContain('The team status is required');
      });

      test('A primary contact status is required', () => {
        const team = new TeamEntity(mockCombinedTeams()[0].entity);

        team.teamMembers.forEach((t) => {
          t.isPrimaryContact = false;
        });

        expect(team.validate()).toContain('A primary contact team member is required');
      });

      test('Ad-Hoc team can only have one event attached', () => {
        const team = new TeamEntity(mockCombinedTeams()[1].entity);
        team.eventIds = ['d52d45e8-1973-4d54-91f4-8ec0864f8ff9', 'a52d45e8-1973-4d54-91f4-8ec0864f8ff9'];
        expect(team.validate()).toContain('An ad-hoc team should have one eventId');

        team.eventIds = ['d52d45e8-1973-4d54-91f4-8ec0864f8ff9'];
        expect(team.validate()).not.toContain('An ad-hoc team should have one eventId');
      });
    });
  });
});
