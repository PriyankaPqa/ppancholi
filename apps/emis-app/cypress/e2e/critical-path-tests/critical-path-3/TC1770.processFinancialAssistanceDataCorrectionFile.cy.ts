import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { EFinancialAmountModes } from '@libs/entities-lib/financial-assistance';
import { EPaymentModalities } from '@libs/entities-lib/program';
import { MassActionDataCorrectionType, MassActionRunStatus } from '@libs/entities-lib/mass-action';
import { BaseDetailsMassAction } from 'cypress/pages/mass-action/base/baseDetailsMassAction';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import {
  MassActionFinancialAssistanceXlsxFileParams,
  addFinancialAssistancePayment,
  createEventAndTeam,
  createProgramWithTableWithItemAndSubItem,
  prepareStateHousehold,
  prepareStateMassActionFinancialAssistanceXlsxFile,
  submitFinancialAssistancePayment } from '../../helpers/prepareState';
import { GenerateRandomFaDataCorrectionParams, fixtureGenerateFaDataCorrectionXlsxFile } from '../../../fixtures/mass-action-data-correction';

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
const tableName = 'MassActionTable';
const fileName = 'faDataCorrectionFile';
const householdQuantity = 1;

describe('#TC1770# - Process a Financial Assistance data correction file', { tags: ['@financial-assistance', '@mass-actions'] }, () => {
  describe('Can Roles', () => {
    for (const roleName of filteredCanRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.getToken().then(async (tokenResponse) => {
            accessTokenL6 = tokenResponse.access_token;
            const resultPrepareStateEvent = await createEventAndTeam(accessTokenL6, allRoles);
            // eslint-disable-next-line
            const resultCreateProgram = await createProgramWithTableWithItemAndSubItem(resultPrepareStateEvent.provider, resultPrepareStateEvent.event.id, EFinancialAmountModes.Fixed);
            const responseCreateHousehold = await prepareStateHousehold(accessTokenL6, resultPrepareStateEvent.event);
            const financialAssistancePayment = await addFinancialAssistancePayment(
              responseCreateHousehold.provider,
              EPaymentModalities.Cheque,
              responseCreateHousehold.registrationResponse.caseFile.id,
              resultCreateProgram.table.id,
            );
            await submitFinancialAssistancePayment(responseCreateHousehold.provider, financialAssistancePayment.id);
            const getFinancialAssistancePayment = await responseCreateHousehold.provider.financialAssistancePaymentsService.get(financialAssistancePayment.id);
            const faCorrectionData: GenerateRandomFaDataCorrectionParams = {
              caseFile: responseCreateHousehold.registrationResponse.caseFile,
              FinancialAssistancePaymentId: financialAssistancePayment.id,
              FinancialAssistanceTableId: resultCreateProgram.table.id,
              FinancialAssistancePaymentGroupId: financialAssistancePayment.groups[0].id,
              FinancialAssistancePaymentLinesId: financialAssistancePayment.groups[0].lines[0].id,
              ETag: getFinancialAssistancePayment.etag,
            };
            // eslint-disable-next-line
            const generatedDataCorrectionFileData = await fixtureGenerateFaDataCorrectionXlsxFile(faCorrectionData, [responseCreateHousehold.registrationResponse.caseFile], tableName, fileName);

            const massActionFaDataCorrectionFileParamData: MassActionFinancialAssistanceXlsxFileParams = {
              provider: responseCreateHousehold.provider,
              event: resultPrepareStateEvent.event,
              massAction: 'data-correction',
              generatedFaXlsxFileData: generatedDataCorrectionFileData,
              massActionType: MassActionDataCorrectionType.FinancialAssistance,
            };
            const responseMassFinancialAssistance = await prepareStateMassActionFinancialAssistanceXlsxFile(massActionFaDataCorrectionFileParamData);

            cy.wrap(resultPrepareStateEvent.provider).as('provider');
            cy.wrap(resultPrepareStateEvent.event).as('event');
            cy.wrap(resultPrepareStateEvent.team).as('teamCreated');
            cy.login(roleName);
            cy.goTo(`mass-actions/data-correction/details/${responseMassFinancialAssistance.id}`);
          });
        });
        afterEach(function () {
          if (this.teamCreated?.id && this.provider) {
            removeTeamMembersFromTeam(this.teamCreated.id, this.provider);
          }
        });
        it('should successfully process a financial assistance data correction file', () => {
          const baseDetailsMassActionPage = new BaseDetailsMassAction();
          cy.waitForMassActionToBe(MassActionRunStatus.PreProcessed);
          baseDetailsMassActionPage.getMassActionProcessButton().should('be.visible');
          baseDetailsMassActionPage.getMassActionProcessButton().click();
          baseDetailsMassActionPage.getDialogText().should('eq', 'Are you sure you want to start processing this mass action?');
          baseDetailsMassActionPage.getDialogCancelButton().should('be.visible');
          baseDetailsMassActionPage.getDialogSubmitButton().should('be.visible');
          baseDetailsMassActionPage.confirmProcessing();
          baseDetailsMassActionPage.getPreProcessingLabelOne().should('eq', 'Please wait while the financial assistance records are being processed.');
          baseDetailsMassActionPage.getPreProcessingLabelTwo().should('eq', 'This might take a few minutes depending on the number of processed records.');
          cy.waitForMassActionToBe(MassActionRunStatus.Processed);
          baseDetailsMassActionPage.getMassActionStatus().contains('Processed').should('be.visible');
          baseDetailsMassActionPage.getMassActionSuccessfulCaseFiles().then((quantity) => {
            if (quantity === householdQuantity.toString()) {
              baseDetailsMassActionPage.getInvalidCasefilesDownloadButton().should('be.disabled');
            } else {
              baseDetailsMassActionPage.getInvalidCasefilesDownloadButton().should('be.enabled');
            }
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
          cy.goTo('mass-actions/data-correction/create');
        });
        it('should not be able to process a financial assistance data correction file', () => {
          cy.contains('You do not have permission to access this page').should('be.visible');
        });
      });
    }
  });
});
