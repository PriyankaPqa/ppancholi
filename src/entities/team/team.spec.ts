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
  });
});
