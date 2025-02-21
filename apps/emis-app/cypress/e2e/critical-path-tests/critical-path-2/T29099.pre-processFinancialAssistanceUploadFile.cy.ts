import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { EFinancialAmountModes } from '@libs/entities-lib/financial-assistance';
import { MassActionRunStatus } from '@libs/entities-lib/mass-action';
import { getToday } from '@libs/cypress-lib/helpers';
import { getUserName } from '@libs/cypress-lib/helpers/users';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { createProgramWithTableWithItemAndSubItem, createEventAndTeam, prepareStateMultipleHouseholds } from '../../helpers/prepareState';
import { MassFinancialAssistanceHomePage } from '../../../pages/mass-action/mass-financial-assistance/massFinancialAssistanceHome.page';
import { fixtureBaseMassAction, fixtureGenerateFaCsvFile, fixtureNewMassFinancialAssistance } from '../../../fixtures/mass-actions';

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
const filePath = 'cypress/downloads/faCustomFile.csv';

describe('[T29099] Pre-process a Financial Assistance upload file', { tags: ['@financial-assistance', '@mass-actions'] }, () => {
  describe('Can Roles', () => {
    for (const roleName of filteredCanRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.getToken().then(async (tokenResponse) => {
            accessTokenL6 = tokenResponse.access_token;
            const resultPrepareStateEvent = await createEventAndTeam(accessTokenL6, allRoles);
            // eslint-disable-next-line
            const resultCreateProgram = await createProgramWithTableWithItemAndSubItem(resultPrepareStateEvent.provider, resultPrepareStateEvent.event.id, EFinancialAmountModes.Fixed);
            const resultMultipleHousehold = await prepareStateMultipleHouseholds(accessTokenL6, resultPrepareStateEvent.event, householdQuantity);
            cy.wrap(resultPrepareStateEvent.provider).as('provider');
            cy.wrap(resultPrepareStateEvent.event).as('event');
            cy.wrap(resultPrepareStateEvent.team).as('teamCreated');
            cy.wrap(resultCreateProgram.table).as('faTable');
            cy.wrap(resultCreateProgram.program.name.translation.en).as('programName');
            cy.wrap(resultMultipleHousehold.householdsCreated[0].registrationResponse.caseFile).as('caseFile1');
            cy.wrap(resultMultipleHousehold.householdsCreated[1].registrationResponse.caseFile).as('caseFile2');
            cy.wrap(resultMultipleHousehold.householdsCreated[2].registrationResponse.caseFile).as('caseFile3');
            cy.login(roleName);
            cy.goTo('mass-actions/financial-assistance');
          });
        });
        afterEach(function () {
          if (this.teamCreated?.id && this.provider) {
            removeTeamMembersFromTeam(this.teamCreated.id, this.provider);
          }
        });
        // eslint-disable-next-line max-statements
        it('should successfully pre-process a financial assistance upload file', function () {
          fixtureGenerateFaCsvFile([this.caseFile1, this.caseFile2, this.caseFile3], this.faTable.id, filePath);
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
          newMassFinancialAssistancePage.getPaymentAmount().should('have.attr', 'disabled').and('contain', 'disabled');
          newMassFinancialAssistancePage.getPaymentAmount().should('have.attr', 'data-test').and('contain', `${newMassFinancialAssistanceData.paymentAmount}`);// verify fixed dollar amount reflected in data-test value
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
          massFinancialAssistanceDetailsPage.getMassActionStatus().contains('Pre-processed').should('be.visible');
          massFinancialAssistanceDetailsPage.getMassActionName().should('string', `${this.programName} - ${newMassFinancialAssistanceData.item}`);
          massFinancialAssistanceDetailsPage.getMassActionDescription().should('eq', baseMassActionData.description);
          massFinancialAssistanceDetailsPage.getMassActionProjectedAmount().should('string', `${parseFloat(newMassFinancialAssistanceData.paymentAmount) * householdQuantity}.00`);
          massFinancialAssistanceDetailsPage.getMassActionSuccessfulCaseFiles().should('eq', `${householdQuantity}`.toString());
          massFinancialAssistanceDetailsPage.getMassActionProcessButton().should('be.visible');
          massFinancialAssistanceDetailsPage.getMassActionType().should('eq', 'Financial assistance');
          massFinancialAssistanceDetailsPage.getMassActionDateCreated().should('eq', getToday());
          massFinancialAssistanceDetailsPage.getMassActionPaymentDetailsEvent().should('eq', this.event.name.translation.en);
          massFinancialAssistanceDetailsPage.getMassActionPaymentDetailsTable().should('eq', this.faTable.name.translation.en);
          massFinancialAssistanceDetailsPage.getMassActionPaymentDetailsProgram().should('eq', this.programName);
          massFinancialAssistanceDetailsPage.getMassActionPaymentDetailsItem().should('eq', newMassFinancialAssistanceData.item);
          massFinancialAssistanceDetailsPage.getMassActionPaymentDetailsSubItem().should('eq', newMassFinancialAssistanceData.subItem);
          massFinancialAssistanceDetailsPage.getMassActionPaymentDetailsPaymentModality().should('eq', newMassFinancialAssistanceData.paymentModality.toLowerCase());
          massFinancialAssistanceDetailsPage.verifyAndGetMassActionCreatedBy(getUserName(roleName)).should('eq', getUserName(roleName));
          massFinancialAssistanceDetailsPage.getMassActionPaymentDetailsPaymentAmount().should('eq', `$${newMassFinancialAssistanceData.paymentAmount}`);
          massFinancialAssistanceDetailsPage.getBackToMassActionListButton().should('be.visible');
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
        it('should not be able to pre-process a financial assistance upload file', () => {
          cy.contains('You do not have permission to access this page').should('be.visible');
        });
      });
    }
  });
});
