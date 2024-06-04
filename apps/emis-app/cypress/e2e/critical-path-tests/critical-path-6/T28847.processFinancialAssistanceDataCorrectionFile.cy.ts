import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { EFinancialAmountModes } from '@libs/entities-lib/financial-assistance';
import { EPaymentModalities } from '@libs/entities-lib/program';
import { MassActionDataCorrectionType } from '@libs/entities-lib/mass-action';
import { MockCreateMassActionXlsxFileRequestParams } from '@libs/cypress-lib/mocks/mass-actions/massFinancialAssistance';
import { getToday } from '@libs/cypress-lib/helpers';
import { getUserName, getUserRoleDescription } from '@libs/cypress-lib/helpers/users';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import {
  AddFinancialAssistancePaymentParams,
  addFinancialAssistancePayment,
  createEventAndTeam,
  createProgramWithTableWithItemAndSubItem,
  prepareStateHousehold,
  prepareStateMassActionXlsxFile,
  submitFinancialAssistancePayment,
} from '../../helpers/prepareState';
import {
  GenerateFaDataCorrectionXlsxFileParams,
  GenerateRandomFaDataCorrectionParams,
  fixtureGenerateFaDataCorrectionXlsxFile, generateRandomFaDataCorrectionData,
} from '../../../fixtures/mass-action-data-correction';
import { processDataCorrectionFileSteps } from '../critical-path-3/canSteps';
import { BaseDetailsMassAction } from '../../../pages/mass-action/base/baseDetailsMassAction';
import { FinancialAssistanceHomePage } from '../../../pages/financial-assistance-payment/financialAssistanceHome.page';
import { CaseFilesHomePage } from '../../../pages/casefiles/caseFilesHome.page';

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
const fileName = 'T28847FaDataCorrectionFile';
const householdQuantity = 1;

describe('[T28847] Process a Financial Assistance data correction file', { tags: ['@financial-assistance', '@mass-actions'] }, () => {
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
              PaymentLineStatus: null,
              PaymentLineCancellationReason: null,
              ETag: getFinancialAssistancePayment.etag,
            };
            const xlsxFileParamData: GenerateFaDataCorrectionXlsxFileParams = {
              faCorrectionData,
              caseFiles: [responseCreateHousehold.registrationResponse.caseFile],
              tableName,
              fileName,
            };
            const faDataCorrectionDataObject = generateRandomFaDataCorrectionData(faCorrectionData);
            const generatedDataCorrectionFileData = await fixtureGenerateFaDataCorrectionXlsxFile(xlsxFileParamData);
            const mockRequestParamData: MockCreateMassActionXlsxFileRequestParams = {
              eventId: resultPrepareStateEvent.event.id,
              fileContents: generatedDataCorrectionFileData,
              massActionType: MassActionDataCorrectionType.DataCorrectionFinancialAssistance,
              fileName,
            };
            const responseMassFinancialAssistance = await prepareStateMassActionXlsxFile(responseCreateHousehold.provider, 'data-correction', mockRequestParamData);
            cy.wrap(faDataCorrectionDataObject.Name).as('faDataCorrectionName');
            cy.wrap(faDataCorrectionDataObject.Amount).as('faDataCorrectionAmount');
            cy.wrap(faDataCorrectionDataObject.PaymentModality).as('faDataCorrectionPaymentModality');
            cy.wrap(responseMassFinancialAssistance.name).as('massActionName');
            cy.wrap(responseCreateHousehold.registrationResponse.caseFile.caseFileNumber).as('caseFileNumber');
            cy.wrap(financialAssistancePayment.id).as('financialAssistancePaymentId');
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
        it('should successfully process a financial assistance data correction file.', function () {
          processDataCorrectionFileSteps(householdQuantity, 'financial assistance records', this.massActionName);
          const baseDetailsMassActionPage = new BaseDetailsMassAction();
          baseDetailsMassActionPage.getBackToMassActionListButton().should('be.enabled');
          baseDetailsMassActionPage.getMassActionType().should('eq', 'Financial Assistance');
          baseDetailsMassActionPage.getMassActionDateCreated().should('eq', getToday());
          baseDetailsMassActionPage.verifyAndGetMassActionCreatedBy(getUserName(roleName)).should('eq', getUserName(roleName));
          cy.goTo('casefile');
          const caseFilesHomePage = new CaseFilesHomePage();
          const caseFileDetailsPage = caseFilesHomePage.goToCaseFileDetail(this.caseFileNumber);
          caseFileDetailsPage.waitAndRefreshUntilCaseFileActivityVisibleWithBody(`${this.faDataCorrectionName} was data corrected`);
          caseFileDetailsPage.getUserName().should('eq', getUserName(roleName));
          caseFileDetailsPage.getRoleName().should('eq', `(${getUserRoleDescription(roleName)})`);
          caseFileDetailsPage.getCaseFileActivityTitle(0).should('eq', 'Financial assistance payment updated');
          caseFileDetailsPage.getCaseFileActivityBody(0).should('eq', `${this.faDataCorrectionName} was data corrected`);
          caseFileDetailsPage.getCaseFinancialAssistanceSubTag().click();
          const caseFinancialAssistanceHomePage = new FinancialAssistanceHomePage(); // need this to avoid dependency cycle
          caseFinancialAssistanceHomePage.getFAPaymentNameById(this.financialAssistancePaymentId).should('eq', this.faDataCorrectionName);
          caseFinancialAssistanceHomePage.getFAPaymentCreatedDate().should('eq', getToday());
          caseFinancialAssistanceHomePage.getFAPaymentAmount().should('eq', `$${this.faDataCorrectionAmount}.00`);
          caseFinancialAssistanceHomePage.getApprovalStatus().should('eq', 'Approved');
          caseFinancialAssistanceHomePage.expandFAPayment();
          caseFinancialAssistanceHomePage.getFAPaymentGroupTitle().should('string', this.faDataCorrectionPaymentModality);
          caseFinancialAssistanceHomePage.getFAPaymentGroupTotal().should('eq', `$${this.faDataCorrectionAmount}.00`);
          caseFinancialAssistanceHomePage.getFAPaymentPaymentStatus().should('eq', 'Status: In progress');
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
