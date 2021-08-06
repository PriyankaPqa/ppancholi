/* eslint-disable */
import { ActionContext } from 'vuex';

import { httpClient } from '@/services/httpClient';
import { TeamsService } from '@/services/teams/entity';
import { TeamEntityModule } from './teamEntity';
import { ITeamEntityState } from './teamEntity.types';
import { mockTeamMembersData, mockTeamsDataStandard, mockTeamsDataAddHoc } from '@/entities/team';

const service = new TeamsService(httpClient);
const module = new TeamEntityModule(service);

const actionContext = {
  commit: jest.fn(),
  dispatch: jest.fn(),
  state: {} as ITeamEntityState,
  getters: {},
  rootState: null,
  rootGetters: {},
} as ActionContext<ITeamEntityState, ITeamEntityState>;

describe('Team entity module', () => {
  describe('actions', () => {
    describe('getTeamsAssignable', () => {
      it('should call getTeamsAssignable service with proper params', async () => {
        module.service.getTeamsAssignable = jest.fn();
        await module.actions.getTeamsAssignable(actionContext, 'abc');

        expect(module.service.getTeamsAssignable).toBeCalledWith('abc');
      });
    });
    
    describe('createTeam', () => {
      it('should call createTeam service with proper params and commit results', async () => {
        module.service.createTeam = jest.fn(() => Promise.resolve(mockTeamsDataAddHoc()));
        await module.actions.createTeam(actionContext, mockTeamsDataStandard());

        expect(module.service.createTeam).toBeCalledWith(mockTeamsDataStandard());
        expect(actionContext.commit).toBeCalledWith('set', mockTeamsDataAddHoc());
      });
    });
    
    describe('editTeam', () => {
      it('should call editTeam service with proper params and commit results', async () => {
        module.service.editTeam = jest.fn(() => Promise.resolve(mockTeamsDataAddHoc()));
        await module.actions.editTeam(actionContext, mockTeamsDataStandard());

        expect(module.service.editTeam).toBeCalledWith(mockTeamsDataStandard());
        expect(actionContext.commit).toBeCalledWith('set', mockTeamsDataAddHoc());
      });
    });
    
    describe('addTeamMembers', () => {
      it('should call addTeamMembers service with proper params and commit results', async () => {
        module.service.addTeamMembers = jest.fn(() => Promise.resolve(mockTeamsDataAddHoc()));
        await module.actions.addTeamMembers(actionContext, {teamId: 'abc', teamMembers: mockTeamMembersData()});

        expect(module.service.addTeamMembers).toBeCalledWith('abc', mockTeamMembersData());
        expect(actionContext.commit).toBeCalledWith('set', mockTeamsDataAddHoc());
      });
    });
    
    describe('removeTeamMember', () => {
      it('should call editTeam service with proper params and commit results', async () => {
        module.service.removeTeamMember = jest.fn(() => Promise.resolve(mockTeamsDataAddHoc()));
        await module.actions.removeTeamMember(actionContext, {teamId: 'abc', teamMemberId: 'sss'});

        expect(module.service.removeTeamMember).toBeCalledWith('abc', 'sss');
        expect(actionContext.commit).toBeCalledWith('set', mockTeamsDataAddHoc());
      });
    });
  });
});
