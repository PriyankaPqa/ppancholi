import { UserRoles } from '@libs/cypress-lib/support/msal';
import { mockProgram } from '@libs/cypress-lib/mocks/programs/program';
import { faker } from '@faker-js/faker';
import { getToastMessage } from '@libs/cypress-lib/helpers/misc';
import { useProvider } from '../../../provider/provider';
import { createEventWithTeamWithUsers } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { IFinancialAssistanceTableData } from '../../../pages/financialAssistance/createFinancialAssistanceTable.page';
import { FinancialAssistancePage } from '../../../pages/financialAssistance/financialAssistance.page';

const tableData: IFinancialAssistanceTableData = {
  name: {
    translation: {
      en: `table-${faker.datatype.number(1000)}`,
      fr: `table-fr-${faker.datatype.number(1000)}`,
    },
  },
  itemType: 'Clothing',
  subItem: {
    type: 'Winter Clothing',
    maxAmount: '80',
    frequency: 'Multiple',
  },
};

const canRoles = {
  Level6: UserRoles.level6,
};

const cannotRoles = {
  Level5: UserRoles.level5,
  Level4: UserRoles.level4,
  Level3: UserRoles.level3,
  Level2: UserRoles.level2,
  Level1: UserRoles.level1,
  Contributor1: UserRoles.contributor1,
  Contributor2: UserRoles.contributor2,
  Contributor3: UserRoles.contributor3,
  ReadOnly: UserRoles.readonly,
};

const allRolesValues = [...Object.values(canRoles), ...Object.values(cannotRoles)] as UserRoles[];

const prepareState = () => cy.getToken().then(async (accessToken) => {
  const provider = useProvider(accessToken.access_token);
  const { event, team } = await createEventWithTeamWithUsers(provider, allRolesValues);
  const mockCreateProgram = mockProgram({ eventId: event.id });
  cy.wrap(mockCreateProgram).as('program');
  await provider.programs.createProgram(mockCreateProgram);
  cy.wrap(event).as('eventCreated');
  cy.wrap(team).as('teamCreated');
  cy.wrap(provider).as('provider');
});

const title = '#TC324# - Add Financial Assistance Table to Event';
describe(`${title}`, () => {
  before(() => {
    prepareState();
  });

  after(function () {
    if (this.provider && this.teamCreated?.id) {
      removeTeamMembersFromTeam(this.teamCreated.id, this.provider, allRolesValues);
    }
  });

  describe('Can Roles', () => {
    for (const [roleName, roleValue] of Object.entries(canRoles)) {
      describe(`${roleName}`, () => {
        before(() => {
          cy.login(roleValue);
        });
        // eslint-disable-next-line
        it('should successfully add Financial Assistance Table to Event', function () {
          cy.goTo(`events/${this.eventCreated.id}/financial-assistance`);
          const programName = this.program.name.translation.en;

          const financialAssistancePage = new FinancialAssistancePage();
          financialAssistancePage.getCreateFATableButton().click();

          const createFinancialAssitanceTablePage = financialAssistancePage.createNewFATable();
          createFinancialAssitanceTablePage.getTableStatus().should('eq', 'INACTIVE');
          createFinancialAssitanceTablePage.fillTableName(tableData.name.translation.en);
          createFinancialAssitanceTablePage.selectProgram(programName);
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

          getToastMessage('The financial assistance table has been successfully created.').should('be.visible');
          financialAssistancePage.getTableName().should('eq', tableData.name.translation.en);
          financialAssistancePage.getTableStatus().should('eq', 'Active');
          financialAssistancePage.getTableEditButton().should('be.visible');
        });
      });
    }
  });

  describe('Cannot Roles', () => {
    for (const [roleName, roleValue] of Object.entries(cannotRoles)) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.login(roleValue);
        });
        it('should not be able to add Financial Assistance Table to Event', function () {
          cy.goTo(`events/${this.eventCreated.id}/financial-assistance`);

          getToastMessage('You do not have permission to access this page').should('be.visible');
        });
      });
    }
  });
});
