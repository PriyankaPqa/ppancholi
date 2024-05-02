import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { fixtureApprovalTable } from 'cypress/fixtures/events';
import { CreateApprovalTablePage } from '../../../pages/approvals/createApprovalTable.page';
import { useProvider } from '../../../provider/provider';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { createEventAndTeam, createProgram } from '../../helpers/prepareState';

const canRoles = [
  UserRoles.level6,
];

const cannotRoles = [
  UserRoles.level5,
  UserRoles.level4,
  UserRoles.level3,
  UserRoles.level2,
  UserRoles.level1,
  UserRoles.level0,
  UserRoles.contributor1,
  UserRoles.contributor2,
  UserRoles.contributor3,
  UserRoles.readonly,
];

let accessTokenL6 = '';
let eventId = '';

const { filteredCanRoles, filteredCannotRoles, allRoles } = getRoles(canRoles, cannotRoles);

describe('#TC1652# - Create a Approval table', { tags: ['@event', '@approval', '@financial-assistance'] }, () => {
  before(() => {
    cy.getToken().then(async (tokenResponse) => {
      accessTokenL6 = tokenResponse.access_token;
      const result = await createEventAndTeam(accessTokenL6, allRoles);
      eventId = result.event.id;
      const { provider, team } = result;
      cy.wrap(provider).as('provider');
      cy.wrap(team).as('teamCreated');
    });
  });
  after(function () {
    if (this.provider && this.teamCreated?.id) {
      removeTeamMembersFromTeam(this.teamCreated.id, this.provider);
    }
  });
  describe('Can Roles', () => {
    for (const roleName of filteredCanRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.then(async () => {
            const provider = useProvider(accessTokenL6);
            const { mockCreateProgram } = await createProgram(provider, eventId);
            cy.wrap(mockCreateProgram).as('mockProgram');
            cy.login(roleName);
            cy.goTo(`events/${eventId}/approvals/create`);
          });
        });
        // eslint-disable-next-line
        it('should successfully create an approval table', function () {
          const approvalTableData = fixtureApprovalTable(this.test.retries.length);

          const createApprovalTablePage = new CreateApprovalTablePage();
          createApprovalTablePage.selectProgram(this.mockProgram.name.translation.en);
          createApprovalTablePage.fillTableName(approvalTableData.tableName);
          createApprovalTablePage.getApprovalTableStatus().should('eq', approvalTableData.statusIndicator);
          createApprovalTablePage.selectApprovalAggregatedBy();
          createApprovalTablePage.addApprovalGroup();
          createApprovalTablePage.getApprovalGroupTable().contains('Group 1').should('be.visible');
          createApprovalTablePage.getUserRoleField().shouldBeRequired('Roles*');// verifies mandatory fields
          createApprovalTablePage.getMinimumValueLabel().shouldBeRequired('$ Minimum*');
          createApprovalTablePage.getMaximumValueLabel().shouldBeRequired('$ Maximum*');
          createApprovalTablePage.selectUserRole(approvalTableData.userRole);
          createApprovalTablePage.getMinimumValueField().type(approvalTableData.minimumAmount);
          createApprovalTablePage.getMaximumValueField().type(approvalTableData.maximumAmount);
          createApprovalTablePage.saveApprovalGroup();
          createApprovalTablePage.getCreateApprovalTableButton().should('be.visible');
          createApprovalTablePage.getApprovalGroupTable().contains('Group 1').should('be.visible');
          createApprovalTablePage.getApprovalGroupTable().contains(approvalTableData.userRole).should('be.visible');
          createApprovalTablePage.getApprovalGroupTable().contains(`$${approvalTableData.minimumAmount}`).should('be.visible');
          createApprovalTablePage.getApprovalGroupTable().contains(`$${approvalTableData.maximumAmount}`).should('be.visible');
          createApprovalTablePage.getEditApprovalGroupButton().should('be.visible');
          createApprovalTablePage.getDeleteApprovalGroupButton().should('be.visible');

          const approvalTableHomePage = createApprovalTablePage.createApprovalTable();
          approvalTableHomePage.waitAndRefreshUntilApprovalTableVisible(approvalTableData.tableName);

          const approvalTableDetailsPage = approvalTableHomePage.getApprovalTableDetails();
          approvalTableDetailsPage.getProgramName().should('string', this.mockProgram.name.translation.en);
          approvalTableDetailsPage.getApprovalTableName().should('eq', approvalTableData.tableName);
          cy.contains('Approval aggregated by').should('be.visible');
          cy.contains('Total financial assistance on case file').should('be.visible');
          approvalTableDetailsPage.getApprovalStatus().should('eq', 'Active');
          approvalTableDetailsPage.getApprovalEditButton().should('be.visible');
          approvalTableDetailsPage.getApprovalGroupDetails().contains('Group 1').should('be.visible');
          approvalTableDetailsPage.getApprovalGroupDetails().contains(approvalTableData.userRole).should('be.visible');
          approvalTableDetailsPage.getApprovalGroupDetails().contains(`$${approvalTableData.minimumAmount}`).should('be.visible');
          approvalTableDetailsPage.getApprovalGroupDetails().contains(`$${approvalTableData.maximumAmount}`).should('be.visible');
        });
      });
    }
  });
  describe('Cannot Roles', () => {
     for (const roleName of filteredCannotRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.login(roleName);
          cy.goTo(`events/${eventId}/approvals/create`);
        });
        it('should not be able to create an approval table', () => {
          cy.contains('You do not have permission to access this page').should('be.visible');
        });
      });
    }
  });
});
