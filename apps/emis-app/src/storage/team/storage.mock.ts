import {
  ITeamCombined, ITeamEntity, mockCombinedTeams, mockTeamsDataStandard,
} from '@libs/entities-lib/team';

import { BaseMock } from '../base/base.mock';

export class TeamStorageMock extends BaseMock<ITeamCombined, ITeamEntity> {
  constructor() {
    super(mockCombinedTeams(), mockTeamsDataStandard());
  }

  protected getters = {
    ...this.baseGetters,
  };

  protected actions = {
    ...this.baseActions,
    getTeamsAssignable: jest.fn(() => [this.entity]),
    getTeamsAssigned: jest.fn(() => [this.entity]),
    createTeam: jest.fn(() => this.entity),
    editTeam: jest.fn(() => this.entity),
    addTeamMembers: jest.fn(() => this.entity),
    removeTeamMember: jest.fn(() => this.entity),
    emptyTeam: jest.fn(() => this.entity),
  };

  protected mutations = {
    ...this.baseMutations,
  };

  public make = () => ({
    getters: this.getters,
    actions: this.actions,
    mutations: this.mutations,
  });
}
