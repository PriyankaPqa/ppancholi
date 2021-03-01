import { Team } from './team';
import { mockTeamsData } from './team.mock';
import { ETeamStatus, ETeamType } from './team.types';

const mockTeamData = mockTeamsData()[0];

describe('>>> Team', () => {
  describe('>> constructor', () => {
    it('should instantiate id', () => {
      const team = new Team(mockTeamData);
      expect(team.id).toBe('guid-team-1');
    });

    it('should instantiate name', () => {
      const team = new Team(mockTeamData);
      expect(team.name).toEqual('Standard Active Team 1');
    });

    it('should instantiate teamMembers', () => {
      const team = new Team(mockTeamData);
      expect(team.teamMembers).toEqual([{
        id: 'guid-member-1',
        isPrimaryContact: true,
      }, {
        id: 'guid-member-2',
        isPrimaryContact: false,
      }]);
    });

    it('should instantiate teamType', () => {
      const team = new Team(mockTeamData);
      expect(team.teamType).toEqual(ETeamType.Standard);
    });

    it('should instantiate status', () => {
      const team = new Team(mockTeamData);
      expect(team.status).toEqual(ETeamStatus.Active);
    });

    it('should instantiate eventIds', () => {
      const team = new Team(mockTeamData);
      expect(team.eventIds).toEqual([
        'd52d45e8-1973-4d54-91f4-8ec0864f8ff9',
        'a52d45e8-1973-4d54-91f4-8ec0864f8ff9',
      ]);
    });
  });

  describe('Methods', () => {
    describe('addTeamMember', () => {
      it('should add a team member to the team', () => {
        const team = new Team();
        const mockId = '1';
        team.addTeamMember(mockId);
        expect(team.teamMembers).toEqual([{ id: '1', isPrimaryContact: false }]);
      });
    });

    describe('setPrimaryContact', () => {
      let team: Team;
      beforeEach(() => {
        team = new Team(mockTeamData);
      });

      it('should set a user as primary contact and all other users should not be primary users', () => {
        team.setPrimaryContact('guid-member-2');
        expect(team.teamMembers).toEqual([{
          id: 'guid-member-1',
          isPrimaryContact: false,
        }, {
          id: 'guid-member-2',
          isPrimaryContact: true,
        }]);
      });

      it('should not change the team members if the id passed to setPrimaryContact is not an id of a team member', () => {
        team.setPrimaryContact('guid-member-foo');
        expect(team.teamMembers).toEqual(new Team(mockTeamData).teamMembers);
      });
    });

    describe('addPrimaryContact', () => {
      it('should add a new member to the team and set it as primary contact', () => {
        const team = new Team(mockTeamData);
        team.addPrimaryContact('guid-member-3');
        expect(team.teamMembers).toEqual([
          {
            id: 'guid-member-1',
            isPrimaryContact: false,
          }, {
            id: 'guid-member-2',
            isPrimaryContact: false,
          }, {
            id: 'guid-member-3',
            isPrimaryContact: true,
          },
        ]);
      });
    });

    describe('getPrimaryContact', () => {
      it('should return the primary contact', () => {
        const team = new Team(mockTeamsData()[0]);
        expect(team.getPrimaryContact()).toEqual(mockTeamsData()[0].teamMembers[0]);
      });
    });
  });

  describe('>> validation', () => {
    test('true is returned for a valid entity', () => {
      const team = new Team(mockTeamData);
      expect(team.validate()).toBe(true);
    });

    describe('> validation attributes', () => {
      test('id is required', () => {
        const team = new Team(mockTeamData);
        team.id = null;
        expect(team.validate()).toContain('The id is required');
      });

      test('name is required', () => {
        const team = new Team(mockTeamData);
        team.name = null;
        expect(team.validate()).toContain('The team name is required');
      });

      test('teamType is required', () => {
        const team = new Team(mockTeamData);
        team.teamType = null;
        expect(team.validate()).toContain('The team type is required');
      });

      test('The team status is required', () => {
        const team = new Team(mockTeamData);
        team.status = null;
        expect(team.validate()).toContain('The team status is required');
      });

      test('The teamMembers status is required', () => {
        const team = new Team(mockTeamData);
        team.teamMembers = [
          {
            id: 'guid-member-1',
            isPrimaryContact: false,
          }, {
            id: 'guid-member-2',
            isPrimaryContact: false,
          },
        ];
        expect(team.validate()).toContain('A primary contact team member is required');
      });

      test('Ad-Hoc team can only have one event attached', () => {
        const team = new Team(mockTeamsData()[1]);
        team.eventIds = ['0000', '0001'];
        expect(team.validate()).toContain('An ad-hoc team should have one eventId');
      });
    });
  });
});
