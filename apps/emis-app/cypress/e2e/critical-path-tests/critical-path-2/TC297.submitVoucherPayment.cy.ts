import { UserRoles } from '@libs/cypress-lib/support/msal';
import { EFinancialAmountModes } from '@libs/entities-lib/financial-assistance';
import { FinancialAssistanceHomePage } from 'cypress/pages/financial-assistance-payment/financialAssistanceHome.page';
import { EPaymentModalities } from '@libs/entities-lib/program';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { createProgramWithTableWithItemAndSubItem, createEventAndTeam, prepareStateHousehold, addFinancialAssistancePayment } from '../../helpers/prepareState';
import { submitPaymentTypeCanSteps } from './canSteps';

const canRoles = {
  Level6: UserRoles.level6,
  Level5: UserRoles.level5,
  Level4: UserRoles.level4,
  Level3: UserRoles.level3,
  Level2: UserRoles.level2,
  Level1: UserRoles.level1,
};

const cannotRoles = {
  Level0: UserRoles.level0,
  Contributor1: UserRoles.contributor1,
  Contributor2: UserRoles.contributor2,
  Contributor3: UserRoles.contributor3,
  ReadOnly: UserRoles.readonly,
};

const allRolesValues = [...Object.values(canRoles), ...Object.values(cannotRoles)];

let accessTokenL6 = '';

describe('#TC297# - Submit a Voucher Payment', { tags: ['@financial-assistance'] }, () => {
  before(() => {
    cy.getToken().then(async (tokenResponse) => {
      accessTokenL6 = tokenResponse.access_token;
      const resultPrepareStateEvent = await createEventAndTeam(accessTokenL6, allRolesValues);
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
    for (const [roleName, roleValue] of Object.entries(canRoles)) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.then(async function () {
            const resultPrepareStateHousehold = await prepareStateHousehold(accessTokenL6, this.event);
            // eslint-disable-next-line
            const financialAssistancePayment = await addFinancialAssistancePayment(resultPrepareStateHousehold.provider, EPaymentModalities.Voucher, resultPrepareStateHousehold.registrationResponse.caseFile.id, this.table.id);
            cy.wrap(financialAssistancePayment).as('financialAssistancePayment');
            cy.login(roleValue);
            cy.goTo(`casefile/${resultPrepareStateHousehold.registrationResponse.caseFile.id}/financialAssistance`);
          });
        });
        it('should successfully submit a Voucher Payment', function () {
          submitPaymentTypeCanSteps({
            financialAssistancePayment: this.financialAssistancePayment,
            paymentType: 'Voucher',
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
        const financialAssistancePayment = await addFinancialAssistancePayment(resultPrepareStateHousehold.provider, EPaymentModalities.Voucher, resultPrepareStateHousehold.registrationResponse.caseFile.id, this.table.id);
        cy.wrap(resultPrepareStateHousehold.registrationResponse.caseFile.id).as('caseFileId');
        cy.wrap(resultPrepareStateHousehold.provider).as('provider');
        cy.wrap(financialAssistancePayment.id).as('financialAssistancePaymentId');
      });
    });
    for (const [roleName, roleValue] of Object.entries(cannotRoles)) {
      describe(`${roleName}`, () => {
        beforeEach(function () {
          cy.login(roleValue);
          cy.goTo(`casefile/${this.caseFileId}/financialAssistance`);
        });
        it('should not be able to submit a Voucher Payment', function () {
          const financialAssistanceHomePage = new FinancialAssistanceHomePage();

          const financialAssistanceDetailsPage = financialAssistanceHomePage.getFAPaymentById(this.financialAssistancePaymentId);
          financialAssistanceDetailsPage.getBackToFinancialAssistanceButton().should('be.enabled');
          financialAssistanceDetailsPage.getSubmitAssistanceButton().should('not.exist');
        });
      });
    }
  });
});
