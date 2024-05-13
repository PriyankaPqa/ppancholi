import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { getToday } from '@libs/cypress-lib/helpers';
import {
  prepareStateEventAndProgram,
  prepareStateHousehold,
  createAndUpdateAssessment,
  addAssessmentToCasefile,
  completeAndSubmitCasefileAssessmentByCrcUser,
  CasefileAssessmentParams } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { CaseFileAssessmentDetailsPage } from '../../../pages/assessments/caseFileAssessmentDetails.page';

const canRoles = [
  UserRoles.level6,
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

const { filteredCanRoles, allRoles } = getRoles(canRoles, []);

let accessTokenL6 = '';

describe('[T28165] Confirm that responses to a completed Case File Assessment can be viewed', { tags: ['@assessments'] }, () => {
  before(() => {
    cy.getToken().then(async (tokenResponse) => {
      accessTokenL6 = tokenResponse.access_token;
      const { provider, event, team, program } = await prepareStateEventAndProgram(accessTokenL6, allRoles);
      const resultAssessment = await createAndUpdateAssessment(provider, event.id, program.id);
      const resultHousehold = await prepareStateHousehold(accessTokenL6, event);
      const resultCreateAssessmentResponse = await addAssessmentToCasefile(resultHousehold.provider, resultHousehold.registrationResponse.caseFile.id, resultAssessment.id);

      const completeAndSubmitCasefileAssessmentParamData: CasefileAssessmentParams = {
        provider: resultHousehold.provider,
        assessmentResponseId: resultCreateAssessmentResponse.id,
        casefileId: resultHousehold.registrationResponse.caseFile.id,
        assessmentFormId: resultAssessment.id,
      };
      const resultSubmittedAssessmentResponse = await completeAndSubmitCasefileAssessmentByCrcUser(completeAndSubmitCasefileAssessmentParamData);
      cy.wrap(provider).as('provider');
      cy.wrap(event).as('eventCreated');
      cy.wrap(team).as('teamCreated');
      cy.wrap(resultAssessment.name.translation.en).as('assessmentName');
      cy.wrap(resultHousehold.registrationResponse.caseFile.id).as('casefileId');
      cy.wrap(resultSubmittedAssessmentResponse.id).as('casefileAssessmentResponseId');
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
        beforeEach(function () {
          cy.login(roleName);
          cy.goTo(`casefile/${this.casefileId}/assessments/${this.casefileAssessmentResponseId}`);
        });
        it('should successfully view responses to a completed Case File Assessment', function () {
          const caseFileAssessmentDetailsPage = new CaseFileAssessmentDetailsPage();
          cy.contains(this.assessmentName).should('be.visible');
          caseFileAssessmentDetailsPage.getAssessmentStatus().should('eq', 'Completed');
          caseFileAssessmentDetailsPage.getAssessmentDateAssigned().should('eq', getToday());
          caseFileAssessmentDetailsPage.getAssessmentDateCompleted().should('eq', getToday());
          caseFileAssessmentDetailsPage.getAssessmentCompletedBy().should('eq', 'TestDev6');
          caseFileAssessmentDetailsPage.getAssessmentFirstQuestion().should('eq', 'Do you have school aged children ?');
          caseFileAssessmentDetailsPage.getAssessmentFirstResponse().should('eq', 'No');
          caseFileAssessmentDetailsPage.getAssessmentSecondQuestion().should('eq', 'Is you home livable ?');
          caseFileAssessmentDetailsPage.getAssessmentSecondResponse().should('eq', 'No');
          caseFileAssessmentDetailsPage.getBackToAssessmentButton().should('be.visible');
        });
      });
    }
  });
});
