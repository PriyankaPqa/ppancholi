import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import {
  prepareStateEventAndProgram,
  prepareStateHousehold,
  createAndUpdateAssessment,
  addAssessmentToCasefile,
  partiallyCompleteCasefileAssessment,
  CasefileAssessmentParams } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { AssessmentsListPage } from '../../../pages/assessmentsCasefile/assessmentsList.page';
import { verifyPartiallyCompletedCaseFileAssessment, verifyPendingCaseFileAssessment } from './canSteps';

const canRoles = [
  UserRoles.level6,
  UserRoles.level5,
  UserRoles.level4,
  UserRoles.level3,
  UserRoles.level2,
  UserRoles.level1,
  UserRoles.level0,
];

const cannotRoles = [
  UserRoles.contributor3,
  UserRoles.contributor2,
  UserRoles.contributor1,
  UserRoles.readonly,
];

const { filteredCanRoles, filteredCannotRoles, allRoles } = getRoles(canRoles, cannotRoles);

let accessTokenL6 = '';

describe('[T28163] Confirm that the CRC User can partially complete a Case File Assessment', { tags: ['@assessments'] }, () => {
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
        it('should successfully partially complete a Case File Assessment', function () {
          const assessmentsListPage = new AssessmentsListPage();
          assessmentsListPage.refreshUntilPendingAssessmentDisplayed();
          verifyPendingCaseFileAssessment(roleName, this.assessmentName);
          cy.wrap(1).then(() => {
            const casefileAssessmentParamData: CasefileAssessmentParams = {
              provider: this.householdCreated.provider,
              assessmentResponseId: this.casefileAssessment.id,
              casefileId: this.householdCreated.registrationResponse.caseFile.id,
              assessmentFormId: this.assessmentFormId,
            };
            partiallyCompleteCasefileAssessment(casefileAssessmentParamData); // partially respond to assessment as a crc user
          });
          assessmentsListPage.refreshUntilFilledAssessmentUpdatedWithStatus(this.casefileAssessmentId, 'Partial');
          verifyPartiallyCompletedCaseFileAssessment(roleName, this.casefileAssessmentId);
        });
      });
    }
  });
  describe('Cannot Roles', () => {
    before(() => {
      cy.then(async function () {
        const resultHousehold = await prepareStateHousehold(accessTokenL6, this.eventCreated);
        await addAssessmentToCasefile(resultHousehold.provider, resultHousehold.registrationResponse.caseFile.id, this.assessmentFormId);
        cy.wrap(resultHousehold.registrationResponse.caseFile.id).as('casefileId');
      });
    });
     for (const roleName of filteredCannotRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.then(async function () {
            cy.login(roleName);
            cy.goTo(`casefile/${this.casefileId}/assessments`);
          });
        });
        it('should not be able to partially complete a Case File Assessment', function () {
          verifyPendingCaseFileAssessment(roleName, this.assessmentName);
        });
      });
    }
  });
});
