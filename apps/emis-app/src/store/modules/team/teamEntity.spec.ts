import { ActionContext } from 'vuex';
import { httpClient } from '@/services/httpClient';
import { TeamsService } from '@/services/teams/entity';
import { mockTeamMembersData, mockTeamsDataStandard, mockTeamsDataAddHoc } from '@/entities/team';
import { TeamEntityModule } from './teamEntity';
import { ITeamEntityState } from './teamEntity.types';
import { mockSignalR } from '../../../ui/plugins/signal-r';

const signalR = mockSignalR();
const service = new TeamsService(httpClient);
const myModule = new TeamEntityModule(service, signalR);

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
        myModule.service.getTeamsAssignable = jest.fn();
        await myModule.actions.getTeamsAssignable(actionContext, 'abc');

        expect(myModule.service.getTeamsAssignable).toBeCalledWith('abc');
      });
    });

    describe('getTeamsAssigned', () => {
      it('calls the service getTeamsAssigned with the right params', async () => {
        myModule.service.getTeamsAssigned = jest.fn();
        const caseFileId = '1234';
        await myModule.actions.getTeamsAssigned(actionContext, caseFileId);
        expect(myModule.service.getTeamsAssigned).toHaveBeenCalledWith(caseFileId);
      });
    });

    describe('createTeam', () => {
      it('should call createTeam service with proper params and commit results', async () => {
        const res = mockTeamsDataAddHoc();
        myModule.service.createTeam = jest.fn(() => Promise.resolve(res));
        await myModule.actions.createTeam(actionContext, mockTeamsDataStandard());

        expect(myModule.service.createTeam).toBeCalledWith(mockTeamsDataStandard());
        expect(actionContext.commit).toBeCalledWith('set', res);
        expect(actionContext.commit).toBeCalledWith('addNewlyCreatedId', res);
      });
    });

    describe('editTeam', () => {
      it('should call editTeam service with proper params and commit results', async () => {
        myModule.service.editTeam = jest.fn(() => Promise.resolve(mockTeamsDataAddHoc()));
        await myModule.actions.editTeam(actionContext, mockTeamsDataStandard());

        expect(myModule.service.editTeam).toBeCalledWith(mockTeamsDataStandard());
        expect(actionContext.commit).toBeCalledWith('set', mockTeamsDataAddHoc());
      });
    });

    describe('addTeamMembers', () => {
      it('should call addTeamMembers service with proper params and commit results', async () => {
        myModule.service.addTeamMembers = jest.fn(() => Promise.resolve(mockTeamsDataAddHoc()));
        await myModule.actions.addTeamMembers(actionContext, { teamId: 'abc', teamMembers: mockTeamMembersData() });

        expect(myModule.service.addTeamMembers).toBeCalledWith('abc', mockTeamMembersData());
        expect(actionContext.commit).toBeCalledWith('set', mockTeamsDataAddHoc());
      });
    });

    describe('removeTeamMember', () => {
      it('should call editTeam service with proper params and commit results', async () => {
        myModule.service.removeTeamMember = jest.fn(() => Promise.resolve(mockTeamsDataAddHoc()));
        await myModule.actions.removeTeamMember(actionContext, { teamId: 'abc', teamMemberId: 'sss' });

        expect(myModule.service.removeTeamMember).toBeCalledWith('abc', 'sss');
        expect(actionContext.commit).toBeCalledWith('set', mockTeamsDataAddHoc());
      });
    });
  });
});
