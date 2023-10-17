import { UserRoles } from '@libs/cypress-lib/support/msal';
import { IEventEntity } from '@libs/entities-lib/event';
import { ICaseFileEntity } from '@libs/entities-lib/case-file';
import { EFinancialAmountModes, IFinancialAssistanceTableEntity } from '@libs/entities-lib/financial-assistance';
import { FinancialAssistanceHomePage } from 'cypress/pages/financial-assistance-payment/financialAssistanceHome.page';
import { EPaymentModalities } from '@libs/entities-lib/program';
import { IFinancialAssistancePaymentEntity } from '@libs/entities-lib/financial-assistance-payment';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { createProgramWithTableWithItemAndSubItem, createEventAndTeam, prepareStateHousehold, addFinancialAssistancePayment } from '../../helpers/prepareState';
import { submitPaymentTypeCanSteps } from '../../steps/submitPaymentTypeCanSteps';

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

let event = null as IEventEntity;
let caseFile = null as ICaseFileEntity;
let accessTokenL6 = '';
let table = null as IFinancialAssistanceTableEntity;
let financialAssistancePayment = null as IFinancialAssistancePaymentEntity;

describe('#TC303# - Submit a Pre-paid Card Payment', { tags: ['@case-file', '@financial-assistance'] }, () => {
  before(() => {
    cy.getToken().then(async (tokenResponse) => {
      accessTokenL6 = tokenResponse.access_token;
      const resultPrepareStateEvent = await createEventAndTeam(accessTokenL6, allRolesValues);
      event = resultPrepareStateEvent.event;
      const { provider, team } = resultPrepareStateEvent;
      const resultCreateProgram = await createProgramWithTableWithItemAndSubItem(provider, event.id, EFinancialAmountModes.Fixed);
      table = resultCreateProgram.table;
      cy.wrap(provider).as('provider');
      cy.wrap(team).as('teamCreated');
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
          cy.then(async () => {
            const resultPrepareStateHousehold = await prepareStateHousehold(accessTokenL6, event);
            caseFile = resultPrepareStateHousehold.registrationResponse.caseFile;
            const provider = resultPrepareStateHousehold.provider;
            financialAssistancePayment = await addFinancialAssistancePayment(provider, EPaymentModalities.PrepaidCard, caseFile.id, table.id);
            cy.wrap(financialAssistancePayment).as('financialAssistancePayment');
            cy.login(roleValue);
            cy.goTo(`casefile/${caseFile.id}/financialAssistance`);
          });
        });
        it('should successfully create a Prepaid Card Payment Line', function () {
          submitPaymentTypeCanSteps({
            financialAssistancePayment: this.financialAssistancePayment,
            paymentType: 'Prepaid card',
            roleName,
            paymentGroupStatus: 'New',
          });
        });
      });
    }
  });

  describe('Cannot roles', () => {
    before(() => {
      cy.then(async () => {
        const resultPrepareStateHousehold = await prepareStateHousehold(accessTokenL6, event);
        caseFile = resultPrepareStateHousehold.registrationResponse.caseFile;
        const provider = resultPrepareStateHousehold.provider;
        financialAssistancePayment = await addFinancialAssistancePayment(provider, EPaymentModalities.PrepaidCard, caseFile.id, table.id);
      });
    });
    for (const [roleName, roleValue] of Object.entries(cannotRoles)) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.login(roleValue);
          cy.goTo(`casefile/${caseFile.id}/financialAssistance`);
        });
        it('should not be able to create a Prepaid Card Payment Line', () => {
          const financialAssistanceHomePage = new FinancialAssistanceHomePage();

          const financialAssistanceDetailsPage = financialAssistanceHomePage.getFAPaymentById(financialAssistancePayment.id);
          financialAssistanceDetailsPage.getBackToFinancialAssistanceButton().should('be.enabled');
          financialAssistanceDetailsPage.getSubmitAssistanceButton().should('not.exist');
        });
      });
    }
  });
});
