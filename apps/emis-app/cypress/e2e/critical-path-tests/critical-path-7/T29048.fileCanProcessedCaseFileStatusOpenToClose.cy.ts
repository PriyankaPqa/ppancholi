import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { getToday, reasonCaseFileStatusUpdate } from '@libs/cypress-lib/helpers';
import { CaseFileStatus } from '@libs/entities-lib/case-file';
import { EPaymentModalities } from '@libs/entities-lib/program';
import { EFinancialAmountModes } from '@libs/entities-lib/financial-assistance';
import { PaymentStatus } from '@libs/entities-lib/financial-assistance-payment';
import { MassCaseFileStatusUpdateDetailsPage } from 'cypress/pages/mass-action/mass-case-file-status/massCaseFileStatusUpdateDetails.page';
import { MassActionRunStatus } from '@libs/entities-lib/mass-action';
import { getUserName } from '@libs/cypress-lib/helpers/users';
import { caseFileDetailsPageAssertionSteps } from './canSteps';
import {
  AddFinancialAssistancePaymentForMultipleCaseFilesParams,
  MassActionCaseFileStatusViaUploadFileParams,
  SubmitUpdateFaPaymentParams,
  addPaymentsForMultipleHouseholds,
  createEventAndTeam,
  createProgramWithTableWithItemAndSubItem,
  prepareStateCreateAndSearchHouseholds,
  prepareStateMassActionCaseFileStatusViaUploadFile,
  submitAndUpdateFAPayment,
} from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';

const canRoles = [
  UserRoles.level6,
  UserRoles.level5,
];

const cannotRoles = [
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

describe('[T29048] File can be processed case file status (Open to closed)', { tags: ['@case-file', '@mass-actions'] }, () => {
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
            cy.wrap(resultPrepareStateEvent.provider).as('provider');
            cy.wrap(resultPrepareStateEvent.team).as('teamCreated');
            cy.wrap(resultPrepareStateEvent.event).as('event');
            cy.getToken(roleName).then(async (tokenResponse) => {
              const resultCreateHouseholds = await prepareStateCreateAndSearchHouseholds(tokenResponse.access_token, resultPrepareStateEvent.event, householdQuantity);
              const addFinancialAssistancePaymentParamData: AddFinancialAssistancePaymentForMultipleCaseFilesParams = {
                provider: resultCreateHouseholds.responseCreateHouseholds.provider,
                modality: EPaymentModalities.PrepaidCard,
                caseFileIds: [
                  resultCreateHouseholds.responseCreateHouseholds.householdsCreated[0].registrationResponse.caseFile.id,
                  resultCreateHouseholds.responseCreateHouseholds.householdsCreated[1].registrationResponse.caseFile.id,
                  resultCreateHouseholds.responseCreateHouseholds.householdsCreated[2].registrationResponse.caseFile.id,
                ],
                financialAssistanceTableId: resultCreateProgram.table.id,
              };
              const resultAddPaymentsForMultipleHouseholds = await addPaymentsForMultipleHouseholds(addFinancialAssistancePaymentParamData);

              const submitAndUpdateFinancialAssistancePaymentParamData: SubmitUpdateFaPaymentParams = {
                provider: resultCreateHouseholds.responseCreateHouseholds.provider,
                createdFinancialAssistancePaymentId: resultAddPaymentsForMultipleHouseholds[0].data.id,
                paymentStatus: PaymentStatus.Cancelled,
              };
              cy.intercept('PATCH', `**/finance/financial-assistance-payments/${resultAddPaymentsForMultipleHouseholds[0].data.id}/groups/*/payment-status`)
                .as('updatedFinancialAssistancePayment');
              cy.then(async () => {
                await submitAndUpdateFAPayment(submitAndUpdateFinancialAssistancePaymentParamData);
              });
              cy.wait('@updatedFinancialAssistancePayment').then(async (interception) => {
                if (interception.response.statusCode === 200) {
                  const massActionCaseFileStatusUploadFileParamData: MassActionCaseFileStatusViaUploadFileParams = {
                    provider: resultCreateHouseholds.responseCreateHouseholds.provider,
                    caseFiles: [resultCreateHouseholds.caseFileCreated1, resultCreateHouseholds.caseFileCreated2, resultCreateHouseholds.caseFileCreated3],
                    event: resultPrepareStateEvent.event,
                    filePath: 'cypress/downloads/caseFileUpdateStatusOpenToClosedFile.csv',
                    reason: {
                      optionItemId: reasonCaseFileStatusUpdate.OperationEnded,
                      specifiedOther: null,
                    },
                    rationale: 'it is not Mandatory field',
                    status: CaseFileStatus.Closed,
                  };
                  const resultMassActionCaseFileStatusViaUploadFile = await prepareStateMassActionCaseFileStatusViaUploadFile(massActionCaseFileStatusUploadFileParamData);

                  cy.wrap(massActionCaseFileStatusUploadFileParamData).as('massActionCaseFileStatusUploadFile');
                  cy.wrap(resultMassActionCaseFileStatusViaUploadFile.responseMassCaseFileStatusUpdate).as('responseMassCaseFileStatusUpdate');
                  cy.wrap(resultCreateHouseholds.caseFileCreated1.caseFileNumber).as('caseFileNumber1');
                  cy.wrap(resultMassActionCaseFileStatusViaUploadFile.responseMassCaseFileStatusUpdate.name).as('massActionName');
                  cy.login(roleName);
                  cy.goTo(`mass-actions/case-file-status/details/${resultMassActionCaseFileStatusViaUploadFile.responseMassCaseFileStatusUpdate.id}`);
                } else {
                  throw Error('Failed to update payment status to Cancelled');
                }
              });
            });
          });
        });
        afterEach(function () {
          if (this.teamCreated?.id && this.provider) {
            removeTeamMembersFromTeam(this.teamCreated.id, this.provider);
          }
        });
        // eslint-disable-next-line
        it('should successfully process mass action for case file status open to closed', function () {
          const massCaseFileStatusUpdateDetailsPage = new MassCaseFileStatusUpdateDetailsPage();
          cy.waitForMassActionToBe(MassActionRunStatus.PreProcessed, false);
          massCaseFileStatusUpdateDetailsPage.getMassActionProcessButton().should('be.visible');
          massCaseFileStatusUpdateDetailsPage.getMassActionProcessButton().click();
          massCaseFileStatusUpdateDetailsPage.getDialogText().should('eq', 'Are you sure you want to start processing this mass action?');
          massCaseFileStatusUpdateDetailsPage.getDialogConfirmCancelButton().should('be.visible');
          massCaseFileStatusUpdateDetailsPage.getDialogConfirmSubmitButton().should('be.visible');
          cy.interceptAndValidateCondition({
            httpMethod: 'POST',
            url: 'case-file/mass-actions/**/run',
            actionsCallback: () => {
              massCaseFileStatusUpdateDetailsPage.confirmProcessing();
              massCaseFileStatusUpdateDetailsPage.getPreProcessingLabelOne().should('eq', 'Please wait while the case files are being processed.');
              massCaseFileStatusUpdateDetailsPage.getPreProcessingLabelTwo().should('eq', 'This might take a few minutes depending on the number of processed case files.');
            },
            conditionCallBack: (interception) => (interception.response.statusCode === 200),
            actionsWhenValidationPassed: () => {
              cy.log('Mass action Case file status update processed successfully.');
            },
            actionsWhenValidationFailed: () => {
              throw Error('Mass action Case file status update not processed');
            },
            alias: 'MassActionCaseFileStatusUpdate',
          });
          massCaseFileStatusUpdateDetailsPage.waitAndRefreshUntilMassActionStatusUpdated(this.massActionName, 'Processed');
          massCaseFileStatusUpdateDetailsPage.getMassActionStatus().contains('Processed').should('be.visible');
          massCaseFileStatusUpdateDetailsPage.getMassActionSuccessfulCaseFiles().should('eq', '1');
          massCaseFileStatusUpdateDetailsPage.getNumberFailedRecords().should('eq', '2');
          massCaseFileStatusUpdateDetailsPage.getErrorMessage().should('string', 'Case file cannot be closed due to financial payments');
          massCaseFileStatusUpdateDetailsPage.getMassActionType().should('eq', 'Case file status update');
          massCaseFileStatusUpdateDetailsPage.getMassActionDateCreated().should('eq', getToday());
          massCaseFileStatusUpdateDetailsPage.verifyAndGetMassActionCreatedBy(getUserName(roleName)).should('eq', getUserName(roleName));
          massCaseFileStatusUpdateDetailsPage.getMassActionCaseFileStatusDetailsEvent().should('eq', this.event.name.translation.en);
          massCaseFileStatusUpdateDetailsPage.getMassActionCaseFileStatusDetailsCaseFileStatus().should('eq', 'Closed');
          massCaseFileStatusUpdateDetailsPage.getMassActionCaseFileStatusDetailsReason().should('eq', 'Operation ended');
          massCaseFileStatusUpdateDetailsPage.getMassActionCaseFileStatusDetailsRationale().should('eq', this.massActionCaseFileStatusUploadFile.rationale);
          massCaseFileStatusUpdateDetailsPage.getBackToMassActionListButton().should('be.visible');

          caseFileDetailsPageAssertionSteps({
            caseFileNumber1: this.caseFileNumber1,
            massActionCaseFileStatusUpdateRationale: this.massActionCaseFileStatusUploadFile.rationale,
            massActionCaseFileStatusUpdateReason: 'Operation ended',
            caseFileStatus: 'Closed',
            roleName,
            caseFileActivityTitle: 'Case file closed',
          });
        });
      });
    }
  });
  describe('Cannot Roles', () => {
    for (const roleName of filteredCannotRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.login(roleName);
          cy.goTo('mass-actions/case-file-status');
        });
        it('should not be able to process mass action for case file status open to closed', () => {
          cy.contains('You do not have permission to access this page').should('be.visible');
        });
      });
    }
  });
});
