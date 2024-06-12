import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import {
  prepareStateEventAndProgram,
  prepareStateHousehold,
  createAndUpdateAssessment,
  addAssessmentToCasefile,
  completeAndSubmitCasefileAssessment,
  CasefileAssessmentParams } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { verifyFullyCompletedCaseFileAssessment } from './canSteps';
import { AssessmentsListPage } from '../../../pages/assessmentsCasefile/assessmentsList.page';

const canRoles = [
  UserRoles.level6,
  UserRoles.level5,
  UserRoles.level4,
  UserRoles.level3,
  UserRoles.level2,
  UserRoles.level1,
  UserRoles.level0,
  UserRoles.contributor3,
  UserRoles.contributor2,
  UserRoles.contributor1,
  UserRoles.readonly,
];

const { filteredCanRoles } = getRoles(canRoles, []);

let accessTokenL6 = '';

describe('[T28158] Confirm that Beneficiary can complete a Case File Assessment', { tags: ['@assessments'] }, () => {
  before(() => {
    cy.getToken().then(async (tokenResponse) => {
      accessTokenL6 = tokenResponse.access_token;
      const { provider, event, team, program } = await prepareStateEventAndProgram(accessTokenL6, filteredCanRoles);
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
          cy.then(async function () {
            const resultHousehold = await prepareStateHousehold(accessTokenL6, this.eventCreated);
            const resultCreateAssessmentResponse = await addAssessmentToCasefile(resultHousehold.provider, resultHousehold.registrationResponse.caseFile.id, this.assessmentFormId);
            cy.wrap(resultHousehold).as('householdCreated');
            cy.wrap(resultCreateAssessmentResponse).as('casefileAssessment');
            cy.wrap(resultCreateAssessmentResponse.id).as('casefileAssessmentId');
            cy.login(roleName);
            cy.goTo(`casefile/${resultHousehold.registrationResponse.caseFile.id}/assessments`);
          });
        });
        it('should successfully complete a Case File Assessment', function () {
          const assessmentsListPage = new AssessmentsListPage();

          const casefileAssessmentParamData: CasefileAssessmentParams = {
            provider: this.householdCreated.provider,
            assessmentResponseId: this.casefileAssessment.id,
            casefileId: this.householdCreated.registrationResponse.caseFile.id,
            assessmentFormId: this.assessmentFormId,
          };
          completeAndSubmitCasefileAssessment(casefileAssessmentParamData); // completely respond to assessment as a beneficiary and click on submit
          assessmentsListPage.refreshUntilFilledAssessmentUpdatedWithStatus(this.casefileAssessmentId, 'Completed');
          verifyFullyCompletedCaseFileAssessment(roleName, this.assessmentName);
        });
      });
    }
  });
});
