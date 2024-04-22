import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { EFinancialAmountModes } from '@libs/entities-lib/financial-assistance';
import { EPaymentModalities } from '@libs/entities-lib/program';
import { MassActionDataCorrectionType } from '@libs/entities-lib/mass-action';
import { MockCreateMassActionXlsxFileRequestParams } from '@libs/cypress-lib/mocks/mass-actions/massFinancialAssistance';
import { removeTeamMembersFromTeam } from '../helpers/teams';
import {
  AddFinancialAssistancePaymentParams,
  addFinancialAssistancePayment,
  createEventAndTeam,
  createProgramWithTableWithItemAndSubItem,
  prepareStateHousehold,
  prepareStateMassActionXlsxFile,
  submitFinancialAssistancePayment,
} from '../helpers/prepareState';
import {
  GenerateFaDataCorrectionXlsxFileParams,
  GenerateRandomFaDataCorrectionParams,
  fixtureGenerateFaDataCorrectionXlsxFile,
} from '../../fixtures/mass-action-data-correction';
import { processDataCorrectionFileSteps } from '../critical-path-tests/critical-path-3/canSteps';

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

            const addFinancialAssistancePaymentParamData: AddFinancialAssistancePaymentParams = {
              provider: responseCreateHousehold.provider,
              modality: EPaymentModalities.Cheque,
              caseFileId: responseCreateHousehold.registrationResponse.caseFile.id,
              financialAssistanceTableId: resultCreateProgram.table.id,
            };
            const financialAssistancePayment = await addFinancialAssistancePayment(addFinancialAssistancePaymentParamData);
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
            const xlsxFileParamData: GenerateFaDataCorrectionXlsxFileParams = {
              faCorrectionData,
              caseFiles: [responseCreateHousehold.registrationResponse.caseFile],
              tableName,
              fileName,
            };
            const generatedDataCorrectionFileData = await fixtureGenerateFaDataCorrectionXlsxFile(xlsxFileParamData);

            const mockRequestParamData: MockCreateMassActionXlsxFileRequestParams = {
              eventId: resultPrepareStateEvent.event.id,
              fileContents: generatedDataCorrectionFileData,
              massActionType: MassActionDataCorrectionType.FinancialAssistance,
              fileName,
            };
            const responseMassFinancialAssistance = await prepareStateMassActionXlsxFile(responseCreateHousehold.provider, 'data-correction', mockRequestParamData);
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
          processDataCorrectionFileSteps(householdQuantity, 'financial assistance records');
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
