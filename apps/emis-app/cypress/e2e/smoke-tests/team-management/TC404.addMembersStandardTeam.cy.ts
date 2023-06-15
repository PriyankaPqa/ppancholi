import { UserRoles } from '@libs/cypress-lib/support/msal';
import { createEventAndTeam } from '../../helpers/prepareState';
import { removeAddedTeamMembersFromTeam, removeTeamMembersFromTeam, teamMemberId } from '../../helpers/teams';
import { TeamDetailsPage } from '../../../pages/teams/teamDetails.page';
import { TeamsHomePage } from '../../../pages/teams/teamsHome.page';

const canRoles = {
  Level6: UserRoles.level6,
  Level5: UserRoles.level5,
  Level4: UserRoles.level4,
};

const partialRole = {
  Level3: UserRoles.level3,
};

const cannotRoles = {
  Level2: UserRoles.level2,
  Level1: UserRoles.level1,
  Level0: UserRoles.level0,
  Contributor1: UserRoles.contributor1,
  Contributor2: UserRoles.contributor2,
  Contributor3: UserRoles.contributor3,
  ReadOnly: UserRoles.readonly,
};

const canRolesValues = [...Object.values(canRoles)] as UserRoles[];
const addedRolesValues = [UserRoles.level1, UserRoles.level2];

describe('#TC404# - Add Members To Standard Team', { tags: ['@case-file', '@teams'] }, () => {
  before(() => {
    cy.getToken().then(async (accessToken) => {
      const { provider, event, team } = await createEventAndTeam(accessToken.access_token, canRolesValues);
      cy.wrap(provider).as('provider');
      cy.wrap(event).as('eventCreated');
      cy.wrap(team).as('teamCreated');
    });
  });

  after(function () {
    if (this.provider && this.teamCreated?.id) {
      removeTeamMembersFromTeam(this.teamCreated.id, this.provider, canRolesValues);
    }
  });

  describe('Can Roles', () => {
    for (const [roleName, roleValue] of Object.entries(canRoles)) {
      describe(`${roleName}`, () => {
        beforeEach(function () {
          cy.login(roleValue);
          cy.goTo(`teams/${this.teamCreated.id}`);
        });
        afterEach(function () {
          // removes the added team member ie Level1 and Level2 to ensure state is prepared for next test run.
          if (this.provider && this.teamCreated?.id) {
            removeAddedTeamMembersFromTeam(this.teamCreated.id, this.provider, addedRolesValues);
          }
        });
        it('should successfully add members to standard team', () => {
          const teamDetailsPage = new TeamDetailsPage();

          const editTeamPage = teamDetailsPage.editTeam();

          const addNewTeamMemberPage = editTeamPage.addNewMember();
          addNewTeamMemberPage.cancelButton().should('be.enabled');
          addNewTeamMemberPage.addButton().should('be.disabled');
          addNewTeamMemberPage.memberSearch('Test');
          addNewTeamMemberPage.getRoleNames().should('be.visible');
          addNewTeamMemberPage.getMemberNames().should('be.visible');
          cy.contains('Member name').should('be.visible');
          cy.contains('Email').should('be.visible');
          cy.contains('Role').should('be.visible');
          cy.contains('Status').should('be.visible');
          addNewTeamMemberPage.selectMember(teamMemberId[UserRoles.level1]);
          addNewTeamMemberPage.selectMember(teamMemberId[UserRoles.level2]);
          addNewTeamMemberPage.addButton().should('be.enabled');
          addNewTeamMemberPage.addButton().click();

          cy.contains('Members added successfully').should('be.visible');
          editTeamPage.getTeamMemberName().contains('TestDev1').should('be.visible');
          editTeamPage.getTeamMemberName().contains('testdev2').should('be.visible');
        });
      });
    }
  });

  describe('Partial Role', () => {
    for (const [roleName, roleValue] of Object.entries(partialRole)) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.login(roleValue);
          cy.goTo('teams');
        });
        it('should not be able to add members to standard team but have access till TeamDetails Page', () => {
          const teamsHomePage = new TeamsHomePage();

          const teamDetailsPage = teamsHomePage.goToFirstTeamDetails();
          teamDetailsPage.getEditTeamButton().should('not.exist');
        });
      });
    }
  });

  describe('Cannot Roles', () => {
    for (const [roleName, roleValue] of Object.entries(cannotRoles)) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.login(roleValue);
          cy.goTo('teams');
        });
        it('should not be able to add members to standard team and have no access to Teams Home Page', () => {
          cy.contains('You do not have permission to access this page').should('be.visible');
        });
      });
    }
  });
});
