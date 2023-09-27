import { UserRoles } from '@libs/cypress-lib/support/msal';
import { EFinancialAmountModes } from '@libs/entities-lib/financial-assistance';
import { formatCurrentDate } from '@libs/cypress-lib/helpers';
import { getUserName } from '@libs/cypress-lib/helpers/users';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { createProgramWithTableWithItemAndSubItem, createEventAndTeam, prepareStateMultipleHouseholds } from '../../helpers/prepareState';
import { fixtureBaseMassAction, fixtureGenerateFaCustomOptionsXlsxFile } from '../../../fixtures/mass-actions';
import { NewMassFinancialAssistancePage } from '../../../pages/mass-action/mass-financial-assistance/newMassFinancialAssistance.page';

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
const householdQuantity = 3;
const tableName = 'MassActionTable';
const fileName = 'faCustomOptionsFile';
const filePath = `cypress/downloads/${fileName}.xlsx`;

describe('#TC1829# - Pre-process a Financial Assistance custom file', { tags: ['@financial-assistance', '@mass-actions'] }, () => {
  describe('Can Roles', () => {
    for (const [roleName, roleValue] of Object.entries(canRoles)) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.getToken().then(async (tokenResponse) => {
            accessTokenL6 = tokenResponse.access_token;
            const resultPrepareStateEvent = await createEventAndTeam(accessTokenL6, allRolesValues);
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
            cy.login(roleValue);
            cy.goTo('mass-actions/financial-assistance-custom/create');
          });
        });
        afterEach(function () {
          if (this.teamCreated?.id && this.provider) {
            removeTeamMembersFromTeam(this.teamCreated.id, this.provider);
          }
        });
        // eslint-disable-next-line max-statements
        it('should successfully pre-process a financial assistance custom file', function () {
          fixtureGenerateFaCustomOptionsXlsxFile([this.caseFile1, this.caseFile2, this.caseFile3], this.faTable.id, tableName, fileName);
          const baseMassActionData = fixtureBaseMassAction(this.test.retries.length);

          const newMassFinancialAssistancePage = new NewMassFinancialAssistancePage();
          newMassFinancialAssistancePage.fillNameDescription(baseMassActionData);
          newMassFinancialAssistancePage.fillEvent(this.event.name.translation.en);
          newMassFinancialAssistancePage.uploadFile().selectFile(filePath, { force: true });
          newMassFinancialAssistancePage.clickNext();
          newMassFinancialAssistancePage.getDialogTitle().should('eq', 'Confirm pre-processing');
          newMassFinancialAssistancePage.getDialogText().should('eq', 'Are you sure you want to start pre-processing this mass action?');
          newMassFinancialAssistancePage.getDialogSubmitButton().should('be.visible');
          newMassFinancialAssistancePage.getDialogCancelButton().should('be.visible');

          const massFinancialAssistanceDetailsPage = newMassFinancialAssistancePage.confirmPreprocessing();
          massFinancialAssistanceDetailsPage.getPreProcessingLabelOne().should('eq', 'Please wait while the file is being pre-processed.');
          massFinancialAssistanceDetailsPage.getPreProcessingLabelTwo().should('eq', 'This might take a few minutes, depending on the number of case files');
          massFinancialAssistanceDetailsPage.refreshUntilCurrentProcessCompleteWithLabelString('next', baseMassActionData.name, ' Valid for processing ');
          massFinancialAssistanceDetailsPage.getMassActionStatus().contains('Pre-processed').should('be.visible');
          massFinancialAssistanceDetailsPage.getMassActionSuccessfulCaseFiles().then((quantity) => {
            if (quantity === householdQuantity.toString()) {
              massFinancialAssistanceDetailsPage.getMassActionProcessButton().should('be.enabled');
              massFinancialAssistanceDetailsPage.getInvalidCasefilesDownloadButton().should('be.disabled');
            } else {
              massFinancialAssistanceDetailsPage.getMassActionProcessButton().should('be.disabled');
              massFinancialAssistanceDetailsPage.getInvalidCasefilesDownloadButton().should('be.enabled');
            }
          });
          massFinancialAssistanceDetailsPage.getMassActionName().should('eq', baseMassActionData.name);
          massFinancialAssistanceDetailsPage.getMassActionDescription().should('eq', baseMassActionData.description);
          massFinancialAssistanceDetailsPage.getMassActionType().should('eq', 'Mass financial assistance - custom options');
          massFinancialAssistanceDetailsPage.getMassActionDateCreated().should('eq', formatCurrentDate());
          massFinancialAssistanceDetailsPage.verifyAndGetMassActionCreatedBy(getUserName(roleName)).should('eq', getUserName(roleName));
        });
      });
    }
  });
  describe('Cannot Roles', () => {
    for (const [roleName, roleValue] of Object.entries(cannotRoles)) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.login(roleValue);
          cy.goTo('mass-actions/financial-assistance-custom/create');
        });
        it('should not be able to pre-process a financial assistance custom file', () => {
          cy.contains('You do not have permission to access this page').should('be.visible');
        });
      });
    }
  });
});
