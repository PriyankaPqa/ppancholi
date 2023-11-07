import { UserRoles } from '@libs/cypress-lib/support/msal';
import { IEventEntity } from '@libs/entities-lib/event';
import { AddFinancialAssistancePage } from 'cypress/pages/financial-assistance-payment/addFinancialAssistance.page';
import { ICaseFileEntity } from '@libs/entities-lib/case-file';
import { EFinancialAmountModes, IFinancialAssistanceTableEntity } from '@libs/entities-lib/financial-assistance';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { fixturePrepaidCardPaymentLine } from '../../../fixtures/financial-assistance';
import { createProgramWithTableWithItemAndSubItem, createEventAndTeam, prepareStateHousehold } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';

const canRoles = [
  UserRoles.level6,
  UserRoles.level5,
  UserRoles.level4,
  UserRoles.level3,
  UserRoles.level2,
  UserRoles.level1,
];

const cannotRoles = [
  UserRoles.level0,
  UserRoles.contributor1,
  UserRoles.contributor2,
  UserRoles.contributor3,
  UserRoles.readonly,
];

const { filteredCanRoles, filteredCannotRoles, allRoles } = getRoles(canRoles, cannotRoles);

let event = null as IEventEntity;
let accessTokenL6 = '';
let caseFileCreated = null as ICaseFileEntity;
let table = null as IFinancialAssistanceTableEntity;

describe('#TC210# -Create a Pre-paid Card Payment Line', { tags: ['@case-file', '@financial-assistance'] }, () => {
  before(() => {
    cy.getToken().then(async (tokenResponse) => {
      accessTokenL6 = tokenResponse.access_token;
      const resultPrepareStateEvent = await createEventAndTeam(accessTokenL6, allRoles);
      const { provider, team } = resultPrepareStateEvent;
      event = resultPrepareStateEvent.event;
      const resultCreateProgram = await createProgramWithTableWithItemAndSubItem(provider, event.id, EFinancialAmountModes.Fixed);
      table = resultCreateProgram.table;
      cy.wrap(provider).as('provider');
      cy.wrap(team).as('teamCreated');
      cy.wrap(table).as('faTable');
    });
  });

  after(function () {
    if (this.teamCreated?.id && this.provider) {
      removeTeamMembersFromTeam(this.teamCreated.id, this.provider);
    }
  });
  describe('Can Roles', () => {
    for (const roleName of filteredCanRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.then(async () => {
            const result = await prepareStateHousehold(accessTokenL6, event);
            caseFileCreated = result.registrationResponse.caseFile;
            cy.login(roleName);
            cy.goTo(`casefile/${caseFileCreated.id}/financialAssistance/create`);
          });
        });
        it('should successfully create a Prepaid Card Payment Line', function () {
          const paymentLineData = fixturePrepaidCardPaymentLine();

          const addFinancialAssistancePage = new AddFinancialAssistancePage();
          addFinancialAssistancePage.getAddPaymentLineButton().should('be.disabled');
          addFinancialAssistancePage.getCreateButton().should('not.be.enabled');
          addFinancialAssistancePage.selectTable(this.faTable.name.translation.en);
          addFinancialAssistancePage.fillDescription('Financial Description Payment');
          addFinancialAssistancePage.getAddPaymentLineButton().click();

          const addNewPaymentLinePage = addFinancialAssistancePage.addPaymentLine();
          addNewPaymentLinePage.fill(paymentLineData);
          addNewPaymentLinePage.getAmountValue().should('eq', paymentLineData.amount);
          addNewPaymentLinePage.getRelatedNumberField().should('be.visible');
          addNewPaymentLinePage.fillRelatedNumber(paymentLineData.relatedNumber);
          addNewPaymentLinePage.addNewPaymentLine();

          addFinancialAssistancePage.getPaymentLineGroupTitle().should('eq', 'Prepaid card');
          addFinancialAssistancePage.getItemEditButton().should('be.visible');
          addFinancialAssistancePage.getItemDeleteButton().should('be.visible');
          addFinancialAssistancePage.getAddPaymentLineButton().should('be.enabled');
          addFinancialAssistancePage.getSubmitAssistanceButton().should('not.be.enabled');
          addFinancialAssistancePage.getCreateButton().click();

          cy.contains('The financial assistance has been successfully created').should('be.visible');
          addFinancialAssistancePage.getPaymentStatus().should('eq', 'New');
          addFinancialAssistancePage.getPaymentEditButton().should('be.visible');
          addFinancialAssistancePage.getPaymentDeleteButton().should('be.visible');
          addFinancialAssistancePage.getPaymentLineItemTitle().should('eq', `${paymentLineData.item} > ${paymentLineData.subItem}`);
          addFinancialAssistancePage.getRelatedNumber().should('string', paymentLineData.relatedNumber);
          addFinancialAssistancePage.getAddPaymentLineButton().should('be.enabled');
          addFinancialAssistancePage.getSubmitAssistanceButton().should('be.enabled');
          addFinancialAssistancePage.getBackToFinancialAssistanceButton().should('be.enabled');
        });
      });
    }
  });
  describe('Cannot Roles', () => {
    for (const roleName of filteredCannotRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.then(async () => {
            const result = await prepareStateHousehold(accessTokenL6, event);
            caseFileCreated = result.registrationResponse.caseFile;
            cy.login(roleName);
            cy.goTo(`casefile/${caseFileCreated.id}/financialAssistance/create`);
          });
        });
        it('should not be able to create a Prepaid Card Payment Line', () => {
          const addFinancialAssistancePage = new AddFinancialAssistancePage();

          cy.contains('You do not have permission to access this page').should('be.visible');
          addFinancialAssistancePage.getTableSelectField().should('not.exist');
        });
      });
    }
  });
});
