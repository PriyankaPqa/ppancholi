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

export const linkEventToTeamForOneRole = async (event: IEventEntity, provider: IProvider, roleValue: UserRoles, teamType = TeamType.Standard) => {
  const team = await provider.teams.createTeam(mockTeams({
    eventIds: [event.id],
    teamMembers: [{ id: teamMemberId[roleValue], isPrimaryContact: true }],
    teamType,
  }));
  return team;
};

export const linkEventToTeamForManyRoles = async (event: IEventEntity, provider: IProvider, roles: UserRoles[], teamType = TeamType.Standard) => {
  const teamMembers = [] as ITeamMember[];

  roles.filter((r) => teamMemberId[r]).forEach((r, i) => {
    teamMembers.push({ id: teamMemberId[r], isPrimaryContact: i === roles.length - 1 });
  });

  const team = await provider.teams.createTeam(mockTeams({
    eventIds: [event.id],
    teamMembers,
    teamType,
  }));

  return team;
};

export const removeTeamMembersFromTeam = async (teamId: string, provider: IProvider, roles: UserRoles[]) => {
  roles.filter((r) => teamMemberId[r]).forEach((r, i) => {
    cy.wait(100 * i).then(async () => {
      try {
        if (i < roles.length - 1) {
          await provider.teams.removeTeamMember(teamId, teamMemberId[r]);
        } else {
          await provider.teams.emptyTeam(teamId);
        }
      } catch {
        // Ignore errors
      }
    });
  });
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
