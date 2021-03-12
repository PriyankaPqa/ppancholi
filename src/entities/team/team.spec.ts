import { MAX_LENGTH_MD } from '@/constants/validations';
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

    it('should instantiate events', () => {
      const team = new Team(mockTeamData);
      expect(team.events).toEqual(mockTeamData.events);
    });
  });

  describe('Methods', () => {
    describe('addTeamMember', () => {
      it('should add a team member to the team and set it as not primary contact if it receives only one argument', () => {
        const team = new Team();
        const mockId = '1';
        team.addTeamMember(mockId);
        expect(team.teamMembers).toEqual([{ id: '1', isPrimaryContact: false }]);
      });

      it('should add a team member to the team and set it as primary contact if the second argument is TRUE', () => {
        const team = new Team();
        const mockId = '2';
        team.addTeamMember(mockId, true);
        expect(team.teamMembers).toEqual([{ id: '2', isPrimaryContact: true }]);
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

      it('should add a new member to the team and set it as primary contact if it is not already a member', () => {
        team.setPrimaryContact('guid-member-new');
        expect(team.teamMembers).toEqual([{
          id: 'guid-member-1',
          isPrimaryContact: false,
        }, {
          id: 'guid-member-2',
          isPrimaryContact: false,
        }, {
          id: 'guid-member-new',
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

      test('team name length not longer than allowed', () => {
        const team = new Team(mockTeamData);
        team.name = 'x'.repeat(MAX_LENGTH_MD + 1);
        expect(team.validate()).toContain(`The team name should not be longer than ${MAX_LENGTH_MD} characters`);
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
        team.events = [
          {
            id: 'd52d45e8-1973-4d54-91f4-8ec0864f8ff9',
            name: {
              translation: {
                en: 'Event 1',
                fr: 'Event 1 - FR',
              },
            },
          },
          {
            id: 'a52d45e8-1973-4d54-91f4-8ec0864f8ff9',
            name: {
              translation: {
                en: 'Event 2',
                fr: 'Event 2 - FR',
              },
            },
          },
        ];
        expect(team.validate()).toContain('An ad-hoc team should have one eventId');
      });
    });
  });
});
