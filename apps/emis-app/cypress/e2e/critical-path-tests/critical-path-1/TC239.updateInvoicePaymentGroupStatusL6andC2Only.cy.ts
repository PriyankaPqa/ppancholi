import { UserRoles } from '@libs/cypress-lib/support/msal';
import { ICaseFileEntity } from '@libs/entities-lib/case-file';
import { EFinancialAmountModes } from '@libs/entities-lib/financial-assistance';
import { EPaymentModalities } from '@libs/entities-lib/program';
import { IFinancialAssistancePaymentEntity, PaymentStatus } from '@libs/entities-lib/financial-assistance-payment';
import { FinancialAssistanceHomePage } from 'cypress/pages/financial-assistance-payment/financialAssistanceHome.page';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import {
  prepareStateHousehold,
  addFinancialAssistancePayment,
  submitFinancialAssistancePayment,
  updateFinancialAssistancePayment,
  prepareStateEventTeamProgramTableWithItemSubItem,
} from '../../helpers/prepareState';

const canRoles = {
  Level6: UserRoles.level6,
  Contributor2: UserRoles.contributor2,
};

const cannotRoles = {
  Level5: UserRoles.level5,
  Level4: UserRoles.level4,
  Level3: UserRoles.level3,
  Level2: UserRoles.level2,
  Level1: UserRoles.level1,
  Level0: UserRoles.level0,
  Contributor1: UserRoles.contributor1,
  Contributor3: UserRoles.contributor3,
  ReadOnly: UserRoles.readonly,
};

const allRolesValues = [...Object.values(canRoles), ...Object.values(cannotRoles)];

let caseFile = null as ICaseFileEntity;
let accessTokenL6 = '';
let submittedFinancialAssistancePayment = null as IFinancialAssistancePaymentEntity;

describe('#TC239# - Update Invoice payment group Status- L6 and C2 only', { tags: ['@financial-assistance'] }, () => {
  before(() => {
    cy.getToken().then(async (tokenResponse) => {
      accessTokenL6 = tokenResponse.access_token;
      const resultPrepareStateEventTeamProgramTable = await prepareStateEventTeamProgramTableWithItemSubItem(accessTokenL6, allRolesValues, EFinancialAmountModes.Fixed);
      cy.wrap(resultPrepareStateEventTeamProgramTable.event).as('event');
      cy.wrap(resultPrepareStateEventTeamProgramTable.table).as('table');
      cy.wrap(resultPrepareStateEventTeamProgramTable.provider).as('provider');
      cy.wrap(resultPrepareStateEventTeamProgramTable.team).as('teamCreated');
    });
  });

  after(function () {
    if (this.teamCreated?.id && this.provider) {
      removeTeamMembersFromTeam(this.teamCreated.id, this.provider, allRolesValues);
    }
  });
  describe('Can Roles', () => {
    for (const [roleName, roleValue] of Object.entries(canRoles)) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.then(async function () {
            const resultPrepareStateHousehold = await prepareStateHousehold(accessTokenL6, this.event);
            caseFile = resultPrepareStateHousehold.registrationResponse.caseFile;
            const provider = resultPrepareStateHousehold.provider;
            const createdFinancialAssistancePayment = await addFinancialAssistancePayment(provider, EPaymentModalities.Invoice, caseFile.id, this.table.id);
            submittedFinancialAssistancePayment = await submitFinancialAssistancePayment(provider, createdFinancialAssistancePayment.id);
            await updateFinancialAssistancePayment(provider, submittedFinancialAssistancePayment.id, submittedFinancialAssistancePayment.groups[0].id, PaymentStatus.Cancelled);
            cy.login(roleValue);
            cy.goTo(`casefile/${caseFile.id}/financialAssistance`);
          });
        });
        it('should successfully update Invoice Payment Group Status', () => {
          const financialAssistanceHomePage = new FinancialAssistanceHomePage();
          financialAssistanceHomePage.getApprovalStatus().should('eq', 'Approved');

          const financialAssistanceDetailsPage = financialAssistanceHomePage.getFAPaymentById(submittedFinancialAssistancePayment.id);
          financialAssistanceDetailsPage.getPaymentLineStatus().should('eq', 'Cancelled');

          // update status: Cancelled -> Completed
          financialAssistanceDetailsPage.selectPaymentLineStatusCompleted();
          cy.contains('Payment status successfully updated.').should('be.visible');
          financialAssistanceDetailsPage.getPaymentLineStatusElement().contains('Completed').should('be.visible');
          financialAssistanceDetailsPage.getPaymentLineItemAmountField().should('have.attr', 'class').and('not.have.string', 'line-through');
          financialAssistanceDetailsPage.getPaymentGroupListField().contains('Payment total: $80.00').should('be.visible');

          // update status: Completed -> Cancelled
          financialAssistanceDetailsPage.selectPaymentLineStatusCancelled();
          cy.contains('Are you sure you want to cancel all invoice payment lines?').should('be.visible');
          financialAssistanceDetailsPage.getDialogSubmitConfirmCancellationButton().should('be.enabled');
          financialAssistanceDetailsPage.getDialogCancelConfirmCancellationButton().should('be.enabled');
          financialAssistanceDetailsPage.getDialogSubmitConfirmCancellationButton().click();
          cy.contains('Payment status successfully updated.').should('be.visible');
          financialAssistanceDetailsPage.getPaymentLineStatusElement().contains('Cancelled').should('be.visible');
          financialAssistanceDetailsPage.getPaymentLineItemAmountField().should('have.attr', 'class').and('contains', 'line-through');
          financialAssistanceDetailsPage.getPaymentGroupListField().contains('Payment total: $0.00').should('be.visible');

          // update status: Cancelled -> Issued
          financialAssistanceDetailsPage.selectPaymentLineStatusIssued();
          cy.contains('Payment status successfully updated.').should('be.visible');
          financialAssistanceDetailsPage.getPaymentLineStatusElement().contains('Issued').should('be.visible');
          financialAssistanceDetailsPage.getPaymentLineItemAmountField().should('have.attr', 'class').and('not.have.string', 'line-through');
          financialAssistanceDetailsPage.getPaymentGroupListField().contains('Payment total: $80.00').should('be.visible');

          // update status: Issued -> Completed
          financialAssistanceDetailsPage.selectPaymentLineStatusCompleted();
          cy.contains('Payment status successfully updated.').should('be.visible');
          financialAssistanceDetailsPage.getPaymentLineStatusElement().contains('Completed').should('be.visible');

          // update status: Completed -> Issued
          financialAssistanceDetailsPage.selectPaymentLineStatusIssued();
          cy.contains('Payment status successfully updated.').should('be.visible');
          financialAssistanceDetailsPage.getPaymentLineStatusElement().contains('Issued').should('be.visible');
        });
      });
    }
  });
  describe('Cannot roles', () => {
    before(() => {
      cy.then(async function () {
        const resultPrepareStateHousehold = await prepareStateHousehold(accessTokenL6, this.event);
        caseFile = resultPrepareStateHousehold.registrationResponse.caseFile;
        const provider = resultPrepareStateHousehold.provider;
        const createdFinancialAssistancePayment = await addFinancialAssistancePayment(provider, EPaymentModalities.Invoice, caseFile.id, this.table.id);
        submittedFinancialAssistancePayment = await submitFinancialAssistancePayment(provider, createdFinancialAssistancePayment.id);
        await updateFinancialAssistancePayment(provider, submittedFinancialAssistancePayment.id, submittedFinancialAssistancePayment.groups[0].id, PaymentStatus.Cancelled);
      });
    });
    for (const [roleName, roleValue] of Object.entries(cannotRoles)) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.login(roleValue);
          cy.goTo(`casefile/${caseFile.id}/financialAssistance`);
        });
        it('should not be able to update Invoice Payment Group Status', () => {
          const financialAssistanceHomePage = new FinancialAssistanceHomePage();

          const financialAssistanceDetailsPage = financialAssistanceHomePage.getFAPaymentById(submittedFinancialAssistancePayment.id);
          financialAssistanceDetailsPage.getPaymentLineStatusElement().click();
          financialAssistanceDetailsPage.getPaymentLineStatusIssued().should('not.exist');
        });
      });
    }
  });
});
