import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { EFinancialAmountModes } from '@libs/entities-lib/financial-assistance';
import { MassActionRunStatus } from '@libs/entities-lib/mass-action';
import { getToday } from '@libs/cypress-lib/helpers';
import { getUserName } from '@libs/cypress-lib/helpers/users';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import {
  MassActionFinancialAssistanceUploadFileParams,
  createEventAndTeam,
  createProgramWithTableWithItemAndSubItem,
  prepareStateMassActionFinancialAssistanceUploadFile,
} from '../../helpers/prepareState';
import { MassFinancialAssistanceDetailsPage } from '../../../pages/mass-action/mass-financial-assistance/massFinancialAssistanceDetails.page';
import { CaseFileDetailsPage } from '../../../pages/casefiles/caseFileDetails.page';
import { FinancialAssistanceHomePage } from '../../../pages/financial-assistance-payment/financialAssistanceHome.page';

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

let accessTokenL6 = '';
const householdQuantity = 3;

describe('[T29104] Process a Financial Assistance upload file', { tags: ['@financial-assistance', '@mass-actions'] }, () => {
  describe('Can Roles', () => {
    for (const roleName of filteredCanRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.getToken().then(async (tokenResponse) => {
            accessTokenL6 = tokenResponse.access_token;
            const resultPrepareStateEvent = await createEventAndTeam(accessTokenL6, allRoles);
            // eslint-disable-next-line
            const resultCreateProgram = await createProgramWithTableWithItemAndSubItem(resultPrepareStateEvent.provider, resultPrepareStateEvent.event.id, EFinancialAmountModes.Fixed);
            const massActionFaUploadFileParamData: MassActionFinancialAssistanceUploadFileParams = {
              accessToken: accessTokenL6,
              event: resultPrepareStateEvent.event,
              tableId: resultCreateProgram.table.id,
              programId: resultCreateProgram.program.id,
              householdQuantity,
              filePath: 'cypress/downloads/faCustomFile.csv',
            };
            const resultMassFinancialAssistance = await prepareStateMassActionFinancialAssistanceUploadFile(massActionFaUploadFileParamData);
            cy.wrap(resultPrepareStateEvent.provider).as('provider');
            cy.wrap(resultPrepareStateEvent.team).as('teamCreated');
            cy.wrap(resultPrepareStateEvent.event).as('event');
            cy.wrap(resultCreateProgram.table).as('faTable');
            cy.wrap(resultCreateProgram.program.name.translation.en).as('programName');
            cy.wrap(resultMassFinancialAssistance.responseMassFinancialAssistance.name).as('massFinancialAssistanceName');
            cy.wrap(resultMassFinancialAssistance.responseCreateHouseholds.householdsCreated[0].registrationResponse.caseFile.id).as('caseFileId');
            cy.login(roleName);
            cy.goTo(`mass-actions/financial-assistance/details/${resultMassFinancialAssistance.responseMassFinancialAssistance.id}`);
          });
        });
        afterEach(function () {
          if (this.teamCreated?.id && this.provider) {
            removeTeamMembersFromTeam(this.teamCreated.id, this.provider);
          }
        });
        // eslint-disable-next-line
        it('should successfully process a financial assistance upload file', function () {
          const massFinancialAssistanceDetailsPage = new MassFinancialAssistanceDetailsPage();
          cy.waitForMassActionToBe(MassActionRunStatus.PreProcessed);
          massFinancialAssistanceDetailsPage.getMassActionProcessButton().should('be.visible');
          massFinancialAssistanceDetailsPage.getMassActionProcessButton().click();
          massFinancialAssistanceDetailsPage.getDialogText().should('eq', 'Are you sure you want to start processing this mass action?');
          massFinancialAssistanceDetailsPage.getDialogConfirmCancelButton().should('be.visible');
          massFinancialAssistanceDetailsPage.getDialogConfirmSubmitButton().should('be.visible');
          massFinancialAssistanceDetailsPage.confirmProcessing();
          massFinancialAssistanceDetailsPage.getPreProcessingLabelOne().should('eq', 'Please wait while the case files are being processed.');
          massFinancialAssistanceDetailsPage.getPreProcessingLabelTwo().should('eq', 'This might take a few minutes depending on the number of processed case files.');
          cy.intercept('GET', 'user-account/user-accounts/metadata/**').as('userAccountMetadata');
          cy.waitForMassActionToBe(MassActionRunStatus.Processed);
          massFinancialAssistanceDetailsPage.getMassActionStatus().contains('Processed').should('be.visible');
          massFinancialAssistanceDetailsPage.getMassActionType().should('eq', 'Financial assistance');
          massFinancialAssistanceDetailsPage.getMassActionDateCreated().should('eq', getToday());
          cy.wait('@userAccountMetadata').then((interception) => {
            if (interception.response.statusCode === 200) {
              massFinancialAssistanceDetailsPage.getMassActionCreatedBy().should('eq', getUserName(roleName));
            } else {
              throw Error('Cannot verify roleName');
            }
          });
          massFinancialAssistanceDetailsPage.getMassActionSuccessfulCaseFiles().then((quantity) => {
            if (quantity === householdQuantity.toString()) {
              massFinancialAssistanceDetailsPage.getInvalidCasefilesDownloadButton().should('be.disabled');
            } else {
              massFinancialAssistanceDetailsPage.getInvalidCasefilesDownloadButton().should('be.enabled');
            }
          });
          massFinancialAssistanceDetailsPage.getMassActionPaymentDetailsEvent().should('eq', this.event.name.translation.en);
          massFinancialAssistanceDetailsPage.getMassActionPaymentDetailsTable().should('eq', this.faTable.name.translation.en);
          massFinancialAssistanceDetailsPage.getMassActionPaymentDetailsProgram().should('eq', this.programName);
          massFinancialAssistanceDetailsPage.getMassActionPaymentDetailsItem().should('eq', 'Clothing');
          massFinancialAssistanceDetailsPage.getMassActionPaymentDetailsSubItem().should('eq', 'Winter Clothing');
          massFinancialAssistanceDetailsPage.getMassActionPaymentDetailsPaymentModality().should('eq', 'cheque');
          massFinancialAssistanceDetailsPage.getMassActionPaymentDetailsPaymentAmount().should('eq', '$80.00');
          massFinancialAssistanceDetailsPage.getBackToMassActionListButton().should('be.visible');
          cy.visit(`en/casefile/${this.caseFileId}`);

          const caseFileDetailsPage = new CaseFileDetailsPage();
          caseFileDetailsPage.getCaseFileActivityTitles().should('string', 'Financial assistance payment - Approved - Final');
          caseFileDetailsPage.getCaseFileActivityBodies().should('string', this.massFinancialAssistanceName).and('string', '$80.00');
          caseFileDetailsPage.goToFinancialAssistanceHomePage();

          const financialAssistanceHomePage = new FinancialAssistanceHomePage(); // avoiding dependency cycle error
          financialAssistanceHomePage.refreshUntilFaPaymentDisplayedWithTotal('$80.00');
          financialAssistanceHomePage.getFAPaymentName().should('eq', this.massFinancialAssistanceName);
          financialAssistanceHomePage.getFAPaymentCreatedDate().should('eq', getToday());
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
    for (const roleName of filteredCannotRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.login(roleName);
          cy.goTo('mass-actions/financial-assistance');
        });
        it('should not be able to process a financial assistance upload file', () => {
          cy.contains('You do not have permission to access this page').should('be.visible');
        });
      });
    }
  });
});
