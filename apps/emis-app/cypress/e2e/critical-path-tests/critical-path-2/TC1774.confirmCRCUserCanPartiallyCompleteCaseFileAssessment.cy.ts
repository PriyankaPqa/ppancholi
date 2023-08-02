import { UserRoles } from '@libs/cypress-lib/support/msal';
import { formatCurrentDate } from '@libs/cypress-lib/helpers';
import {
  prepareStateEventAndProgram,
  prepareStateHousehold,
  createAndUpdateAssessment,
  addAssessmentToCasefile,
  partiallyCompleteCasefileAssessment } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { AssessmentsListPage } from '../../../pages/assessmentsCasefile/assessmentsList.page';
import { verifyPartiallyCompletedCaseFileAssessment } from './canSteps';

const canRoles = {
  Level6: UserRoles.level6,
  Level5: UserRoles.level5,
  Level4: UserRoles.level4,
  Level3: UserRoles.level3,
  Level2: UserRoles.level2,
  Level1: UserRoles.level1,
  Level0: UserRoles.level0,
  Contributor3: UserRoles.contributor3,
  Contributor2: UserRoles.contributor2,
  Contributor1: UserRoles.contributor1,
  ReadOnly: UserRoles.readonly,
};

const canRolesValues = [...Object.values(canRoles)];

let accessTokenL6 = '';

describe('#TC1774# - Confirm that the CRC User can partially complete a Case File Assessment', { tags: ['@assessments'] }, () => {
  before(() => {
    cy.getToken().then(async (tokenResponse) => {
      accessTokenL6 = tokenResponse.access_token;
      const { provider, event, team, program } = await prepareStateEventAndProgram(accessTokenL6, canRolesValues);
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
          cy.then(async function () {
            const resultHousehold = await prepareStateHousehold(accessTokenL6, this.eventCreated);
            const resultCreateAssessmentResponse = await addAssessmentToCasefile(resultHousehold.provider, resultHousehold.registrationResponse.caseFile.id, this.assessmentFormId);
            cy.wrap(resultHousehold).as('householdCreated');
            cy.wrap(resultCreateAssessmentResponse).as('casefileAssessment');
            cy.login(roleValue);
            cy.goTo(`casefile/${resultHousehold.registrationResponse.caseFile.id}/assessments`);
          });
        });
        it('should successfully partially complete a Case File Assessment', function () {
          const assessmentsListPage = new AssessmentsListPage();
          assessmentsListPage.getPendingAssessmentTable().contains(`${this.assessmentName}`).should('be.visible');
          assessmentsListPage.getPendingAssessmentTable().contains(`${formatCurrentDate()}`).should('be.visible');
          assessmentsListPage.getPendingAssessmentTable().contains('Pending').should('be.visible');
          if (roleName === 'Contributor3' || roleName === 'Contributor2' || roleName === 'Contributor1' || roleName === 'ReadOnly') {
            assessmentsListPage.getAssessmentStartButton().should('not.exist');
          } else {
            assessmentsListPage.getAssessmentStartButton().should('be.visible');
          }
          if (roleName === 'Level0' || roleName === 'Contributor3' || roleName === 'Contributor2' || roleName === 'Contributor1' || roleName === 'ReadOnly') {
            assessmentsListPage.getDeleteAssessmentButton().should('not.exist');
          } else {
            assessmentsListPage.getDeleteAssessmentButton().should('be.visible');
          }
          cy.wrap(1).then(() => {
            // eslint-disable-next-line
            partiallyCompleteCasefileAssessment(this.householdCreated.provider, this.casefileAssessment.id, this.householdCreated.registrationResponse.caseFile.id, this.assessmentFormId); //partially respond to assessment as a crc user
          });
          assessmentsListPage.refreshUntilFilledAssessmentUpdated();
          verifyPartiallyCompletedCaseFileAssessment(roleName);
        });
      });
    }
  });
});
