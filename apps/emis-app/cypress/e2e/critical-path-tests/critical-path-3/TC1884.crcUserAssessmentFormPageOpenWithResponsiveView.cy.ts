import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { propertyStateMockAllComponentsData } from '@libs/cypress-lib/mocks/assessments/survey-questions';
import {
  prepareStateEventAndProgram,
  prepareStateHousehold,
  addAssessmentToCasefile,
  createAndUpdateAssessmentWithAllPossibleComponents,
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

// If this test becomes flaky with time, we could create and test multiple surveys. Each of them would contain only one component at a time, which could allow a more generic selection
describe('#TC1884# - CRC User: The assessment form page should be open with a responsive view', { tags: ['@assessments'] }, () => {
  before(() => {
    cy.getToken().then(async (tokenResponse) => {
      accessTokenL6 = tokenResponse.access_token;
      const { provider, event, team, program } = await prepareStateEventAndProgram(accessTokenL6, allRoles);
      const resultAssessment = await createAndUpdateAssessmentWithAllPossibleComponents(provider, event.id, program.id);
      cy.wrap(provider).as('provider');
      cy.wrap(event).as('eventCreated');
      cy.wrap(team).as('teamCreated');
      cy.wrap(resultAssessment.id).as('assessmentFormId');
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
            const resultCreateAssessmentResponse = await addAssessmentToCasefile(
              resultHousehold.provider,
              resultHousehold.registrationResponse.caseFile.id,
              this.assessmentFormId,
            );
            cy.wrap(resultHousehold).as('householdCreated');
            cy.login(roleName);
            cy.goTo(`events/${this.eventCreated.id}/assessment-complete/${this.assessmentFormId}/${resultCreateAssessmentResponse.id}`);
          });
        });
        it('should successfully open assessment form page for crc user with a responsive view', () => {
          const pageComponents = propertyStateMockAllComponentsData.pages[0].elements;
          cy.contains(pageComponents[1].name).should('be.visible');
          cy.get(`input[value='${pageComponents[0].choices[0]}']`).click({ force: true }).log('radiogroup component responsive');
          cy.get(`input[name='${pageComponents[1].name}']`).eq(0).click({ force: true }).log('rating component responsive');
          cy.get(`input[name='${pageComponents[2].name}']`).eq(0).click({ force: true }).log('checkbox component responsive');
          cy.get(`input[placeholder='${pageComponents[3].placeholder}']`).click({ force: true });
          cy.contains(pageComponents[3].choices[1]).click({ force: true }).log('dropdown component responsive');
          cy.get(`[data-name='${pageComponents[4].name}']`).contains('No').click({ force: true }).log('boolean component responsive');
          cy.get(`input[aria-label='${pageComponents[5].name}']`).type('1').log('single input component responsive');
          cy.get(`textarea[aria-label='${pageComponents[6].name}']`).type('Pleasant').log('comment component responsive');
          cy.get(`input[aria-label='${pageComponents[7].items[0].name}']`).type('John');
          cy.get(`input[aria-label='${pageComponents[7].items[1].name}']`).type('Doe').log('multiple text component responsive');
          cy.get(`input[aria-label='${pageComponents[8].elements[0].name}']`).type('Test text').log('panel component responsive');
          cy.get(`[data-name='${pageComponents[9].name}']`).contains('Add new').click();
          cy.get(`input[aria-label='${pageComponents[9].templateElements[0].name}']`).type('2');
          cy.get(`input[aria-label='${pageComponents[9].templateElements[1].name}']`).type('2').log('dynamic panel component responsive');
          cy.get(`input[aria-label='${pageComponents[10].columns[1]}']`).eq(0).click({ force: true }).log('single choice matrix component responsive');
          cy.get(`input[placeholder='${pageComponents[11].placeholder}']`).eq(0).click({ force: true }).type('4')
            .log('multiple choice matrix component responsive');
          cy.get(`input[placeholder='${pageComponents[12].placeholder}']`).eq(0).click({ force: true }).type('2')
            .log('dynamic matrix component responsive');
          cy.get(`[data-name='${pageComponents[13].name}']`).contains('No').click({ force: true }).log('yes-no component responsive');
          cy.get(`[data-name='${pageComponents[14].name}']`).contains('Note to Case Managers').log('html component visible');
          cy.get(`img[alt='${pageComponents[15].name}']`).should('have.prop', 'tagName', 'IMG').log('image component visible');
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
