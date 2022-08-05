import { ITeamEntity, ITeamMember, ITeamMetadata } from '@libs/entities-lib/team';
import { IStorage } from '@/store/storage/team/storage.types';
import { IStore, IState } from '../../store.types';
import { Base } from '../base';

export class TeamStorage
  extends Base<ITeamEntity, ITeamMetadata, uuid> implements IStorage {
  constructor(readonly pStore: IStore<IState>, readonly pEntityModuleName: string, readonly pMetadataModuleName: string) {
    super(pStore, pEntityModuleName, pMetadataModuleName);
  }

  private getters = {
    ...this.baseGetters,
  }

  private actions = {
    ...this.baseActions,

    getTeamsAssignable: (eventId: uuid): Promise<ITeamEntity[]> => this.store.dispatch(`${this.entityModuleName}/getTeamsAssignable`, eventId),

    getTeamsAssigned: (caseFileId: uuid): Promise<ITeamEntity[]> => this.store.dispatch(`${this.entityModuleName}/getTeamsAssigned`, caseFileId),

    createTeam: (payload: ITeamEntity):
      Promise<ITeamEntity> => this.store.dispatch(`${this.entityModuleName}/createTeam`, payload),

    editTeam: (payload: ITeamEntity):
      Promise<ITeamEntity> => this.store.dispatch(`${this.entityModuleName}/editTeam`, payload),

    addTeamMembers: (teamId: uuid, teamMembers: ITeamMember[]):
      Promise<ITeamEntity> => this.store.dispatch(`${this.entityModuleName}/addTeamMembers`, { teamId, teamMembers }),

    removeTeamMember: (teamId: uuid, teamMemberId: uuid):
      Promise<ITeamEntity> => this.store.dispatch(`${this.entityModuleName}/removeTeamMember`, { teamId, teamMemberId }),
  }

  private mutations = {
    ...this.baseMutations,
  }

  public make = () => ({
    getters: this.getters,
    actions: this.actions,
    mutations: this.mutations,
  })
}
