import { ActionTree, ActionContext } from 'vuex';
import applicationInsights from '@libs/registration-lib/plugins/applicationInsights/applicationInsights';
import { ITeamEntity, ITeamMember } from '@/entities/team';
import { TeamsService } from '@/services/teams/entity';
import { BaseModule } from '../base';
import { IRootState } from '../../store.types';

import { IState } from '../base/base.types';
import { ITeamEntityState } from './teamEntity.types';

export class TeamEntityModule extends BaseModule <ITeamEntity, uuid> {
  constructor(readonly service: TeamsService) {
    super(service);
  }

  public getModule = () => ({
    namespaced: true,
    state: this.state,
    getters: this.getters,
    mutations: this.mutations,
    actions: this.actions as unknown as ActionTree<IState<ITeamEntity>, IRootState>,
  })

  public state = {
    ...this.baseState,
  }

  public getters = {
    ...this.baseGetters,
  }

  public mutations = {
    ...this.baseMutations,
  }

  public actions = {
    ...this.baseActions,

    getTeamsAssignable: async (
      context: ActionContext<ITeamEntityState, ITeamEntityState>,
      eventId: uuid,
    ): Promise<ITeamEntity[]> => {
      const teams = await this.service.getTeamsAssignable(eventId);
      if (teams && teams.length) {
        return teams;
      }
      return [];
    },

    getTeamsAssigned: async (
      context: ActionContext<ITeamEntityState, ITeamEntityState>,
      caseFileId: uuid,
    ): Promise<ITeamEntity[]> => {
      const teams = await this.service.getTeamsAssigned(caseFileId);
      if (teams && teams.length) {
        context.commit('setAll', teams);
        return teams;
      }
      return [];
    },

    createTeam: async (
      context: ActionContext<ITeamEntityState, ITeamEntityState>,
      payload: ITeamEntity,
    ): Promise<ITeamEntity> => {
      // error will be thrown to UI on purpose
      const res = await this.service.createTeam(payload);
      if (res) {
        context.commit('addNewlyCreatedId', res);
        context.commit('set', res);
      }
      return res;
    },

    editTeam: async (
      context: ActionContext<ITeamEntityState, ITeamEntityState>,
      payload: ITeamEntity,
    ): Promise<ITeamEntity> => {
      // error will be thrown to UI on purpose
      const res = await this.service.editTeam(payload);
      context.commit('set', res);
      return res;
    },

    addTeamMembers: async (
      context: ActionContext<ITeamEntityState, ITeamEntityState>,
      payload: { teamId: uuid, teamMembers: ITeamMember[] },
    ): Promise<ITeamEntity> => {
      try {
        const res = await this.service.addTeamMembers(payload.teamId, payload.teamMembers);
        context.commit('set', res);
        return res;
      } catch (e) {
        applicationInsights.trackException(e, { payload }, 'module.teamEntity', 'addTeamMembers');
        return null;
      }
    },

    removeTeamMember: async (
      context: ActionContext<ITeamEntityState, ITeamEntityState>,
      payload: { teamId: uuid, teamMemberId: uuid },
    ): Promise<ITeamEntity> => {
      try {
        const res = await this.service.removeTeamMember(payload.teamId, payload.teamMemberId);
        context.commit('set', res);
        return res;
      } catch (e) {
        applicationInsights.trackException(e, { payload }, 'module.teamEntity', 'removeTeamMembers');
        return null;
      }
    },
  }
}
