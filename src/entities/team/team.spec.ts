import { MAX_LENGTH_MD } from '@/constants/validations';
import { EUserAccountStatus } from '../user-account';
import { Team } from './team';
import { mockTeamEvents, mockTeamMembersData, mockTeamSearchDataAggregate } from './team.mock';
import { ETeamStatus, ETeamType, ITeamMemberData } from './team.types';

const mockTeamData = mockTeamSearchDataAggregate()[0];

describe('>>> Team', () => {
  describe('>> constructor', () => {
    it('should instantiate id', () => {
      const team = new Team(mockTeamData);
      expect(team.id).toBe('e64a9cd4-4e6b-46a7-b022-e93e0bdc24df');
    });

    it('should instantiate tenantId', () => {
      const team = new Team(mockTeamData);
      expect(team.tenantId).toBe(mockTeamData.tenantId);
    });

    it('should instantiate name', () => {
      const team = new Team(mockTeamData);
      expect(team.name).toEqual('Danh 2 Stad  L’Île aux Hérons');
    });

    it('should instantiate teamType', () => {
      const team = new Team(mockTeamData);
      expect(team.teamType).toEqual(ETeamType.Standard);
    });

    it('should instantiate teamTypeName', () => {
      const team = new Team(mockTeamData);
      expect(team.teamTypeName).toEqual(mockTeamData.teamTypeName);
    });

    it('should instantiate primaryContactDisplayName', () => {
      const team = new Team(mockTeamData);
      expect(team.primaryContactDisplayName).toEqual(mockTeamData.primaryContactDisplayName);
    });

    it('should instantiate statusName', () => {
      const team = new Team(mockTeamData);
      expect(team.statusName).toEqual(mockTeamData.teamStatusName);
    });

    it('should instantiate status', () => {
      const team = new Team(mockTeamData);
      expect(team.status).toEqual(ETeamStatus.Active);
    });

    it('should instantiate teamMembers', () => {
      const team = new Team(mockTeamData);
      expect(team.teamMembers).toEqual(mockTeamMembersData());
    });

    it('should instantiate teamMemberCount', () => {
      const team = new Team(mockTeamData);
      expect(team.teamMemberCount).toEqual(mockTeamData.teamMemberCount);
    });

    it('should instantiate events', () => {
      const team = new Team(mockTeamData);
      expect(team.events).toEqual(mockTeamData.events);
    });

    it('should instantiate eventCount', () => {
      const team = new Team(mockTeamData);
      expect(team.eventCount).toEqual(mockTeamData.eventCount);
    });
  });

  describe('Methods', () => {
    describe('addTeamMembers', () => {
      it('should add the member to the team and increment their team count', () => {
        const team = new Team();
        const member = mockTeamMembersData()[0];
        team.addTeamMembers(member);
        expect(team.teamMembers).toEqual([{
          ...member,
          teamCount: member.teamCount + 1,
        }]);
      });

      it('should add all members to the team and increment their team counts', () => {
        const team = new Team();
        const member = mockTeamMembersData();
        team.addTeamMembers(member);
        expect(team.teamMembers).toEqual(member.map((m) => ({
          ...m,
          teamCount: m.teamCount + 1,
        })));
      });
    });

    describe('removeTeamMember', () => {
      it('should return false if member is not found', () => {
        const team = new Team(mockTeamData);
        const mockId = 'unknown';
        const result = team.removeTeamMember(mockId);
        expect(result).toBeFalsy();
      });

      it('should remove the member if he is not a primary contact and return true', () => {
        const team = new Team(mockTeamData);
        const mockId = 'guid-member-2';
        const result = team.removeTeamMember(mockId);
        expect(team.teamMembers).toEqual([mockTeamData.teamMembers[0]]);
        expect(result).toBeTruthy();
      });

      it('should not do anything if primary contact and return false', () => {
        const team = new Team(mockTeamData);
        const mockId = 'guid-member-1';
        const result = team.removeTeamMember(mockId);
        expect(team.teamMembers).toEqual(mockTeamData.teamMembers);
        expect(result).toBeFalsy();
      });
    });

    describe('setPrimaryContact', () => {
      let team: Team;

      beforeEach(() => {
        team = new Team(mockTeamData);
      });

      it('should set a user as primary contact and all other users should not be primary users', () => {
        const nonPrimaryContactMember = mockTeamMembersData()[1];
        team.setPrimaryContact(nonPrimaryContactMember);
        expect(team.teamMembers[0].isPrimaryContact).toBeFalsy();
        expect(team.teamMembers[1].isPrimaryContact).toBeTruthy();
      });

      it('should add a new member to the team and set it as primary contact if it is not already a member', () => {
        const member: ITeamMemberData = {
          userAccountId: 'guid-member-x',
          isPrimaryContact: true,
          displayName: 'Mister Test',
          givenName: 'Mister',
          surname: 'Test',
          tenantId: '...',
          userAccountStatus: EUserAccountStatus.Active,
          filters: [],
          emailAddress: 'test@test.com',
          phoneNumber: '',
          roleId: 'role-id-1',
          roleName: {
            translation: {
              en: 'Role 1',
              fr: 'Role 1',
            },
          },
          teamCount: 5,
          caseFilesCount: 3,
          openCaseFilesCount: 3,
          inactiveCaseFilesCount: 3,
        };
        team.setPrimaryContact(member);
        expect(team.teamMembers[0].isPrimaryContact).toBeFalsy();
        expect(team.teamMembers[1].isPrimaryContact).toBeFalsy();
        expect(team.teamMembers[2].isPrimaryContact).toBeTruthy();
      });
    });

    describe('getPrimaryContact', () => {
      it('should return the primary contact', () => {
        const team = new Team(mockTeamSearchDataAggregate()[0]);
        expect(team.getPrimaryContact()).toEqual(mockTeamSearchDataAggregate()[0].teamMembers[0]);
      });
    });

    describe('setEvents', () => {
      it('should set events if an array', () => {
        const team = new Team();
        team.setEvents(mockTeamEvents());
        expect(team.events).toEqual(mockTeamEvents());
      });

      it('should set events if an object', () => {
        const team = new Team();
        team.setEvents(mockTeamEvents()[0]);
        expect(team.events).toEqual([mockTeamEvents()[0]]);
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

      test('tenantId is required', () => {
        const team = new Team(mockTeamData);
        team.tenantId = null;
        expect(team.validate()).toContain('The tenantId is required');
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

      test('teamTypeName is required', () => {
        const team = new Team(mockTeamData);
        team.teamTypeName = null;
        expect(team.validate()).toContain('The teamTypeName is required');
      });

      test('primaryContactDisplayName is required', () => {
        const team = new Team(mockTeamData);
        team.primaryContactDisplayName = '';
        expect(team.validate()).toContain('The primaryContactDisplayName is required');
      });

      test('The team status is required', () => {
        const team = new Team(mockTeamData);
        team.status = null;
        expect(team.validate()).toContain('The team status is required');
      });

      test('The teamMembers status is required', () => {
        const team = new Team(mockTeamSearchDataAggregate()[0]);

        team.teamMembers[0].isPrimaryContact = false;
        team.teamMembers[1].isPrimaryContact = false;

        expect(team.validate()).toContain('A primary contact team member is required');
      });

      test('Ad-Hoc team can only have one event attached', () => {
        const team = new Team(mockTeamSearchDataAggregate()[1]);
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
