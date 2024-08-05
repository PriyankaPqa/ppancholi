import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { MassActionRunStatus } from '@libs/entities-lib/mass-action';
import { getToday } from '@libs/cypress-lib/helpers';
import { getUserName } from '@libs/cypress-lib/helpers/users';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import {
  createAndUpdateAssessment,
  prepareStateEventAndProgram, prepareStateHousehold,
} from '../../helpers/prepareState';
import { fixtureBaseMassAction, fixtureNewMassAssessment, writeCSVContentToFile } from '../../../fixtures/mass-actions';
import { MassAssessmentsHomePage } from '../../../pages/mass-action/assessments/massAssessmentsHome.page';

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
const filePath = 'cypress/downloads/T29032MassAssessmentsFile.csv';

describe('[T29032] Pre-process mass communication upload file', { tags: ['@assessments', '@mass-actions'] }, () => {
  describe('Can Roles', () => {
    for (const roleName of filteredCanRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.getToken().then(async (tokenResponse) => {
            accessTokenL6 = tokenResponse.access_token;
            const { provider, event, team, program } = await prepareStateEventAndProgram(accessTokenL6, allRoles);
            const resultAssessment = await createAndUpdateAssessment(provider, event.id, program.id);
            const resultHousehold = await prepareStateHousehold(accessTokenL6, event);
            cy.wrap(resultHousehold.registrationResponse.caseFile.id).as('caseFileId');
            cy.wrap(provider).as('provider');
            cy.wrap(event).as('eventCreated');
            cy.wrap(event.name.translation.en).as('eventName');
            cy.wrap(team).as('teamCreated');
            cy.wrap(resultAssessment.id).as('assessmentFormId');
            cy.wrap(resultAssessment.name.translation.en).as('assessmentName');
            cy.login(roleName);
            cy.goTo('mass-actions/assessments');
          });
        });
        afterEach(function () {
          if (this.teamCreated?.id && this.provider) {
            removeTeamMembersFromTeam(this.teamCreated.id, this.provider);
          }
        });
        it('should successfully pre-process mass assessments upload file', function () {
          const baseMassActionData = fixtureBaseMassAction(this.test.retries.length);
          const massAssessmentsData = fixtureNewMassAssessment();
          writeCSVContentToFile(filePath, [{
            CaseFileId: this.caseFileId,
          }]);
          const massAssessmentsHomePage = new MassAssessmentsHomePage();
          massAssessmentsHomePage.getAddNewMassAssessmentsButton().click();
          const newMassAssessmentsPage = massAssessmentsHomePage.goToCreateMassAssessmentsViaFileUploadPage();
          newMassAssessmentsPage.fillNameDescription(baseMassActionData);
          newMassAssessmentsPage.fillEventName(this.eventName);
          newMassAssessmentsPage.fillAssessmentName(this.assessmentName);
          newMassAssessmentsPage.fillSubject(massAssessmentsData.subjectContent);
          newMassAssessmentsPage.fillContentBeforeLink(massAssessmentsData.contentBeforeLink);
          newMassAssessmentsPage.fillContentAfterLink(massAssessmentsData.contentAfterLink);
          newMassAssessmentsPage.uploadFile().selectFile(filePath, { force: true });
          newMassAssessmentsPage.clickNext();
          newMassAssessmentsPage.getDialogTitle().should('eq', 'Confirm pre-processing');
          newMassAssessmentsPage.getDialogText().should('eq', 'Are you sure you want to start pre-processing this mass action?');
          newMassAssessmentsPage.getDialogConfirmSubmitButton().should('be.visible');
          newMassAssessmentsPage.getDialogConfirmCancelButton().should('be.visible');

          const massAssessmentsDetailsPage = newMassAssessmentsPage.confirmPreprocessing();
          massAssessmentsDetailsPage.getPreProcessingLabelOne().should('eq', 'Please wait while the file is being pre-processed.');
          massAssessmentsDetailsPage.getPreProcessingLabelTwo().should('eq', 'This might take a few minutes, depending on the number of case files');
          cy.waitForMassActionToBe(MassActionRunStatus.PreProcessed);
          massAssessmentsDetailsPage.getMassActionStatus().contains('Pre-processed').should('be.visible');
          massAssessmentsDetailsPage.getDeleteButton().should('be.enabled');
          massAssessmentsDetailsPage.getEditButton().should('be.enabled');
          massAssessmentsDetailsPage.getMassActionSuccessfulCaseFiles().then((quantity) => {
            if (quantity === '1') {
              massAssessmentsDetailsPage.getMassActionProcessButton().should('be.enabled');
              massAssessmentsDetailsPage.getInvalidCasefilesDownloadButton().should('be.disabled');
            } else {
              massAssessmentsDetailsPage.getMassActionProcessButton().should('be.disabled');
              massAssessmentsDetailsPage.getInvalidCasefilesDownloadButton().should('be.enabled');
            }
          });
          massAssessmentsDetailsPage.getMassActionName().should('string', baseMassActionData.name);
          massAssessmentsDetailsPage.getMassActionDescription().should('eq', baseMassActionData.description);
          massAssessmentsDetailsPage.getMassActionProcessButton().should('be.enabled');
          massAssessmentsDetailsPage.getInvalidCasefilesDownloadButton().should('be.disabled');
          massAssessmentsDetailsPage.getMassActionType().should('eq', 'Assessment');
          massAssessmentsDetailsPage.getMassActionDateCreated().should('eq', getToday());
          massAssessmentsDetailsPage.verifyAndGetMassActionCreatedBy(getUserName(roleName)).should('eq', getUserName(roleName));
          massAssessmentsDetailsPage.getMassAssessmentEvent().should('eq', this.eventName);
          massAssessmentsDetailsPage.getEmailSubject().should('eq', massAssessmentsData.subjectContent);
          massAssessmentsDetailsPage.getContentBeforeLink().should('eq', massAssessmentsData.contentBeforeLink);
          massAssessmentsDetailsPage.getContentAfterLink().should('eq', massAssessmentsData.contentAfterLink);
          massAssessmentsDetailsPage.getBackToMassActionListButton().should('be.visible');
        });
      });
    }
  });
  describe('Cannot Roles', () => {
     for (const roleName of filteredCannotRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.login(roleName);
          cy.goTo('mass-actions/assessments');
        });
        it('should not be able to pre-process mass assessments upload file', () => {
          cy.contains('You do not have permission to access this page').should('be.visible');
        });
      });
    }
  });
});
