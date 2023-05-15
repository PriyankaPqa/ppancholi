import { UserRoles } from '@libs/cypress-lib/support/msal';
import { fixtureAssessment } from '../../../fixtures/events';
import { CreateNewAssessmentPage } from '../../../pages/assessments/createNewAssessment.page';
import { prepareStateEventAndProgram } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';

const canRoles = {
  Level6: UserRoles.level6,
};

const cannotRoles = {
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

const allRolesValues = [...Object.values(canRoles), ...Object.values(cannotRoles)] as UserRoles[];

const title = '#TC1691# - Create a multiple use Assessment form';
describe(`${title}`, () => {
  before(() => {
    cy.getToken().then(async (accessToken) => {
      const { provider, event, team, mockCreateProgram } = await prepareStateEventAndProgram(accessToken.access_token, allRolesValues);
      cy.wrap(provider).as('provider');
      cy.wrap(event).as('eventCreated');
      cy.wrap(team).as('teamCreated');
      cy.wrap(mockCreateProgram).as('program');
    });
  });

  after(function () {
    if (this.provider && this.teamCreated?.id) {
      removeTeamMembersFromTeam(this.teamCreated.id, this.provider, allRolesValues);
    }
  });

  describe('Can Roles', () => {
    for (const [roleName, roleValue] of Object.entries(canRoles)) {
      describe(`${roleName}`, () => {
        beforeEach(function () {
          cy.login(roleValue);
          cy.goTo(`events/${this.eventCreated.id}/assessments/create`);
        });
        it('should successfully create a multiple use assessment form', function () {
          const assessmentData = fixtureAssessment(this.test.retries.length);

          const createNewAssessmentPage = new CreateNewAssessmentPage();
          createNewAssessmentPage.fill(assessmentData);
          createNewAssessmentPage.selectProgram(this.program.name.translation.en);
          createNewAssessmentPage.togglePublishedStatus();
          createNewAssessmentPage.checkFrequencyMultiple();

          const assessmentDetailsPage = createNewAssessmentPage.saveAssessment();
          cy.contains('The assessment has been successfully created.').should('be.visible');
          assessmentDetailsPage.getFrequency().contains('Frequency Multiple').should('be.visible');
          assessmentDetailsPage.getAssessmentStatusTag().should('eq', 'Active');
        });
      });
    }
  });

  describe('Cannot Roles', () => {
    for (const [roleName, roleValue] of Object.entries(cannotRoles)) {
      describe(`${roleName}`, () => {
        beforeEach(function () {
          cy.login(roleValue);
          cy.goTo(`events/${this.eventCreated.id}/assessments/create`);
        });
        it('should not be able to create multiple use assessment form', () => {
          cy.contains('You do not have permission to access this page').should('be.visible');
        });
      });
    }
  });
});
