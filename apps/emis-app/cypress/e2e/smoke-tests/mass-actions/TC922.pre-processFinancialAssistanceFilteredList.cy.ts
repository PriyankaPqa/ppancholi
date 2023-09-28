import { UserRoles } from '@libs/cypress-lib/support/msal';
import { EFinancialAmountModes } from '@libs/entities-lib/financial-assistance';
import { ICaseFileEntity } from '@libs/entities-lib/case-file';
import { formatCurrentDate } from '@libs/cypress-lib/helpers';
import { getUserName } from '@libs/cypress-lib/helpers/users';
import { MassActionRunStatus } from '@libs/entities-lib/mass-action';
import { fixtureBaseMassAction, fixtureNewMassFinancialAssistance } from '../../../fixtures/mass-actions';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { createEventAndTeam, createProgramWithTableWithItemAndSubItem, prepareStateMultipleHouseholds } from '../../helpers/prepareState';
import { MassFinancialAssistanceHomePage } from '../../../pages/mass-action/mass-financial-assistance/massFinancialAssistanceHome.page';

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
let caseFileCreated1 = null as ICaseFileEntity;
let caseFileCreated2 = null as ICaseFileEntity;
let caseFileCreated3 = null as ICaseFileEntity;
const householdQuantity = 3;

describe('#TC922# - Pre-process a Financial Assistance filtered list', { tags: ['@financial-assistance', '@mass-actions'] }, () => {
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
            caseFileCreated1 = resultMultipleHousehold.householdsCreated[0].registrationResponse.caseFile;
            caseFileCreated2 = resultMultipleHousehold.householdsCreated[1].registrationResponse.caseFile;
            caseFileCreated3 = resultMultipleHousehold.householdsCreated[2].registrationResponse.caseFile;
            cy.wrap(resultPrepareStateEvent.provider).as('provider');
            cy.wrap(resultPrepareStateEvent.event).as('event');
            cy.wrap(resultPrepareStateEvent.team).as('teamCreated');
            cy.wrap(resultCreateProgram.table).as('faTable');
            cy.wrap(resultCreateProgram.program.name.translation.en).as('programName');
            cy.login(roleValue);
            cy.goTo('mass-actions/financial-assistance');
          });
        });
        afterEach(function () {
          if (this.teamCreated?.id && this.provider) {
            removeTeamMembersFromTeam(this.teamCreated.id, this.provider);
          }
        });
        // eslint-disable-next-line max-statements
        it('should successfully pre-process a financial assistance filtered list', function () {
          const baseMassActionData = fixtureBaseMassAction(this.test.retries.length);
          const newMassFinancialAssistanceData = fixtureNewMassFinancialAssistance();

          const massFinancialAssistanceHomePage = new MassFinancialAssistanceHomePage();
          massFinancialAssistanceHomePage.getAddMassFinancialAssistanceButton().click();

          const massActionViaListPage = massFinancialAssistanceHomePage.selectProcessViaFilteredList();
          massActionViaListPage.addFilter();
          massActionViaListPage.enterEventName(this.event.name.translation.en);
          massActionViaListPage.applyFilter();
          massActionViaListPage.getCaseFileTable().contains(caseFileCreated1.caseFileNumber).should('be.visible');
          massActionViaListPage.getCaseFileTable().contains(caseFileCreated2.caseFileNumber).should('be.visible');
          massActionViaListPage.getCaseFileTable().contains(caseFileCreated3.caseFileNumber).should('be.visible');

          const newMassFinancialAssistancePage = massActionViaListPage.goToNewMassFinancialAssistancePage();
          newMassFinancialAssistancePage.fillNameDescription(baseMassActionData);
          newMassFinancialAssistancePage.fillEvent(this.event.name.translation.en);
          newMassFinancialAssistancePage.fillTableName(this.faTable.name.translation.en);
          newMassFinancialAssistancePage.fillItemSubItem(newMassFinancialAssistanceData);
          newMassFinancialAssistancePage.fillPaymentModality(newMassFinancialAssistanceData.paymentModality);
          newMassFinancialAssistancePage.getPaymentAmount().should('have.attr', 'disabled').and('contain', 'disabled');
          newMassFinancialAssistancePage.getPaymentAmount().should('have.attr', 'data-test').and('contain', `${newMassFinancialAssistanceData.paymentAmount}`);// verify fixed dollar amount which is reflected in data-test value
          newMassFinancialAssistancePage.clickNext();
          newMassFinancialAssistancePage.getDialogTitle().should('eq', 'Confirm pre-processing');
          newMassFinancialAssistancePage.getDialogText().should('eq', 'Are you sure you want to start pre-processing this mass action?');
          newMassFinancialAssistancePage.getDialogSubmitButton().should('be.visible');
          newMassFinancialAssistancePage.getDialogCancelButton().should('be.visible');

          const massFinancialAssistanceDetailsPage = newMassFinancialAssistancePage.confirmPreprocessing();
          cy.waitForMassActionToBe(MassActionRunStatus.PreProcessed);
          massFinancialAssistanceDetailsPage.getMassActionStatus().contains('Pre-processed').should('be.visible');
          massFinancialAssistanceDetailsPage.getMassActionName().should('eq', baseMassActionData.name);
          massFinancialAssistanceDetailsPage.getMassActionDescription().should('eq', baseMassActionData.description);
          massFinancialAssistanceDetailsPage.getMassActionProjectedAmount().should('string', `${parseFloat(newMassFinancialAssistanceData.paymentAmount) * householdQuantity}.00`);
          massFinancialAssistanceDetailsPage.getMassActionSuccessfulCaseFiles().should('eq', `${householdQuantity}`.toString());
          massFinancialAssistanceDetailsPage.getMassActionProcessButton().should('be.visible');
          massFinancialAssistanceDetailsPage.getMassActionType().should('eq', 'Financial assistance');
          massFinancialAssistanceDetailsPage.getMassActionDateCreated().should('eq', formatCurrentDate());
          massFinancialAssistanceDetailsPage.getMassActionPaymentDetailsEvent().should('eq', this.event.name.translation.en);
          massFinancialAssistanceDetailsPage.getMassActionPaymentDetailsTable().should('eq', this.faTable.name.translation.en);
          massFinancialAssistanceDetailsPage.getMassActionPaymentDetailsProgram().should('eq', this.programName);
          massFinancialAssistanceDetailsPage.getMassActionPaymentDetailsItem().should('eq', newMassFinancialAssistanceData.item);
          massFinancialAssistanceDetailsPage.getMassActionPaymentDetailsSubItem().should('eq', newMassFinancialAssistanceData.subItem);
          massFinancialAssistanceDetailsPage.getMassActionPaymentDetailsPaymentModality().should('eq', newMassFinancialAssistanceData.paymentModality.toLowerCase());
          massFinancialAssistanceDetailsPage.verifyAndGetMassActionCreatedBy().should('eq', getUserName(roleName));
          massFinancialAssistanceDetailsPage.getMassActionPaymentDetailsPaymentAmount().should('eq', `$${newMassFinancialAssistanceData.paymentAmount}`);
        });
      });
    }
  });
  describe('Cannot Roles', () => {
    for (const [roleName, roleValue] of Object.entries(cannotRoles)) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.login(roleValue);
          cy.goTo('mass-actions/financial-assistance');
        });
        it('should not be able to pre-process a financial assistance filtered list', () => {
          cy.contains('You do not have permission to access this page').should('be.visible');
        });
      });
    }
  });
});
