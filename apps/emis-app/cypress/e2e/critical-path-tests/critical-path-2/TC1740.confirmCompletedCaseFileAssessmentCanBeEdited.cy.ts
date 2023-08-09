import { UserRoles } from '@libs/cypress-lib/support/msal';
import { formatCurrentDate } from '@libs/cypress-lib/helpers';
import { getUserName } from '@libs/cypress-lib/helpers/users';
import {
  prepareStateEventAndProgram,
  prepareStateHousehold,
  createAndUpdateAssessment,
  addAssessmentToCasefile,
  editCompletedCasefileAssessment,
  completeAndSubmitCasefileAssessmentByCrcUser } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { CaseFileAssessmentDetailsPage } from '../../../pages/assessments/caseFileAssessmentDetails.page';
import { AssessmentsListPage } from '../../../pages/assessmentsCasefile/assessmentsList.page';

const canRoles = {
  Level6: UserRoles.level6,
  Level5: UserRoles.level5,
  Level4: UserRoles.level4,
  Level3: UserRoles.level3,
};

const cannotRoles = {
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

describe('#TC1740# - Confirm that a Completed Case File Assessment can be edited', { tags: ['@assessments'] }, () => {
  before(() => {
    cy.getToken().then(async (tokenResponse) => {
      accessTokenL6 = tokenResponse.access_token;
      const { provider, event, team, program } = await prepareStateEventAndProgram(accessTokenL6, allRolesValues);
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
    for (const [roleName, roleValue] of Object.entries(canRoles)) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.getToken(roleValue).then(async function (tokenResponse) {
            const resultHousehold = await prepareStateHousehold(tokenResponse.access_token, this.eventCreated);
            const resultCreateAssessmentResponse = await addAssessmentToCasefile(resultHousehold.provider, resultHousehold.registrationResponse.caseFile.id, this.assessmentFormId);
            // eslint-disable-next-line
            const resultSubmittedAssessmentResponse = await completeAndSubmitCasefileAssessmentByCrcUser(resultHousehold.provider, resultCreateAssessmentResponse.id, resultHousehold.registrationResponse.caseFile.id, this.assessmentFormId); //complete and submit assessment
            cy.wrap(resultHousehold).as('householdCreated');
            cy.wrap(resultCreateAssessmentResponse).as('casefileAssessment');
            cy.login(roleValue);
            cy.goTo(`casefile/${resultHousehold.registrationResponse.caseFile.id}/assessments/${resultSubmittedAssessmentResponse.id}`);
          });
        });
        it('should successfully edit a completed Case File Assessment', function () {
          // eslint-disable-next-line
          editCompletedCasefileAssessment(this.householdCreated.provider, this.casefileAssessment.id, this.householdCreated.registrationResponse.caseFile.id, this.assessmentFormId, this.answeredQuestionsHistory); //edit already completed and submitted assessment

          const caseFileAssessmentDetailsPage = new CaseFileAssessmentDetailsPage();
          caseFileAssessmentDetailsPage.getAnswerHistoryButton().should('be.visible');
          caseFileAssessmentDetailsPage.getAnswerHistoryButton().should('have.attr', 'class').and('contains', 'v-btn--icon v-btn--round'); // checks availability of stopwatch icon
          caseFileAssessmentDetailsPage.getAnswerHistoryButton().click();
          caseFileAssessmentDetailsPage.getDialogAnswerHistoryResponseLogByIndex(0).contains('Original response').should('be.visible');
          caseFileAssessmentDetailsPage.getDialogAnswerHistoryResponseValueByIndex(0).should('eq', 'no');
          caseFileAssessmentDetailsPage.getDialogAnswerHistoryResponseLogByIndex(1).contains(getUserName(roleName)).should('be.visible');
          caseFileAssessmentDetailsPage.getDialogAnswerHistoryResponseLogByIndex(1).contains(formatCurrentDate()).should('be.visible');
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
        // eslint-disable-next-line
        await completeAndSubmitCasefileAssessmentByCrcUser(resultHousehold.provider, resultCreateAssessmentResponse.id, resultHousehold.registrationResponse.caseFile.id, this.assessmentFormId); //complete and submit assessment
        cy.wrap(resultHousehold.registrationResponse.caseFile.id).as('casefileId');
      });
    });
    for (const [roleName, roleValue] of Object.entries(cannotRoles)) {
      describe(`${roleName}`, () => {
        beforeEach(function () {
          cy.login(roleValue);
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
