import { ActionContext } from 'vuex';
import { IState } from '@/store/modules/team/team.types';
import { IRootState } from '@/store';

import { IAppUserData } from '@/entities/app-user';
import {
  mockTeamMembersData,
  mockTeamsData, mockTeamSearchData, mockTeamSearchDataAggregate, Team,
} from '@/entities/team';
import { IEvent } from '@/entities/event';
import { mockUserAccountEntity, mockUserAccountMetadata } from '@/entities/user-account';
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
      const payload = mockTeamsData()[0];

      const context = mockActionsContext();
      const userAccountsEntities = [
        mockUserAccountEntity({ id: 'guid-member-1' }),
        mockUserAccountEntity({ id: 'guid-member-2' }),
      ];

      const userAccountsMetadata = [
        mockUserAccountMetadata({ id: 'guid-member-1' }),
        mockUserAccountMetadata({ id: 'guid-member-2' }),
      ];
      context.dispatch = jest.fn().mockReturnValueOnce(userAccountsEntities).mockReturnValueOnce(userAccountsMetadata);

      const res = await utils.buildTeamSearchDataPayload(payload, context);

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
    it('should return the team aggregated with the users from user-accounts', async () => {
      const context = mockActionsContext();
      const userAccountsEntities = [
        mockUserAccountEntity({ id: 'guid-member-1' }),
        mockUserAccountEntity({ id: 'guid-member-2' }),
      ];

      const userAccountsMetadata = [
        mockUserAccountMetadata({ id: 'guid-member-1' }),
        mockUserAccountMetadata({ id: 'guid-member-2' }),
      ];
      context.dispatch = jest.fn().mockReturnValueOnce(userAccountsEntities).mockReturnValueOnce(userAccountsMetadata);
      const team = mockTeamSearchData()[0];
      const res = await utils.aggregateTeamSearchDataWithMembers(context, team);

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
