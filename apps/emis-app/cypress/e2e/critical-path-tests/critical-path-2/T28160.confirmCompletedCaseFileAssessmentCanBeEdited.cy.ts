import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { getToday } from '@libs/cypress-lib/helpers';
import { getUserName } from '@libs/cypress-lib/helpers/users';
import {
  prepareStateEventAndProgram,
  prepareStateHousehold,
  createAndUpdateAssessment,
  addAssessmentToCasefile,
  editCompletedCasefileAssessment,
  completeAndSubmitCasefileAssessmentByCrcUser,
  CasefileAssessmentParams } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { CaseFileAssessmentDetailsPage } from '../../../pages/assessments/caseFileAssessmentDetails.page';
import { AssessmentsListPage } from '../../../pages/assessmentsCasefile/assessmentsList.page';

const canRoles = [
  UserRoles.level6,
  UserRoles.level5,
  UserRoles.level4,
  UserRoles.level3,
];

const cannotRoles = [
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

describe('[T28160] Confirm that a Completed Case File Assessment can be edited', { tags: ['@assessments'] }, () => {
  before(() => {
    cy.getToken().then(async (tokenResponse) => {
      accessTokenL6 = tokenResponse.access_token;
      const { provider, event, team, program } = await prepareStateEventAndProgram(accessTokenL6, allRoles);
      const resultAssessment = await createAndUpdateAssessment(provider, event.id, program.id);
      cy.wrap(provider).as('provider');
      cy.wrap(event).as('eventCreated');
      cy.wrap(team).as('teamCreated');
      cy.wrap(resultAssessment.id).as('assessmentFormId');
      cy.wrap(resultAssessment.name.translation.en).as('assessmentName');
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
          cy.getToken(roleName).then(async function (tokenResponse) {
            const resultHousehold = await prepareStateHousehold(tokenResponse.access_token, this.eventCreated);
            const resultCreateAssessmentResponse = await addAssessmentToCasefile(resultHousehold.provider, resultHousehold.registrationResponse.caseFile.id, this.assessmentFormId);

            const completeAndSubmitCasefileAssessmentParamData: CasefileAssessmentParams = {
              provider: resultHousehold.provider,
              assessmentResponseId: resultCreateAssessmentResponse.id,
              casefileId: resultHousehold.registrationResponse.caseFile.id,
              assessmentFormId: this.assessmentFormId,
            };
            const resultSubmittedAssessmentResponse = await completeAndSubmitCasefileAssessmentByCrcUser(completeAndSubmitCasefileAssessmentParamData); // complete and submit assessment
            cy.wrap(completeAndSubmitCasefileAssessmentParamData).as('completeAndSubmitCasefileAssessmentParamData');
            cy.login(roleName);
            cy.goTo(`casefile/${resultHousehold.registrationResponse.caseFile.id}/assessments/${resultSubmittedAssessmentResponse.id}`);
          });
        });
        it('should successfully edit a completed Case File Assessment', function () {
          const editCompletedCasefileAssessmentParamData: CasefileAssessmentParams = {
            ...this.completeAndSubmitCasefileAssessmentParamData,
            answeredQuestionsHistory: this.answeredQuestionsHistory,
          };
          editCompletedCasefileAssessment(editCompletedCasefileAssessmentParamData); // edit already completed and submitted assessment

          const caseFileAssessmentDetailsPage = new CaseFileAssessmentDetailsPage();
          caseFileAssessmentDetailsPage.getAnswerHistoryButton().should('be.visible');
          caseFileAssessmentDetailsPage.getAnswerHistoryButton().should('have.attr', 'class').and('contains', 'v-btn--icon v-btn--round'); // checks availability of stopwatch icon
          caseFileAssessmentDetailsPage.getAnswerHistoryButton().click();
          caseFileAssessmentDetailsPage.getDialogAnswerHistoryResponseLogByIndex(0).contains('Original response').should('be.visible');
          caseFileAssessmentDetailsPage.getDialogAnswerHistoryResponseValueByIndex(0).should('eq', 'no');
          caseFileAssessmentDetailsPage.getDialogAnswerHistoryResponseLogByIndex(1).contains(getUserName(roleName)).should('be.visible');
          caseFileAssessmentDetailsPage.getDialogAnswerHistoryResponseLogByIndex(1).contains(getToday()).should('be.visible');
          caseFileAssessmentDetailsPage.getDialogAnswerHistoryResponseValueByIndex(1).should('eq', 'yes');
        });
      });
    }
  });
  describe('Cannot roles', () => {
    before(() => {
      cy.then(async function () {
        const resultHousehold = await prepareStateHousehold(accessTokenL6, this.eventCreated);
        const resultCreateAssessmentResponse = await addAssessmentToCasefile(resultHousehold.provider, resultHousehold.registrationResponse.caseFile.id, this.assessmentFormId);

        const completeAndSubmitCasefileAssessmentParamData: CasefileAssessmentParams = {
          provider: resultHousehold.provider,
          assessmentResponseId: resultCreateAssessmentResponse.id,
          casefileId: resultHousehold.registrationResponse.caseFile.id,
          assessmentFormId: this.assessmentFormId,
        };
        await completeAndSubmitCasefileAssessmentByCrcUser(completeAndSubmitCasefileAssessmentParamData);
        cy.wrap(resultHousehold.registrationResponse.caseFile.id).as('casefileId');
      });
    });
     for (const roleName of filteredCannotRoles) {
      describe(`${roleName}`, () => {
        beforeEach(function () {
          cy.login(roleName);
          cy.goTo(`casefile/${this.casefileId}/assessments`);
        });
        it('should not be able to edit a completed Case File Assessment', function () {
          const assessmentsListPage = new AssessmentsListPage();
          assessmentsListPage.getCompletedAssessmentTable().contains(this.assessmentName).should('be.visible');
          assessmentsListPage.getEditCompletedAssessmentButton().should('not.exist');
        });
      });
    }
  });
});
