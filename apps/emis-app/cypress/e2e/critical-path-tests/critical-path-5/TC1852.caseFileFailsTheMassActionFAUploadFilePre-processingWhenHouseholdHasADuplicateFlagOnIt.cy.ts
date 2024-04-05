import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { EFinancialAmountModes } from '@libs/entities-lib/financial-assistance';
import { MassActionRunStatus } from '@libs/entities-lib/mass-action';
import {
  createEventAndTeam,
  createProgramWithTableWithItemAndSubItem, creatingDuplicateHousehold,
} from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { fixtureBaseMassAction, fixtureGenerateFaCsvFile, fixtureNewMassFinancialAssistance } from '../../../fixtures/mass-actions';
import { MassFinancialAssistanceHomePage } from '../../../pages/mass-action/mass-financial-assistance/massFinancialAssistanceHome.page';

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
const filePath = 'cypress/downloads/faFile.csv';

describe('#TC1852# - Fails mass action FA upload file pre-processing when household has a duplicate flag on it', { tags: ['@case-file', '@mass-actions'] }, () => {
  before(() => {
    cy.getToken().then(async (tokenResponse) => {
      accessTokenL6 = tokenResponse.access_token;
      const resultCreatedEvent = await createEventAndTeam(accessTokenL6, allRoles);
      const resultCreateProgram = await createProgramWithTableWithItemAndSubItem(resultCreatedEvent.provider, resultCreatedEvent.event.id, EFinancialAmountModes.Fixed);
      cy.wrap(resultCreatedEvent.provider).as('provider');
      cy.wrap(resultCreatedEvent.event).as('event');
      cy.wrap(resultCreateProgram.table).as('faTable');
      cy.wrap(resultCreateProgram.program.name.translation.en).as('programName');
    });
  });

  after(function () {
    if (this.provider && this.teamCreated?.id) {
      removeTeamMembersFromTeam(this.teamCreated.id, this.provider);
    }
  });

  describe('Can Roles', () => {
    for (const roleName of filteredCanRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.then(async function () {
            const resultCreateDuplicateHousehold = await creatingDuplicateHousehold(accessTokenL6, this.event, this.provider);
            const { firstHousehold } = resultCreateDuplicateHousehold;
            cy.wrap(firstHousehold.registrationResponse.caseFile).as('originalCaseFile');
            cy.wrap(firstHousehold.registrationResponse.caseFile.id).as('originalCaseFileId');
            cy.wrap(firstHousehold.registrationResponse.caseFile.caseFileNumber).as('originalCaseFileNumber');
            cy.login(roleName);
            cy.goTo('mass-actions/financial-assistance');
          });
        });

        it('should successfully upload file but fail to preprocessing a file', function () {
          fixtureGenerateFaCsvFile([this.originalCaseFile], this.faTable.id, filePath);
          const baseMassActionData = fixtureBaseMassAction(this.test.retries.length);
          const newMassFinancialAssistanceData = fixtureNewMassFinancialAssistance();

          const massFinancialAssistanceHomePage = new MassFinancialAssistanceHomePage();
          massFinancialAssistanceHomePage.getAddMassFinancialAssistanceButton().click();

          const newMassFinancialAssistancePage = massFinancialAssistanceHomePage.selectProcessViaFileUpload();
          newMassFinancialAssistancePage.fillDescription(baseMassActionData);
          newMassFinancialAssistancePage.fillEvent(this.event.name.translation.en);
          newMassFinancialAssistancePage.fillTableName(this.faTable.name.translation.en);
          newMassFinancialAssistancePage.fillItemSubItem(newMassFinancialAssistanceData);
          newMassFinancialAssistancePage.fillPaymentModality(newMassFinancialAssistanceData.paymentModality);
          newMassFinancialAssistancePage.uploadFile().selectFile(filePath, { force: true });
          newMassFinancialAssistancePage.clickNext();
          newMassFinancialAssistancePage.getDialogTitle().should('eq', 'Confirm pre-processing');
          newMassFinancialAssistancePage.getDialogText().should('eq', 'Are you sure you want to start pre-processing this mass action?');
          newMassFinancialAssistancePage.getDialogConfirmSubmitButton().should('be.visible');
          newMassFinancialAssistancePage.getDialogConfirmCancelButton().should('be.visible');
          const massFinancialAssistanceDetailsPage = newMassFinancialAssistancePage.confirmPreprocessing();
          massFinancialAssistanceDetailsPage.getPreProcessingLabelOne().should('eq', 'Please wait while the file is being pre-processed.');
          massFinancialAssistanceDetailsPage.getPreProcessingLabelTwo().should('eq', 'This might take a few minutes, depending on the number of case files');
          cy.waitForMassActionToBe(MassActionRunStatus.PreProcessed);
          massFinancialAssistanceDetailsPage.getMassActionName().as('massActionName');
          massFinancialAssistanceDetailsPage.getMassActionStatus().contains('Pre-processed').should('be.visible');
          massFinancialAssistanceDetailsPage.getMassActionName().should('string', `${this.programName} - ${newMassFinancialAssistanceData.item}`);
          massFinancialAssistanceDetailsPage.clickShowErrorsButton();
          massFinancialAssistanceDetailsPage.getErrorMessage().should('string', 'Household has potential duplicates');
          massFinancialAssistanceDetailsPage.clickInvalidDownloadButton();

          cy.get('@massActionName').then((name) => {
            cy.readFile(`cypress/downloads/${name}.invalid.csv`, 'utf-8').then((fileContent) => {
              const expectedContent = `CaseFileId,CaseFileNumber,Reasons\r\n${this.originalCaseFileId},${this.originalCaseFileNumber},Household has potential duplicates\r\n`;
              expect(fileContent.trim()).to.equal(expectedContent.trim());
            });
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
          cy.goTo('mass-actions/financial-assistance');
        });
        it('should not be able to do the mass action FA', () => {
          cy.contains('You do not have permission to access this page').should('be.visible');
        });
      });
    }
  });
});
