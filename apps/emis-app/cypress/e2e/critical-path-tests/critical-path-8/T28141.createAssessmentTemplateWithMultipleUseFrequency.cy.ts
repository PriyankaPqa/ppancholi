import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { fixtureAssessment } from '../../../fixtures/events';
import { CreateNewAssessmentPage } from '../../../pages/assessments/createNewAssessment.page';

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

const { filteredCanRoles, filteredCannotRoles } = getRoles(canRoles, cannotRoles);

describe('[T28141] Create an Assessment template with a multiple use frequency', { tags: ['@assessments'] }, () => {
  describe('Can Roles', () => {
    for (const roleName of filteredCanRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.login(roleName);
          cy.goTo('assessment-templates/create');
        });
        it('should successfully create an assessment template with a multiple use frequency', function () {
          const assessmentData = fixtureAssessment(this.test.retries.length);

          const createNewAssessmentPage = new CreateNewAssessmentPage();
          createNewAssessmentPage.fill(assessmentData);
          createNewAssessmentPage.togglePublishedStatus();
          createNewAssessmentPage.savePartialAssessmentsResults();
          createNewAssessmentPage.checkFrequencyMultiple();

          const assessmentDetailsPage = createNewAssessmentPage.saveAssessment();
          cy.contains('The assessment has been successfully created.').should('be.visible');
          assessmentDetailsPage.getPageTitleElement().contains(assessmentData.name.translation.en).should('be.visible');
          assessmentDetailsPage.getFrequency().contains('Multiple').should('be.visible');
          assessmentDetailsPage.getSavePartialAssessmentsResultsElement().contains('Yes').should('be.visible');
          assessmentDetailsPage.getAssessmentStatusTag().should('eq', 'Active');
        });
      });
    }
  });

  describe('Cannot Roles', () => {
     for (const roleName of filteredCannotRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.login(roleName);
          cy.goTo('assessment-templates/create');
        });
        it('should not be able to create an assessment template with a multiple use frequency', () => {
          cy.contains('You do not have permission to access this page').should('be.visible');
        });
      });
    }
  });
});
