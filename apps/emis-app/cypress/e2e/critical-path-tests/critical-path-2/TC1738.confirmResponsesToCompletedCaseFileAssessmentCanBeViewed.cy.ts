import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getToday } from '@libs/cypress-lib/helpers';
import {
  prepareStateEventAndProgram,
  prepareStateHousehold,
  createAndUpdateAssessment,
  addAssessmentToCasefile,
  completeAndSubmitCasefileAssessmentByCrcUser } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { CaseFileAssessmentDetailsPage } from '../../../pages/assessments/caseFileAssessmentDetails.page';

const canRoles = {
  Level6: UserRoles.level6,
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

const allRolesValues = [...Object.values(canRoles)];

let accessTokenL6 = '';

describe('#TC1738# - Confirm that responses to a completed Case File Assessment can be viewed', { tags: ['@assessments'] }, () => {
  before(() => {
    cy.getToken().then(async (tokenResponse) => {
      accessTokenL6 = tokenResponse.access_token;
      const { provider, event, team, program } = await prepareStateEventAndProgram(accessTokenL6, allRolesValues);
      const resultAssessment = await createAndUpdateAssessment(provider, event.id, program.id);
      const resultHousehold = await prepareStateHousehold(accessTokenL6, event);
      const resultCreateAssessmentResponse = await addAssessmentToCasefile(resultHousehold.provider, resultHousehold.registrationResponse.caseFile.id, resultAssessment.id);
      // eslint-disable-next-line
      const resultSubmittedAssessmentResponse = await completeAndSubmitCasefileAssessmentByCrcUser(resultHousehold.provider, resultCreateAssessmentResponse.id, resultHousehold.registrationResponse.caseFile.id, resultAssessment.id); //complete and submit assessment
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
    for (const [roleName, roleValue] of Object.entries(canRoles)) {
      describe(`${roleName}`, () => {
        beforeEach(function () {
          cy.login(roleValue);
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
