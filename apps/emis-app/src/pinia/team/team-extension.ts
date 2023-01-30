import { BaseStoreComponents } from '@libs/stores-lib/base';
import { ITeamsServiceMock, TeamsService } from '@libs/services-lib/teams/entity';
import { ITeamEntity, ITeamMember, IdParams } from '@libs/entities-lib/team';
import applicationInsights from '@libs/shared-lib/plugins/applicationInsights/applicationInsights';

export function getExtensionComponents(
  baseComponents: BaseStoreComponents<ITeamEntity, IdParams>,
  entityService: TeamsService | ITeamsServiceMock,
) {
  async function getTeamsAssignable(eventId: uuid): Promise<ITeamEntity[]> {
    const teams = await entityService.getTeamsAssignable(eventId);
    if (teams && teams.length) {
      return teams;
    }
    return [];
  }

  async function getTeamsAssigned(caseFileId: uuid): Promise<ITeamEntity[]> {
    const teams = await entityService.getTeamsAssigned(caseFileId);
    if (teams && teams.length) {
      baseComponents.setAll(teams);
      return teams;
    }
    return [];
  }

  async function createTeam(payload: ITeamEntity): Promise<ITeamEntity> {
    // error will be thrown to UI on purpose
    const res = await entityService.createTeam(payload);
    if (res) {
      baseComponents.addNewlyCreatedId(res);
      baseComponents.set(res);
    }
    return res;
  }

  async function editTeam(payload: ITeamEntity): Promise<ITeamEntity> {
    // error will be thrown to UI on purpose
    const res = await entityService.editTeam(payload);
    baseComponents.set(res);
    return res;
  }

    async function addTeamMembers(payload: { teamId: uuid, teamMembers: ITeamMember[] }): Promise<ITeamEntity> {
    try {
      const res = await entityService.addTeamMembers(payload.teamId, payload.teamMembers);
      baseComponents.set(res);
      return res;
    } catch (e) {
      applicationInsights.trackException(e, { payload }, 'module.teamEntity', 'addTeamMembers');
      return null;
    }
  }

    async function removeTeamMember(payload: { teamId: uuid, teamMemberId: uuid }): Promise<ITeamEntity> {
    // error will be thrown to UI on purpose
    const res = await entityService.removeTeamMember(payload.teamId, payload.teamMemberId);
      baseComponents.set(res);
      return res;
  }

    async function emptyTeam(payload: { teamId: uuid }): Promise<ITeamEntity> {
    // error will be thrown to UI on purpose
    const res = await entityService.emptyTeam(payload.teamId);
      baseComponents.set(res);
      return res;
  }

  return {
    getTeamsAssigned,
    getTeamsAssignable,
    createTeam,
    editTeam,
    addTeamMembers,
    removeTeamMember,
    emptyTeam,
  };
}
