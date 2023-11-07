import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { fixtureFinancialAssistanceTable } from '../../../fixtures/events';
import { prepareStateEventAndProgram } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { FinancialAssistancePage } from '../../../pages/financialAssistance/financialAssistance.page';

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

const { filteredCanRoles, filteredCannotRoles, allRoles } = getRoles(canRoles, cannotRoles);

describe('#TC324# - Add Financial Assistance Table to Event', { tags: ['@event', '@financial-assistance'] }, () => {
  before(() => {
    cy.getToken().then(async (accessToken) => {
      const { provider, event, team, mockCreateProgram } = await prepareStateEventAndProgram(accessToken.access_token, allRoles);
      cy.wrap(provider).as('provider');
      cy.wrap(event).as('eventCreated');
      cy.wrap(team).as('teamCreated');
      cy.wrap(mockCreateProgram).as('mockProgram');
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
        beforeEach(function () {
          cy.login(roleName);
          cy.goTo(`events/${this.eventCreated.id}/financial-assistance`);
        });
        // eslint-disable-next-line
        it('should successfully add Financial Assistance Table to Event', function () {
          const tableData = fixtureFinancialAssistanceTable(this.test.retries.length);

          const financialAssistancePage = new FinancialAssistancePage();
          financialAssistancePage.getCreateFATableButton().click();

          const createFinancialAssitanceTablePage = financialAssistancePage.createNewFATable();
          createFinancialAssitanceTablePage.getTableStatus().should('eq', 'INACTIVE');
          createFinancialAssitanceTablePage.fillTableName(tableData.name.translation.en);
          createFinancialAssitanceTablePage.selectProgram(this.mockProgram.name.translation.en);
          createFinancialAssitanceTablePage.toggleStatus();
          createFinancialAssitanceTablePage.getTableStatus().should('eq', 'ACTIVE');
          createFinancialAssitanceTablePage.addItem();
          createFinancialAssitanceTablePage.chooseItemType(tableData.itemType);
          createFinancialAssitanceTablePage.confirmAddItem();
          createFinancialAssitanceTablePage.getItemType().should('eq', tableData.itemType);
          createFinancialAssitanceTablePage.getItemEditButton().should('be.visible');
          createFinancialAssitanceTablePage.getItemDeleteButton().should('be.visible');
          createFinancialAssitanceTablePage.addSubItem();
          createFinancialAssitanceTablePage.fillSubItemData(tableData.subItem);
          createFinancialAssitanceTablePage.confirmSubItemAdd();
          createFinancialAssitanceTablePage.getSubItemCategory().should('eq', tableData.subItem.type);
          createFinancialAssitanceTablePage.getSubItemMaxAmount().should('eq', `$${tableData.subItem.maxAmount}`);
          createFinancialAssitanceTablePage.getSubItemFrequency().should('eq', tableData.subItem.frequency);
          createFinancialAssitanceTablePage.getSubItemAmountType().should('eq', 'Fixed');
          createFinancialAssitanceTablePage.getSubItemDocsRequired().should('eq', 'No');
          createFinancialAssitanceTablePage.getSubItemEditButton().should('be.visible');
          createFinancialAssitanceTablePage.getSubItemDeleteButton().should('be.visible');
          createFinancialAssitanceTablePage.selectFrenchTab();
          createFinancialAssitanceTablePage.fillFrenchTableName(tableData.name.translation.fr);
          createFinancialAssitanceTablePage.addFinancialAssistanceTable();

          cy.contains('The financial assistance table has been successfully created.').should('be.visible');
          financialAssistancePage.getTableNameByIndex(0).should('eq', tableData.name.translation.en);
          financialAssistancePage.getTableStatusByIndex(0).should('eq', 'Active');
          financialAssistancePage.getTableEditButtonByIndex(0).should('be.visible');
        });
      });
    }
  });

  describe('Cannot Roles', () => {
     for (const roleName of filteredCannotRoles) {
      describe(`${roleName}`, () => {
        beforeEach(function () {
          cy.login(roleName);
          cy.goTo(`events/${this.eventCreated.id}/financial-assistance`);
        });
        it('should not be able to add Financial Assistance Table to Event', () => {
          cy.contains('You do not have permission to access this page').should('be.visible');
        });
      });
    }
  });
});
