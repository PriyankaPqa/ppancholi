import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { EFinancialAmountModes } from '@libs/entities-lib/financial-assistance';
import { getToday } from '@libs/cypress-lib/helpers';
import { MassActionRunStatus } from '@libs/entities-lib/mass-action';
import { MockCreateMassActionXlsxFileRequestParams } from '@libs/cypress-lib/mocks/mass-actions/massFinancialAssistance';
import { getUserName } from '@libs/cypress-lib/helpers/users';
import { GenerateFaCustomOptionsXlsxFileParams, fixtureGenerateFaCustomOptionsXlsxFile } from '../../../fixtures/mass-actions';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import {
  createProgramWithTableWithItemAndSubItem,
  createEventAndTeam,
  prepareStateCreateAndSearchHouseholds,
  prepareStateMassActionXlsxFile,
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
const fileName = 'faCustomOptionsFile';

describe('[T28902] Process a Financial Assistance custom file', { tags: ['@financial-assistance', '@mass-actions'] }, () => {
  describe('Can Roles', () => {
    for (const roleName of filteredCanRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.getToken().then(async (tokenResponse) => {
            accessTokenL6 = tokenResponse.access_token;
            const resultPrepareStateEvent = await createEventAndTeam(accessTokenL6, allRoles);
            const resultCreateProgram = await createProgramWithTableWithItemAndSubItem(
              resultPrepareStateEvent.provider,
              resultPrepareStateEvent.event.id,
              EFinancialAmountModes.Fixed,
            );
            const resultCreateSearchHouseholds = await prepareStateCreateAndSearchHouseholds(accessTokenL6, resultPrepareStateEvent.event, householdQuantity);

            const generateFaCustomOptionsXlsxFileParamData: GenerateFaCustomOptionsXlsxFileParams = {
              caseFiles: [resultCreateSearchHouseholds.caseFileCreated1, resultCreateSearchHouseholds.caseFileCreated2, resultCreateSearchHouseholds.caseFileCreated3],
              financialAssistanceTableId: resultCreateProgram.table.id,
              tableName: 'MassActionTable',
              fileName: 'faCustomOptionsFile',
            };
            const generatedCustomFileData = await fixtureGenerateFaCustomOptionsXlsxFile(generateFaCustomOptionsXlsxFileParamData);

            const mockRequestDataParams: MockCreateMassActionXlsxFileRequestParams = {
              eventId: resultPrepareStateEvent.event.id,
              fileContents: generatedCustomFileData,
              fileName,
              massActionType: null,
            };

            const resultMassFinancialAssistance = await prepareStateMassActionXlsxFile(
              resultCreateSearchHouseholds.responseCreateHouseholds.provider,
              'financial-assistance-custom-options',
              mockRequestDataParams,
            );

            cy.wrap(resultPrepareStateEvent.provider).as('provider');
            cy.wrap(resultPrepareStateEvent.team).as('teamCreated');
            cy.wrap(resultCreateSearchHouseholds.caseFileCreated1.id).as('caseFileId');
            cy.wrap(resultCreateProgram.program.name.translation.en).as('programName');
            cy.login(roleName);
            cy.goTo(`mass-actions/financial-assistance-custom/details/${resultMassFinancialAssistance.id}`);
          });
        });
        afterEach(function () {
          if (this.teamCreated?.id && this.provider) {
            removeTeamMembersFromTeam(this.teamCreated.id, this.provider);
          }
        });
        it('should successfully process a financial assistance custom file', function () {
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
          massFinancialAssistanceDetailsPage.getMassActionType().should('eq', 'Mass financial assistance - custom options');
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
          massFinancialAssistanceDetailsPage.getBackToMassActionListButton().should('be.visible');

          cy.visit(`en/casefile/${this.caseFileId}`);

          const caseFileDetailsPage = new CaseFileDetailsPage();
          caseFileDetailsPage.getCaseFileActivityTitles().should('string', 'Financial assistance payment - Approved - Final');
          caseFileDetailsPage.getCaseFileActivityBodies().should('string', `${this.programName} - Clothing`).and('string', '$80.00');
          caseFileDetailsPage.goToFinancialAssistanceHomePage();

          const financialAssistanceHomePage = new FinancialAssistanceHomePage(); // avoiding dependency cycle error
          financialAssistanceHomePage.refreshUntilFaPaymentDisplayedWithTotal('$80.00');
          financialAssistanceHomePage.getFAPaymentName().should('string', `${this.programName} - Clothing`);
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
          cy.goTo('mass-actions/financial-assistance-custom');
        });
        it('should not be able to process a financial assistance custom file', () => {
          cy.contains('You do not have permission to access this page').should('be.visible');
        });
      });
    }
  });
});
