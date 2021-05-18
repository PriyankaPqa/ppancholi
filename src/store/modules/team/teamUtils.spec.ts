import { ActionContext } from 'vuex';
import { IState } from '@/store/modules/team/team.types';
import { IRootState } from '@/store';
import { mockProvider } from '@/services/provider';
import { IAppUserData } from '@/entities/app-user';
import {
  mockTeamMembersData,
  mockTeamsData, mockTeamSearchData, mockTeamSearchDataAggregate, Team,
} from '@/entities/team';
import { IEvent } from '@/entities/event';
import * as utils from './teamUtils';

const mockActionsContext = (): ActionContext<IState, IRootState> => ({
  commit: jest.fn(),
  dispatch: jest.fn(),
  state: {
    submitLoading: false, // used when adding members and saving
    searchLoading: false, // used in team list table
    getLoading: false, // used when loading a team
    removeLoading: false, // used when removing a member
    team: new Team(mockTeamSearchDataAggregate()[0]),
    cachedTeams: [],
  },
  getters: {},
  rootState: null,
  rootGetters: {
    'event/eventsByStatus': jest.fn(() => [] as IEvent[]),
    'appUser/appUserWhere': jest.fn(() => [] as IAppUserData[]),
  },
});

describe('>>> Team utils', () => {
  describe('>> buildTeamSearchDataPayload', () => {
    it('should build the payload correctly', async () => {
      const services = mockProvider();
      const payload = mockTeamsData()[0];

      jest.spyOn(services.userAccounts, 'searchUserAccounts').mockImplementation(() => ({
        odataCount: 2,
        odataContext: 'context',
        value: mockTeamMembersData(),
      }));

      const res = await utils.buildTeamSearchDataPayload(payload, mockActionsContext(), services);

      expect(res).toEqual({
        teamId: payload.id,
        tenantId: mockActionsContext().state.team.tenantId,
        teamName: payload.name,
        teamType: payload.teamType,
        teamTypeName: mockActionsContext().state.team.teamTypeName,
        eventCount: mockActionsContext().state.team.eventCount,
        primaryContactDisplayName: mockActionsContext().state.team.primaryContactDisplayName,
        teamMemberCount: mockActionsContext().state.team.teamMemberCount,
        events: utils.retrieveTeamEvents(payload.eventIds, mockActionsContext()),
        teamStatus: payload.status,
        teamMembers: mockTeamMembersData(),
        teamStatusName: mockActionsContext().state.team.statusName,
      });
    });
  });

  describe('>> aggregateTeamSearchDataWithMembers', () => {
    it('should call the user-accounts search api with the list of team member ids', async () => {
      const team = mockTeamSearchData()[0];
      const services = mockProvider();
      jest.spyOn(services.userAccounts, 'searchUserAccounts').mockImplementation(() => ({
        odataCount: 2,
        odataContext: 'context',
        value: mockTeamMembersData(),
      }));

      await utils.aggregateTeamSearchDataWithMembers(
        services,
        team,
      );

      expect(services.userAccounts.searchUserAccounts).toHaveBeenCalledWith({
        filter: "search.in(UserAccountId, 'guid-member-1|guid-member-2', '|')",
      });
    });

    it('should return the team aggregated with the users from user-accounts', async () => {
      const team = mockTeamSearchData()[0];
      const services = mockProvider();
      jest.spyOn(services.userAccounts, 'searchUserAccounts').mockImplementation(() => ({
        odataCount: 2,
        odataContext: 'context',
        value: mockTeamMembersData(),
      }));

      const res = await utils.aggregateTeamSearchDataWithMembers(
        services,
        team,
      );

      expect(res).toEqual({
        ...team,
        teamMembers: mockTeamMembersData(),
      });
    });
  });

  describe('>> retrieveTeamEvents', () => {
    it('retrieve cached events with given ids', () => {
      const events = [{ id: 'guid-1' }, { id: 'guid-2' }];
      const eventsIds = ['guid-1', 'guid-2'];

      const context = mockActionsContext();
      const eventsByStatus = context.rootGetters['event/eventsByStatus'];

      eventsByStatus.mockReturnValueOnce(events);

      const res = utils.retrieveTeamEvents(eventsIds, context);
      expect(res).toEqual([{ id: 'guid-1' }, { id: 'guid-2' }]);
    });
  });
});
