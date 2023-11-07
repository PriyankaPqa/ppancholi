import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { EFinancialAmountModes } from '@libs/entities-lib/financial-assistance';
import { EPaymentModalities } from '@libs/entities-lib/program';
import { FinancialAssistanceHomePage } from '../../../pages/financial-assistance-payment/financialAssistanceHome.page';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { createProgramWithTableWithItemAndSubItem, createEventAndTeam, prepareStateHousehold, addFinancialAssistancePayment } from '../../helpers/prepareState';
import { submitPaymentTypeCanSteps } from '../../steps/submitPaymentTypeCanSteps';

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

let accessTokenL6 = '';

describe('#TC299# - Submit a Gift Card Payment', { tags: ['@financial-assistance'] }, () => {
  before(() => {
    cy.getToken().then(async (tokenResponse) => {
      accessTokenL6 = tokenResponse.access_token;
      const resultPrepareStateEvent = await createEventAndTeam(accessTokenL6, allRoles);
      const resultCreateProgram = await createProgramWithTableWithItemAndSubItem(resultPrepareStateEvent.provider, resultPrepareStateEvent.event.id, EFinancialAmountModes.Fixed);
      cy.wrap(resultPrepareStateEvent.provider).as('provider');
      cy.wrap(resultPrepareStateEvent.team).as('teamCreated');
      cy.wrap(resultPrepareStateEvent.event).as('event');
      cy.wrap(resultCreateProgram.table).as('table');
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
          cy.then(async function () {
            const resultPrepareStateHousehold = await prepareStateHousehold(accessTokenL6, this.event);
            // eslint-disable-next-line
            const financialAssistancePayment = await addFinancialAssistancePayment(resultPrepareStateHousehold.provider, EPaymentModalities.GiftCard, resultPrepareStateHousehold.registrationResponse.caseFile.id, this.table.id);
            cy.wrap(financialAssistancePayment).as('financialAssistancePayment');
            cy.login(roleName);
            cy.goTo(`casefile/${resultPrepareStateHousehold.registrationResponse.caseFile.id}/financialAssistance`);
          });
        });
        it('should successfully submit a Gift Card Payment', function () {
          submitPaymentTypeCanSteps({
            financialAssistancePayment: this.financialAssistancePayment,
            paymentType: 'Gift card',
            roleName,
            paymentGroupStatus: 'Issued',
          });
        });
      });
    }
  });
  describe('Cannot roles', () => {
    before(() => {
      cy.then(async function () {
        const resultPrepareStateHousehold = await prepareStateHousehold(accessTokenL6, this.event);
        // eslint-disable-next-line
        const financialAssistancePayment = await addFinancialAssistancePayment(resultPrepareStateHousehold.provider, EPaymentModalities.GiftCard, resultPrepareStateHousehold.registrationResponse.caseFile.id, this.table.id);
        cy.wrap(resultPrepareStateHousehold.registrationResponse.caseFile.id).as('caseFileId');
        cy.wrap(resultPrepareStateHousehold.provider).as('provider');
        cy.wrap(financialAssistancePayment.id).as('financialAssistancePaymentId');
      });
    });
     for (const roleName of filteredCannotRoles) {
      describe(`${roleName}`, () => {
        beforeEach(function () {
          cy.login(roleName);
          cy.goTo(`casefile/${this.caseFileId}/financialAssistance`);
        });
        it('should not be able to submit a Gift Card Payment', function () {
          const financialAssistanceHomePage = new FinancialAssistanceHomePage();

          const financialAssistanceDetailsPage = financialAssistanceHomePage.getFAPaymentById(this.financialAssistancePaymentId);
          financialAssistanceDetailsPage.getBackToFinancialAssistanceButton().should('be.enabled');
          financialAssistanceDetailsPage.getSubmitAssistanceButton().should('not.exist');
        });
      });
    }
  });
});
