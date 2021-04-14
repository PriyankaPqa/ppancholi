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
    'event/eventsByStatus': () => [] as IEvent[],
    'appUser/appUserWhere': () => [] as IAppUserData[],
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
});
