import { mockTeamsData, mockTeamSearchData, Team } from '@/entities/team';
import { ActionContext } from 'vuex';
import { IState } from '@/store/modules/team/team.types';
import { IRootState } from '@/store';

import { IAppUserData } from '@/entities/app-user';

import { IEvent } from '@/entities/event';
import * as utils from './utils';

const mockActionsContext = (): ActionContext<IState, IRootState> => ({
  commit: jest.fn(),
  dispatch: jest.fn(),
  state: {
    submitLoading: false, // used when adding members and saving
    searchLoading: false, // used in team list table
    getLoading: false, // used when loading a team
    removeLoading: false, // used when removing a member
    team: new Team(mockTeamSearchData()[0]),
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
    it('should build the payload correctly', () => {
      const payload = mockTeamsData()[0];

      const res = utils.buildTeamSearchDataPayload(payload, mockActionsContext());

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
        teamMembers: utils.retrieveTeamMembers(payload.teamMembers, mockActionsContext()),
        teamStatusName: mockActionsContext().state.team.statusName,
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
