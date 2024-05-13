import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { fixtureAssessment } from '../../../fixtures/events';
import { CreateNewAssessmentPage } from '../../../pages/assessments/createNewAssessment.page';
import { prepareStateEventAndProgram } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';

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

describe('[T28584] Create a multiple use Assessment form', { tags: ['@event', '@assessments'] }, () => {
  before(() => {
    cy.getToken().then(async (accessToken) => {
      const { provider, event, team, mockCreateProgram } = await prepareStateEventAndProgram(accessToken.access_token, allRoles);
      cy.wrap(provider).as('provider');
      cy.wrap(event).as('eventCreated');
      cy.wrap(team).as('teamCreated');
      cy.wrap(mockCreateProgram).as('mockProgram');
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
          cy.goTo(`events/${this.eventCreated.id}/assessments/create`);
        });
        it('should successfully create a multiple use assessment form', function () {
          const assessmentData = fixtureAssessment(this.test.retries.length);

          const createNewAssessmentPage = new CreateNewAssessmentPage();
          createNewAssessmentPage.fill(assessmentData);
          createNewAssessmentPage.selectProgram(this.mockProgram.name.translation.en);
          createNewAssessmentPage.togglePublishedStatus();
          createNewAssessmentPage.savePartialAssessmentsResults();
          createNewAssessmentPage.checkFrequencyMultiple();

          const assessmentDetailsPage = createNewAssessmentPage.saveAssessment();
          cy.contains('The assessment has been successfully created.').should('be.visible');
          assessmentDetailsPage.getFrequency().contains('Frequency Multiple').should('be.visible');
          assessmentDetailsPage.getSavePartialAssessmentsResultsElement().contains('Yes').should('be.visible');
          assessmentDetailsPage.getAssessmentStatusTag().should('eq', 'Active');
        });
      });
    }
  });

  describe('Cannot Roles', () => {
     for (const roleName of filteredCannotRoles) {
      describe(`${roleName}`, () => {
        beforeEach(function () {
          cy.login(roleName);
          cy.goTo(`events/${this.eventCreated.id}/assessments/create`);
        });
        it('should not be able to create multiple use assessment form', () => {
          cy.contains('You do not have permission to access this page').should('be.visible');
        });
      });
    }
  });
});
