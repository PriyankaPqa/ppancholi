import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import {
  prepareStateEventAndProgram,
  prepareStateHousehold,
  createAndUpdateAssessment,
  addAssessmentToCasefile,
} from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';

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

describe('#TC1884# - CRC User: The assessment form page should be open with a responsive view', { tags: ['@assessments'] }, () => {
  before(() => {
    cy.getToken().then(async (tokenResponse) => {
      accessTokenL6 = tokenResponse.access_token;
      const { provider, event, team, program } = await prepareStateEventAndProgram(accessTokenL6, allRoles);
      const resultAssessment = await createAndUpdateAssessment(provider, event.id, program.id);
      cy.wrap(provider).as('provider');
      cy.wrap(event).as('eventCreated');
      cy.wrap(team).as('teamCreated');
      cy.wrap(resultAssessment.id).as('assessmentFormId');
      cy.wrap(resultAssessment.questions[1].question.translation.en).as('assessementQuestion2');
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
            cy.login(roleName);
            cy.goTo(`events/${this.eventCreated.id}/assessment-complete/${this.assessmentFormId}/${resultCreateAssessmentResponse.id}`);
          });
        });
        it('should successfully open assessment form page for crc user with a responsive view', function () {
          cy.contains(this.assessementQuestion2).should('be.visible');
          cy.get("input[value='Complete']").click();
          cy.contains('Thank you for completing the survey').should('be.visible');
        });
      });
    }
  });
  describe('Cannot Roles', () => {
    before(() => {
      cy.then(async function () {
        const resultHousehold = await prepareStateHousehold(accessTokenL6, this.eventCreated);
        const resultCreateAssessmentResponse = await addAssessmentToCasefile(resultHousehold.provider, resultHousehold.registrationResponse.caseFile.id, this.assessmentFormId);
        cy.wrap(resultHousehold.registrationResponse.caseFile.id).as('casefileId');
        cy.wrap(resultCreateAssessmentResponse).as('casefileAssessment');
      });
    });
     for (const roleName of filteredCannotRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.then(async function () {
            cy.login(roleName);
            cy.goTo(`events/${this.eventCreated.id}/assessment-complete/${this.assessmentFormId}/${this.casefileAssessment.id}`);
          });
        });
        it('should not be able to open assessment form page', () => {
          cy.contains('You do not have permission to access this page').should('be.visible');
        });
      });
    }
  });
});
