import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { EFinancialAmountModes } from '@libs/entities-lib/financial-assistance';
import { EPaymentModalities } from '@libs/entities-lib/program';
import { FinancialAssistanceHomePage } from '../../../pages/financial-assistance-payment/financialAssistanceHome.page';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import {
  createProgramWithTableWithItemAndSubItem,
  createEventAndTeam,
  prepareStateHousehold,
  addFinancialAssistancePayment,
  AddFinancialAssistancePaymentParams,
} from '../../helpers/prepareState';
import { SubmitPaymentTypeCanStepsParams, submitPaymentTypeCanSteps } from '../../steps/submitPaymentTypeCanSteps';

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

describe('[T28391] Submit a Invoice Payment', { tags: ['@financial-assistance'] }, () => {
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

            const addFinancialAssistancePaymentParamData: AddFinancialAssistancePaymentParams = {
              provider: resultPrepareStateHousehold.provider,
              modality: EPaymentModalities.Invoice,
              caseFileId: resultPrepareStateHousehold.registrationResponse.caseFile.id,
              financialAssistanceTableId: this.table.id,
            };
            const financialAssistancePayment = await addFinancialAssistancePayment(addFinancialAssistancePaymentParamData);
            cy.wrap(financialAssistancePayment).as('financialAssistancePayment');
            cy.login(roleName);
            cy.goTo(`casefile/${resultPrepareStateHousehold.registrationResponse.caseFile.id}/financialAssistance`);
          });
        });
        it('should successfully submit a Invoice Payment', function () {
          const canStepsParamData: Partial<SubmitPaymentTypeCanStepsParams> = {
            financialAssistancePayment: this.financialAssistancePayment,
            paymentType: 'Invoice',
            roleName,
            paymentGroupStatus: 'Issued',
          };
          submitPaymentTypeCanSteps(canStepsParamData);
        });
      });
    }
  });
  describe('Cannot roles', () => {
    before(() => {
      cy.then(async function () {
        const resultPrepareStateHousehold = await prepareStateHousehold(accessTokenL6, this.event);

        const addFinancialAssistancePaymentParamData: AddFinancialAssistancePaymentParams = {
          provider: resultPrepareStateHousehold.provider,
          modality: EPaymentModalities.Invoice,
          caseFileId: resultPrepareStateHousehold.registrationResponse.caseFile.id,
          financialAssistanceTableId: this.table.id,
        };
        const financialAssistancePayment = await addFinancialAssistancePayment(addFinancialAssistancePaymentParamData);
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
        it('should not be able to submit a Invoice Payment', function () {
          const financialAssistanceHomePage = new FinancialAssistanceHomePage();

          const financialAssistanceDetailsPage = financialAssistanceHomePage.getFAPaymentById(this.financialAssistancePaymentId);
          financialAssistanceDetailsPage.getBackToFinancialAssistanceButton().should('be.enabled');
          financialAssistanceDetailsPage.getSubmitAssistanceButton().should('not.exist');
        });
      });
    }
  });
});
