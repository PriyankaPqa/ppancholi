import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { EFinancialAmountModes } from '@libs/entities-lib/financial-assistance';
import { EPaymentModalities } from '@libs/entities-lib/program';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import {
  AddFinancialAssistancePaymentParams,
  addFinancialAssistancePayment,
  createEventAndTeam,
  createProgramWithTableWithItemAndSubItem,
  prepareStateHousehold,
  submitFinancialAssistancePayment } from '../../helpers/prepareState';
import {
  GenerateFaDataCorrectionXlsxFileParams,
  GenerateRandomFaDataCorrectionParams,
  fixtureGenerateFaDataCorrectionXlsxFile,
} from '../../../fixtures/mass-action-data-correction';
import { preprocessDataCorrectionFileCanSteps } from './canSteps';

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
const householdQuantity = 1;
const fileName = 'faDataCorrectionFile';
const filePath = `cypress/downloads/${fileName}.xlsx`;
const dataCorrectionTypeDropDown = 'Financial Assistance';
const dataCorrectionTypeDataTest = 'DataCorrectionFinancialAssistance';

describe('[T28846] Pre-process a Financial Assistance data correction file', { tags: ['@financial-assistance', '@mass-actions'] }, () => {
  describe('Can Roles', () => {
    for (const roleName of filteredCanRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.getToken().then(async (tokenResponse) => {
            accessTokenL6 = tokenResponse.access_token;
            const resultPrepareStateEvent = await createEventAndTeam(accessTokenL6, allRoles);
            // eslint-disable-next-line
            const resultCreateProgram = await createProgramWithTableWithItemAndSubItem(resultPrepareStateEvent.provider, resultPrepareStateEvent.event.id, EFinancialAmountModes.Fixed);
            const resultHousehold = await prepareStateHousehold(accessTokenL6, resultPrepareStateEvent.event);

            const addFinancialAssistancePaymentParamData: AddFinancialAssistancePaymentParams = {
              provider: resultPrepareStateEvent.provider,
              modality: EPaymentModalities.Cheque,
              caseFileId: resultHousehold.registrationResponse.caseFile.id,
              financialAssistanceTableId: resultCreateProgram.table.id,
            };
            const addedFinancialAssistancePayment = await addFinancialAssistancePayment(addFinancialAssistancePaymentParamData);
            await submitFinancialAssistancePayment(resultPrepareStateEvent.provider, addedFinancialAssistancePayment.id);
            const financialAssistancePayment = await resultPrepareStateEvent.provider.financialAssistancePaymentsService.get(addedFinancialAssistancePayment.id);
            cy.wrap(resultPrepareStateEvent.provider).as('provider');
            cy.wrap(resultPrepareStateEvent.event).as('event');
            cy.wrap(resultPrepareStateEvent.team).as('teamCreated');
            cy.wrap(resultCreateProgram.table.id).as('faTableId');
            cy.wrap(resultCreateProgram.program.name.translation.en).as('programName');
            cy.wrap(addedFinancialAssistancePayment.id).as('faPaymentId');
            cy.wrap(addedFinancialAssistancePayment.groups[0].id).as('faPaymentGroupId');
            cy.wrap(addedFinancialAssistancePayment.groups[0].lines[0].id).as('faPaymentLineId');
            cy.wrap(resultHousehold.registrationResponse.caseFile).as('caseFile');
            cy.wrap(financialAssistancePayment).as('faPayment');
            cy.login(roleName);
            cy.goTo('mass-actions/data-correction/create');
          });
        });
        afterEach(function () {
          if (this.teamCreated?.id && this.provider) {
            removeTeamMembersFromTeam(this.teamCreated.id, this.provider);
          }
        });
        it('should successfully pre-process a financial assistance data correction file', function () {
          const faCorrectionData: GenerateRandomFaDataCorrectionParams = {
            caseFile: this.caseFile,
            FinancialAssistancePaymentId: this.faPaymentId,
            FinancialAssistanceTableId: this.faTableId,
            FinancialAssistancePaymentGroupId: this.faPaymentGroupId,
            FinancialAssistancePaymentLinesId: this.faPaymentLineId,
            ETag: this.faPayment.etag,
          };

          const xlsxFileParamData: GenerateFaDataCorrectionXlsxFileParams = {
            faCorrectionData,
            caseFiles: [this.caseFile],
            tableName: 'MassActionTable',
            fileName,
          };
          fixtureGenerateFaDataCorrectionXlsxFile(xlsxFileParamData);

          preprocessDataCorrectionFileCanSteps({
            retries: this.test.retries.length,
            dataCorrectionTypeDataTest,
            dataCorrectionTypeDropDown,
            filePath,
            preprocessedItems: 'financial assistance records',
            roleName,
            householdQuantity,
            eventName: this.event.name.translation.en,
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
        it('should not be able to pre-process a financial assistance data correction file', () => {
          cy.contains('You do not have permission to access this page').should('be.visible');
        });
      });
    }
  });
});
