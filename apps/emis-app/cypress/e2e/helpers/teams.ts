import { UserRoles } from '@libs/cypress-lib/support/msal';
import { IEventEntity } from '@libs/entities-lib/event';
import {
  memberTestContributorIM,
  memberTestContributorFinance,
  memberTestContributor3,
  memberTestDev1,
  memberTestDev2,
  memberTestDev3,
  memberTestDev4,
  memberTestDev5, memberTestDevReadonly, mockTeams, memberTestDev6, memberTestDev0,
} from '@libs/cypress-lib/mocks/teams/team';
import { ITeamMember, TeamType } from '@libs/entities-lib/team';
import { IProvider } from '@/services/provider';
import { CypressTeamsService } from '@libs/cypress-lib/services/teams';

export const teamMemberId = {
  [UserRoles.level6]: memberTestDev6,
  [UserRoles.level5]: memberTestDev5,
  [UserRoles.level4]: memberTestDev4,
  [UserRoles.level3]: memberTestDev3,
  [UserRoles.level2]: memberTestDev2,
  [UserRoles.level1]: memberTestDev1,
  [UserRoles.level0]: memberTestDev0,
  [UserRoles.contributor1]: memberTestContributorIM,
  [UserRoles.contributor2]: memberTestContributorFinance,
  [UserRoles.contributor3]: memberTestContributor3,
  [UserRoles.readonly]: memberTestDevReadonly,
} as Record<UserRoles, string>;

export interface LinkEventToTeamParams {
  event: IEventEntity,
  provider: IProvider,
  roles: UserRoles[],
  teamType: TeamType,
  isAssignable?: boolean,
  isEscalation?: boolean,
}

export const linkEventToTeamForOneRole = async (params: LinkEventToTeamParams) => {
  const team = await params.provider.teams.createTeam(mockTeams({
    eventIds: [params.event.id],
    teamMembers: [{ id: teamMemberId[params.roles[0]], isPrimaryContact: true }],
    teamType: params.teamType,
    isAssignable: params.isAssignable,
    isEscalation: params.isEscalation,
  }));
  return team;
};

export const linkEventToTeamForManyRoles = async (params: LinkEventToTeamParams) => {
  const teamMembers = [] as ITeamMember[];

  params.roles.filter((r) => teamMemberId[r]).forEach((r, i) => {
    teamMembers.push({ id: teamMemberId[r], isPrimaryContact: i === 0 });
  });

  const team = await params.provider.teams.createTeam(mockTeams({
    eventIds: [params.event.id],
    teamMembers,
    teamType: params.teamType,
    isAssignable: params.isAssignable,
    isEscalation: params.isEscalation,
  }));
  return team;
};

export const removeTeamMembersFromTeam = async (teamId: string, provider: IProvider & { cypress: { teams: CypressTeamsService } }) => {
  try {
    await provider.cypress.teams.removeAllTeamMembers(teamId);
  } catch {
    // Ignore error
  }
};

// Removes specific team members passed through param
export const removeAddedTeamMembersFromTeam = async (teamId: string, provider: IProvider, roles: UserRoles[]) => {
  roles.filter((r) => teamMemberId[r]).forEach(async (r, i) => {
    // eslint-disable-next-line
    cy.wait(100).then(async () => {
      try {
        if (i < roles.length) {
          await provider.teams.removeTeamMember(teamId, teamMemberId[r]);
        }
      } catch {
        // Ignore error
      }
    });
  });
};
