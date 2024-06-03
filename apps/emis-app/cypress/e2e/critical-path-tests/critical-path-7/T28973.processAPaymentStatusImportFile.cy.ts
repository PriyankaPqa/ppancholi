import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { EFinancialAmountModes } from '@libs/entities-lib/financial-assistance';
import { MassActionRunStatus } from '@libs/entities-lib/mass-action';
import { EPaymentModalities } from '@libs/entities-lib/program';
import {
  mockCreateMassActionImportPaymentStatusUploadFileRequest,
} from '@libs/cypress-lib/mocks/mass-actions/massPaymentStatus';
import { getToday } from '@libs/cypress-lib/helpers';
import { getUserName } from '@libs/cypress-lib/helpers/users';
import {
  addFinancialAssistancePayment,
  AddFinancialAssistancePaymentParams,
  createEventAndTeam,
  createProgramWithTableWithItemAndSubItem, prepareStateHousehold,
  submitFinancialAssistancePayment,
} from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { writeCSVContentToFile } from '../../../fixtures/mass-actions';
import { MassImportPaymentStatusDetailsPage } from '../../../pages/mass-action/mass-import-payment-status/massImportPaymentStatusDetails.page';
import { useProvider } from '../../../provider/provider';
import { CaseFileDetailsPage } from '../../../pages/casefiles/caseFileDetails.page';
import { FinancialAssistanceHomePage } from '../../../pages/financial-assistance-payment/financialAssistanceHome.page';

const canRoles = [
  UserRoles.level6,
  UserRoles.contributor2,
];

const cannotRoles = [
  UserRoles.level5,
  UserRoles.level4,
  UserRoles.level3,
  UserRoles.level2,
  UserRoles.level1,
  UserRoles.level0,
  UserRoles.contributor1,
  UserRoles.contributor3,
  UserRoles.readonly,
];

const { filteredCanRoles, filteredCannotRoles, allRoles } = getRoles(canRoles, cannotRoles);

let accessTokenL6 = '';
const filePath = 'cypress/downloads/T28973ImportPaymentStatusFile.csv';

describe(
  '[T28973] Process a Payment Status Import file',
  { tags: ['@financial-assistance', '@mass-action'] },
  () => {
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
            const resultHousehold = await prepareStateHousehold(accessTokenL6, resultPrepareStateEvent.event);

            const addFinancialAssistancePaymentParamData: AddFinancialAssistancePaymentParams = {
              provider: resultPrepareStateEvent.provider,
              modality: EPaymentModalities.Cheque,
              caseFileId: resultHousehold.registrationResponse.caseFile.id,
              financialAssistanceTableId: resultCreateProgram.table.id,
            };
            const addedFinancialAssistancePayment = await addFinancialAssistancePayment(addFinancialAssistancePaymentParamData);
            await submitFinancialAssistancePayment(resultPrepareStateEvent.provider, addedFinancialAssistancePayment.id);
            const csvFileData = writeCSVContentToFile(filePath, [{
              PaymentGroupId: addedFinancialAssistancePayment.groups[0].id,
              Status: 'Completed',
              CancellationReason: '',
              ActualDate: '',
            }]);

            const mockCreateMassImportPaymentStatusUploadCsvFile = mockCreateMassActionImportPaymentStatusUploadFileRequest(csvFileData);
            cy.getToken(roleName).then(async (tokenResponse) => {
              const provider = useProvider(tokenResponse.access_token);
              const responseMassImportPaymentStatus = await provider.cypress.massAction.createWithFile(
              'import-payment-status',
              mockCreateMassImportPaymentStatusUploadCsvFile,
              );
            cy.wrap(responseMassImportPaymentStatus.name).as('massActionName');
            cy.wrap(resultPrepareStateEvent.provider).as('provider');
            cy.wrap(resultPrepareStateEvent.team).as('teamCreated');
            cy.wrap(resultHousehold.registrationResponse.caseFile.id).as('caseFileId');
            cy.login(roleName);
            cy.goTo(`mass-actions/import-payment-status/details/${responseMassImportPaymentStatus.id}`);
            });
          });
        });

        afterEach(function () {
            if (this.provider && this.teamCreated?.id) {
              removeTeamMembersFromTeam(this.teamCreated.id, this.provider);
            }
        });

        it('should successfully upload file and passes processing', function () {
          const massImportPaymentStatusDetailsPage = new MassImportPaymentStatusDetailsPage();
          cy.waitForMassActionToBe(MassActionRunStatus.PreProcessed);
          massImportPaymentStatusDetailsPage.getMassActionProcessButton().should('be.visible');
          massImportPaymentStatusDetailsPage.getMassActionProcessButton().click();
          massImportPaymentStatusDetailsPage.getDialogText().should('eq', 'Are you sure you want to start processing this mass action?');
          massImportPaymentStatusDetailsPage.getDialogConfirmCancelButton().should('be.visible');
          massImportPaymentStatusDetailsPage.getDialogConfirmSubmitButton().should('be.visible');
          massImportPaymentStatusDetailsPage.confirmProcessing();
          massImportPaymentStatusDetailsPage.getPreProcessingLabelOne().should('eq', 'Please wait while the case files are being processed.');
          massImportPaymentStatusDetailsPage.getPreProcessingLabelTwo().should('eq', 'This might take a few minutes depending on the number of processed case files.');
          cy.intercept('GET', 'user-account/user-accounts/metadata/**').as('userAccountMetadata');
          massImportPaymentStatusDetailsPage.waitAndRefreshUntilMassActionStatusUpdated(this.massActionName, 'Processed');
          massImportPaymentStatusDetailsPage.getMassActionStatus().contains('Processed').should('be.visible');
          massImportPaymentStatusDetailsPage.getMassActionSuccessfulCaseFiles().then((quantity) => {
            if (quantity === '1') {
              massImportPaymentStatusDetailsPage.getInvalidCasefilesDownloadButton().should('be.disabled');
            } else {
              massImportPaymentStatusDetailsPage.getInvalidCasefilesDownloadButton().should('be.enabled');
            }
          });
          massImportPaymentStatusDetailsPage.getMassActionType().should('eq', 'Import payment status');
          massImportPaymentStatusDetailsPage.getMassActionDateCreated().should('eq', getToday());
          cy.wait('@userAccountMetadata').then((interception) => {
            if (interception.response.statusCode === 200) {
              massImportPaymentStatusDetailsPage.getMassActionCreatedBy().should('eq', getUserName(roleName));
            } else {
              throw Error('Cannot verify roleName');
            }
          });
          massImportPaymentStatusDetailsPage.getBackToMassActionListButton().should('be.enabled');
          cy.goTo(`casefile/${this.caseFileId}`);
          const caseFileDetailsPage = new CaseFileDetailsPage();
          caseFileDetailsPage.goToFinancialAssistanceHomePage();
          const financialAssistanceHomePage = new FinancialAssistanceHomePage(); // avoiding dependency cycle error
          financialAssistanceHomePage.refreshUntilFaPaymentDisplayedWithTotal('$80.00');
          financialAssistanceHomePage.getFAPaymentName().should('string', 'FA Payment');
          financialAssistanceHomePage.getFAPaymentCreatedDate().should('eq', getToday());
          financialAssistanceHomePage.getFAPaymentAmount().should('eq', '$80.00');
          financialAssistanceHomePage.getApprovalStatus().should('eq', 'Approved');
          financialAssistanceHomePage.expandFAPayment();
          financialAssistanceHomePage.getFAPaymentGroupTitle().should('string', 'Cheque');
          financialAssistanceHomePage.getFAPaymentGroupTotal().should('eq', '$80.00');
          financialAssistanceHomePage.getFAPaymentPaymentStatus().should('eq', 'Status: Completed');
          const financialAssistanceDetailsPage = financialAssistanceHomePage.getFAPayment();
          financialAssistanceDetailsPage.getPaymentModalityGroup().should('string', 'Clothing > Winter Clothing');
          financialAssistanceDetailsPage.getPaymentAmount().should('string', '$80.00');
          financialAssistanceDetailsPage.getPaymentLineStatus().should('eq', 'Completed');
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
          cy.goTo('mass-actions/import-payment-status');
        });
        it('should not be able to do the mass action import payment status', () => {
          cy.contains('You do not have permission to access this page').should('be.visible');
        });
      });
    }
  });
},
);
