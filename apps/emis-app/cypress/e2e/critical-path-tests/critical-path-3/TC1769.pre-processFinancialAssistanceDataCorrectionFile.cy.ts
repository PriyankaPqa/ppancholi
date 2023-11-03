import { UserRoles } from '@libs/cypress-lib/support/msal';
import { EFinancialAmountModes } from '@libs/entities-lib/financial-assistance';
import { EPaymentModalities } from '@libs/entities-lib/program';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import {
  addFinancialAssistancePayment,
  createEventAndTeam,
  createProgramWithTableWithItemAndSubItem,
  prepareStateHousehold,
  submitFinancialAssistancePayment } from '../../helpers/prepareState';
import { GenerateRandomFaDataCorrectionParams, fixtureGenerateFaDataCorrectionXlsxFile } from '../../../fixtures/mass-action-data-correction';
import { preprocessDataCorrectionFileCanSteps } from './canSteps';

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
const householdQuantity = 1;
const tableName = 'MassActionTable';
const fileName = 'faDataCorrectionFile';
const filePath = `cypress/downloads/${fileName}.xlsx`;
const dataCorrectionTypeDropDown = 'Financial Assistance';
const dataCorrectionTypeDataTest = 'Financial Assistance';

describe('#TC1769# - Pre-process a Financial Assistance data correction file', { tags: ['@financial-assistance', '@mass-actions'] }, () => {
  describe('Can Roles', () => {
    for (const [roleName, roleValue] of Object.entries(canRoles)) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.getToken().then(async (tokenResponse) => {
            accessTokenL6 = tokenResponse.access_token;
            const resultPrepareStateEvent = await createEventAndTeam(accessTokenL6, allRolesValues);
            // eslint-disable-next-line
            const resultCreateProgram = await createProgramWithTableWithItemAndSubItem(resultPrepareStateEvent.provider, resultPrepareStateEvent.event.id, EFinancialAmountModes.Fixed);
            const resultHousehold = await prepareStateHousehold(accessTokenL6, resultPrepareStateEvent.event);
            // eslint-disable-next-line
            const addedFinancialAssistancePayment = await addFinancialAssistancePayment(resultPrepareStateEvent.provider, EPaymentModalities.Cheque, resultHousehold.registrationResponse.caseFile.id, resultCreateProgram.table.id);
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
            cy.login(roleValue);
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

          fixtureGenerateFaDataCorrectionXlsxFile(faCorrectionData, [this.caseFile], tableName, fileName);

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
    for (const [roleName, roleValue] of Object.entries(cannotRoles)) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.login(roleValue);
          cy.goTo('mass-actions/data-correction/create');
        });
        it('should not be able to pre-process a financial assistance data correction file', () => {
          cy.contains('You do not have permission to access this page').should('be.visible');
        });
      });
    }
  });
});
