import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { EFinancialAmountModes } from '@libs/entities-lib/financial-assistance';
import { EPaymentModalities } from '@libs/entities-lib/program';
import { MassActionRunStatus } from '@libs/entities-lib/mass-action';
import { getToday } from '@libs/cypress-lib/helpers';
import { getUserName } from '@libs/cypress-lib/helpers/users';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import {
  AddFinancialAssistancePaymentParams,
  addFinancialAssistancePayment,
  createEventAndTeam,
  createProgramWithTableWithItemAndSubItem,
  prepareStateHousehold,
  submitFinancialAssistancePayment } from '../../helpers/prepareState';
import { fixtureBaseMassAction, writeCSVContentToFile } from '../../../fixtures/mass-actions';
import { MassImportPaymentStatusesHomePage } from '../../../pages/mass-action/mass-import-payment-status/massImportPaymentStatusesHome.page';

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
const filePath = 'cypress/downloads/T28960ImportPaymentStatusFile.csv';

describe('[T28960] Pre-process a payment status import file', { tags: ['@financial-assistance', '@mass-actions'] }, () => {
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
            cy.wrap(resultPrepareStateEvent.provider).as('provider');
            cy.wrap(resultPrepareStateEvent.event).as('event');
            cy.wrap(resultPrepareStateEvent.team).as('teamCreated');
            cy.wrap(resultCreateProgram.table.id).as('faTableId');
            cy.wrap(addedFinancialAssistancePayment.groups[0].id).as('faPaymentGroupId');
            cy.login(roleName);
            cy.goTo('mass-actions/import-payment-status');
          });
        });
        afterEach(function () {
          if (this.teamCreated?.id && this.provider) {
            removeTeamMembersFromTeam(this.teamCreated.id, this.provider);
          }
        });
        it('should successfully pre-process a payment status import file', function () {
          const baseMassActionData = fixtureBaseMassAction(this.test.retries.length);
          writeCSVContentToFile(filePath, [{
            PaymentGroupId: this.faPaymentGroupId,
            Status: 'Cancelled',
            CancellationReason: '',
            ActualDate: '',
          }]);
          const massImportPaymentStatusesHomePage = new MassImportPaymentStatusesHomePage();
          const newMassImportPaymentStatusPage = massImportPaymentStatusesHomePage.goToNewMassImportPaymentStatus();
          newMassImportPaymentStatusPage.fillNameDescription(baseMassActionData);
          newMassImportPaymentStatusPage.uploadFile().selectFile(filePath, { force: true });
          newMassImportPaymentStatusPage.clickNext();
          newMassImportPaymentStatusPage.getDialogTitle().should('eq', 'Confirm pre-processing');
          newMassImportPaymentStatusPage.getDialogText().should('eq', 'Are you sure you want to start pre-processing this mass action?');
          newMassImportPaymentStatusPage.getDialogConfirmSubmitButton().should('be.visible');
          newMassImportPaymentStatusPage.getDialogConfirmCancelButton().should('be.visible');

          const massImportPaymentStatusDetailsPage = newMassImportPaymentStatusPage.confirmPreprocessing();
          massImportPaymentStatusDetailsPage.getPreProcessingLabelOne().should('eq', 'Please wait while the file is being pre-processed.');
          massImportPaymentStatusDetailsPage.getPreProcessingLabelTwo().should('eq', 'This might take a few minutes, depending on the number of case files');
          cy.intercept('GET', 'user-account/user-accounts/metadata/**').as('userAccountMetadata');
          cy.waitForMassActionToBe(MassActionRunStatus.PreProcessed);
          massImportPaymentStatusDetailsPage.getMassActionStatus().contains('Pre-processed').should('be.visible');
          massImportPaymentStatusDetailsPage.getMassActionName().should('string', baseMassActionData.name);
          massImportPaymentStatusDetailsPage.getMassActionDescription().should('eq', baseMassActionData.description);
          massImportPaymentStatusDetailsPage.getMassActionProcessButton().should('be.enabled');
          massImportPaymentStatusDetailsPage.getInvalidCasefilesDownloadButton().should('be.disabled');
          massImportPaymentStatusDetailsPage.getMassActionType().should('eq', 'Import payment status');
          massImportPaymentStatusDetailsPage.getMassActionDateCreated().should('eq', getToday());
          cy.wait('@userAccountMetadata').then((interception) => {
            if (interception.response.statusCode === 200) {
              massImportPaymentStatusDetailsPage.getMassActionCreatedBy().should('eq', getUserName(roleName));
            } else {
              throw Error('Cannot verify roleName');
            }
          });
          massImportPaymentStatusDetailsPage.getBackToMassActionListButton().should('be.visible');
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
        it('should not be able to pre-process a payment status import file', () => {
          cy.contains('You do not have permission to access this page').should('be.visible');
        });
      });
    }
  });
});
