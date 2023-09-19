import { UserRoles } from '@libs/cypress-lib/support/msal';
import { EFinancialAmountModes } from '@libs/entities-lib/financial-assistance';
import { format } from 'date-fns';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { createProgramWithTableWithItemAndSubItem, createEventAndTeam, prepareStateMassActionFinancialAssistanceCustomFile } from '../../helpers/prepareState';
import { MassFinancialAssistanceDetailsPage } from '../../../pages/mass-action/mass-financial-assistance/massFinancialAssistanceDetails.page';
import { CaseFileDetailsPage } from '../../../pages/casefiles/caseFileDetails.page';
import { FinancialAssistanceHomePage } from '../../../pages/financial-assistance-payment/financialAssistanceHome.page';

const canRoles = {
  Level6: UserRoles.level6,
};

const cannotRoles = {
  Level5: UserRoles.level5,
  Level4: UserRoles.level4,
  Level3: UserRoles.level3,
  Level2: UserRoles.level2,
  Level1: UserRoles.level1,
  Level0: UserRoles.level0,
  Contributor1: UserRoles.contributor1,
  Contributor2: UserRoles.contributor2,
  Contributor3: UserRoles.contributor3,
  ReadOnly: UserRoles.readonly,
};

const allRolesValues = [...Object.values(canRoles), ...Object.values(cannotRoles)];

let accessTokenL6 = '';
const fileName = 'faCustomOptionsFile';
const householdQuantity = 3;

describe('#TC1830# - Process a Financial Assistance custom file', { tags: ['@financial-assistance', '@mass-actions'] }, () => {
  describe('Can Roles', () => {
    for (const [roleName, roleValue] of Object.entries(canRoles)) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.getToken().then(async (tokenResponse) => {
            accessTokenL6 = tokenResponse.access_token;
            const resultPrepareStateEvent = await createEventAndTeam(accessTokenL6, allRolesValues);
            // eslint-disable-next-line
            const resultCreateProgram = await createProgramWithTableWithItemAndSubItem(resultPrepareStateEvent.provider, resultPrepareStateEvent.event.id, EFinancialAmountModes.Fixed);
            // eslint-disable-next-line
            const resultMassFinancialAssistance = await prepareStateMassActionFinancialAssistanceCustomFile(accessTokenL6, resultPrepareStateEvent.event, resultCreateProgram.table.id, householdQuantity, fileName);
            cy.wrap(resultPrepareStateEvent.provider).as('provider');
            cy.wrap(resultPrepareStateEvent.team).as('teamCreated');
            cy.wrap(resultMassFinancialAssistance.responseMassFinancialAssistance.name).as('massFinancialAssistanceName');
            cy.wrap(resultMassFinancialAssistance.responseCreateHouseholds.householdsCreated[0].registrationResponse.caseFile.id).as('caseFileId');
            cy.wrap(resultCreateProgram.program.name.translation.en).as('programName');
            cy.login(roleValue);
            cy.goTo(`mass-actions/financial-assistance-custom/details/${resultMassFinancialAssistance.responseMassFinancialAssistance.id}`);
          });
        });
        afterEach(function () {
          if (this.teamCreated?.id && this.provider) {
            removeTeamMembersFromTeam(this.teamCreated.id, this.provider);
          }
        });
        it('should successfully process a financial assistance custom file', function () {
          const massFinancialAssistanceDetailsPage = new MassFinancialAssistanceDetailsPage();
          massFinancialAssistanceDetailsPage.getMassActionProcessButton().should('be.visible');
          massFinancialAssistanceDetailsPage.getMassActionProcessButton().click();
          massFinancialAssistanceDetailsPage.getDialogText().should('eq', 'Are you sure you want to start processing this mass action?');
          massFinancialAssistanceDetailsPage.getDialogCancelButton().should('be.visible');
          massFinancialAssistanceDetailsPage.getDialogSubmitButton().should('be.visible');
          massFinancialAssistanceDetailsPage.confirmProcessing();
          massFinancialAssistanceDetailsPage.getPreProcessingLabelOne().should('eq', 'Please wait while the case files are being processed.');
          massFinancialAssistanceDetailsPage.getPreProcessingLabelTwo().should('eq', 'This might take a few minutes depending on the number of processed case files.');
          massFinancialAssistanceDetailsPage.refreshUntilCurrentProcessCompleteWithLabelString('edit', this.massFinancialAssistanceName, ' Processed ');
          massFinancialAssistanceDetailsPage.getMassActionStatus().contains('Processed').should('be.visible');
          massFinancialAssistanceDetailsPage.getMassActionSuccessfulCaseFiles().then((quantity) => {
            if (quantity === householdQuantity.toString()) {
              massFinancialAssistanceDetailsPage.getInvalidCasefilesDownloadButton().should('be.disabled');
            } else {
              massFinancialAssistanceDetailsPage.getInvalidCasefilesDownloadButton().should('be.enabled');
            }
          });
          cy.visit(`en/casefile/${this.caseFileId}`);

          const caseFileDetailsPage = new CaseFileDetailsPage();
          caseFileDetailsPage.getCaseFileActivityTitles().should('string', 'Financial assistance payment - Approved - Final');
          caseFileDetailsPage.getCaseFileActivityBodies().should('string', `${this.programName} - Clothing`).and('string', '$80.00');
          caseFileDetailsPage.goToFinancialAssistanceHomePage();

          const financialAssistanceHomePage = new FinancialAssistanceHomePage(); // avoiding dependency cycle error
          financialAssistanceHomePage.getFAPaymentName().should('string', `${this.programName} - Clothing`);
          financialAssistanceHomePage.getFAPaymentCreatedDate().should('eq', format(Date.now(), 'yyyy-MM-dd'));
          financialAssistanceHomePage.getFAPaymentAmount().should('eq', '$80.00');
          financialAssistanceHomePage.getApprovalStatus().should('eq', 'Approved');
          financialAssistanceHomePage.expandFAPayment();
          financialAssistanceHomePage.getFAPaymentGroupTitle().should('string', 'Cheque');
          financialAssistanceHomePage.getFAPaymentGroupTotal().should('eq', '$80.00');
          financialAssistanceHomePage.getFAPaymentPaymentStatus().should('eq', 'Status: New');

          const financialAssistanceDetailsPage = financialAssistanceHomePage.getFAPayment();
          financialAssistanceDetailsPage.getPaymentModalityGroup().should('string', 'Clothing > Winter Clothing');
          financialAssistanceDetailsPage.getPaymentAmount().should('string', '$80.00');
          financialAssistanceDetailsPage.getPaymentLineStatus().should('eq', 'New');
          financialAssistanceDetailsPage.getPaymentLineGroupTitle().contains('Cheque').should('be.visible');
        });
      });
    }
  });
  describe('Cannot Roles', () => {
    for (const [roleName, roleValue] of Object.entries(cannotRoles)) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.login(roleValue);
          cy.goTo('mass-actions/financial-assistance-custom');
        });
        it('should not be able to process a financial assistance custom file', () => {
          cy.contains('You do not have permission to access this page').should('be.visible');
        });
      });
    }
  });
});
