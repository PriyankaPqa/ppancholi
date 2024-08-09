import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { MassActionRunStatus } from '@libs/entities-lib/mass-action';
import { getToday } from '@libs/cypress-lib/helpers';
import { getUserName } from '@libs/cypress-lib/helpers/users';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import {
  createAndUpdateAssessment,
  MassAssessmentsViaUploadFileParams,
  prepareStateCreateAndSearchHouseholds, prepareStateEventAndProgram, prepareStateMassAssessmentsViaUploadFile,
} from '../../helpers/prepareState';
import { MassAssessmentsDetailsPage } from '../../../pages/mass-action/assessments/massAssessmentsDetails.page';
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
const householdQuantity = 3;

describe('[T29033] Processed Mass Assessments upload file', { tags: ['@assessments', '@mass-actions'] }, () => {
  describe('Can Roles', () => {
    for (const roleName of filteredCanRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.getToken().then(async (tokenResponse) => {
            accessTokenL6 = tokenResponse.access_token;
            const { provider, event, team, program } = await prepareStateEventAndProgram(accessTokenL6, allRoles);
            const resultAssessment = await createAndUpdateAssessment(provider, event.id, program.id);
            const resultCreateHouseholds = await prepareStateCreateAndSearchHouseholds(tokenResponse.access_token, event, householdQuantity);
            const massAssessmentsUploadFileParamData: MassAssessmentsViaUploadFileParams = {
                provider: resultCreateHouseholds.responseCreateHouseholds.provider,
                caseFiles: [resultCreateHouseholds.caseFileCreated1, resultCreateHouseholds.caseFileCreated2, resultCreateHouseholds.caseFileCreated3],
                event,
                filePath: 'cypress/downloads/T29033MassAssessments.csv',
                assessmentFormId: resultAssessment.id,
                emailSubject: { en: 'mock-email-subject-en', fr: 'mock-email-subject-fr' },
                emailTopCustomContent: { en: 'mock-message-en', fr: 'mock-message-fr' },
                emailAdditionalDescription: { en: 'mock-message-en', fr: 'mock-message-fr' },
              };

            const resultMassActionCaseFileStatusViaUploadFile = await prepareStateMassAssessmentsViaUploadFile(massAssessmentsUploadFileParamData);
            cy.wrap(provider).as('provider');
            cy.wrap(team).as('teamCreated');
            cy.wrap(event).as('event');
            cy.wrap(event.name.translation.en).as('eventName');
            cy.wrap(resultMassActionCaseFileStatusViaUploadFile.mockRequestParamData.emailSubject.en).as('emailSubject');
            cy.wrap(resultMassActionCaseFileStatusViaUploadFile.mockRequestParamData.emailTopCustomContent.en).as('emailTopCustomContent');
            cy.wrap(resultMassActionCaseFileStatusViaUploadFile.mockRequestParamData.emailAdditionalDescription.en).as('emailAdditionalDescription');
            cy.wrap(resultAssessment.name.translation.en).as('assessmentName');
            cy.wrap(resultMassActionCaseFileStatusViaUploadFile.responseMassAssessmentsUpdate).as('responseMassCommunicationUpdate');
            cy.wrap(resultCreateHouseholds.caseFileCreated1.caseFileNumber).as('caseFileNumber1');
            cy.wrap(resultMassActionCaseFileStatusViaUploadFile.responseMassAssessmentsUpdate.name).as('massActionName');
            cy.login(roleName);
            cy.goTo(`mass-actions/assessments/details/${resultMassActionCaseFileStatusViaUploadFile.responseMassAssessmentsUpdate.id}`);
          });
        });
        afterEach(function () {
          if (this.teamCreated?.id && this.provider) {
            removeTeamMembersFromTeam(this.teamCreated.id, this.provider);
          }
        });
        // eslint-disable-next-line
        it('should successfully process mass assessments via upload file', function () {
          const massAssessmentsDetailsPage = new MassAssessmentsDetailsPage();
          cy.waitForMassActionToBe(MassActionRunStatus.PreProcessed, false);
          massAssessmentsDetailsPage.getMassActionProcessButton().should('be.visible');
          massAssessmentsDetailsPage.getMassActionProcessButton().click();
          massAssessmentsDetailsPage.getDialogText().should('eq', 'Are you sure you want to start processing this mass action?');
          massAssessmentsDetailsPage.getDialogConfirmCancelButton().should('be.visible');
          massAssessmentsDetailsPage.getDialogConfirmSubmitButton().should('be.visible');
          cy.interceptAndValidateCondition({
            httpMethod: 'POST',
            url: 'case-file/mass-actions/**/run',
            actionsCallback: () => {
              massAssessmentsDetailsPage.confirmProcessing();
              massAssessmentsDetailsPage.getPreProcessingLabelOne().should('eq', 'Please wait while the case files are being processed.');
              massAssessmentsDetailsPage.getPreProcessingLabelTwo().should('eq', 'This might take a few minutes depending on the number of processed case files.');
            },
            conditionCallBack: (interception) => (interception.response.statusCode === 200),
            actionsWhenValidationPassed: () => {
              cy.log('Mass communication processed successfully.');
            },
            actionsWhenValidationFailed: () => {
              throw Error('Mass action mass communication not processed');
            },
            alias: 'MassCommunication',
          });
          massAssessmentsDetailsPage.waitAndRefreshUntilMassActionStatusUpdated(this.massActionName, 'Processed');
          massAssessmentsDetailsPage.getMassActionStatus().contains('Processed').should('be.visible');
          massAssessmentsDetailsPage.getMassActionSuccessfulCaseFiles().then((quantity) => {
            if (quantity === householdQuantity.toString()) {
              massAssessmentsDetailsPage.getInvalidCasefilesDownloadButton().should('be.disabled');
            } else {
              massAssessmentsDetailsPage.getInvalidCasefilesDownloadButton().should('be.enabled');
            }
          });
          massAssessmentsDetailsPage.getMassActionType().should('eq', 'Assessment');
          massAssessmentsDetailsPage.getMassActionDateCreated().should('eq', getToday());
          massAssessmentsDetailsPage.verifyAndGetMassActionCreatedBy(getUserName(roleName)).should('eq', getUserName(roleName));
          massAssessmentsDetailsPage.getMassAssessmentEvent().should('eq', this.eventName);
          massAssessmentsDetailsPage.getMassAssessmentName().should('eq', this.assessmentName);
          massAssessmentsDetailsPage.getEmailSubject().should('eq', this.emailSubject);
          massAssessmentsDetailsPage.getContentBeforeLink().should('eq', this.emailTopCustomContent);
          massAssessmentsDetailsPage.getContentAfterLink().should('eq', this.emailAdditionalDescription);
          massAssessmentsDetailsPage.getBackToMassActionListButton().should('be.visible');
          cy.goTo('casefile');
          const caseFilesHomePage = new CaseFilesHomePage();
          caseFilesHomePage.searchCaseFileTableFor(this.caseFileNumber1);
          const caseFileDetailsPage = caseFilesHomePage.goToCaseFileDetail(this.caseFileNumber1);
          caseFileDetailsPage.waitAndRefreshUntilCaseFileActivityVisibleWithBody(`${this.assessmentName} has been added to the case file`);
          caseFileDetailsPage.getRoleNameSystemAdmin().should('eq', 'System Admin');
          caseFileDetailsPage.getCaseFileActivityTitle().should('string', 'Assessment added');
          caseFileDetailsPage.getCaseFileActivityBody().should('string', `${this.assessmentName} has been added to the case file`);
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
        it('should not be able to process mass assessments via upload file', () => {
          cy.contains('You do not have permission to access this page').should('be.visible');
        });
      });
    }
  });
});
