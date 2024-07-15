import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import {
  prepareStateEventAndProgram,
  createAndUpdateAssessment,
  createEventAndTeam,
  addAssessmentToBeCompletedDuringRegistration,
} from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { ProgramHomePage } from '../../../pages/programs/programHome.page';

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

let accessTokenL6 = '';

describe('[T28691] An Assessment can be made mandatory for a Program', { tags: ['@event'] }, () => {
  describe('Can Roles', () => {
    for (const roleName of filteredCanRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.getToken().then(async (tokenResponse) => {
            accessTokenL6 = tokenResponse.access_token;
            const { provider, event, team, program } = await prepareStateEventAndProgram(accessTokenL6, filteredCanRoles);
            const resultAssessment = await createAndUpdateAssessment(provider, event.id, program.id);
            await addAssessmentToBeCompletedDuringRegistration(provider, event.id, resultAssessment.id);
            cy.wrap(provider).as('provider');
            cy.wrap(team).as('teamCreated');
            cy.wrap(program.name.translation.en).as('programName');
            cy.wrap(resultAssessment.name.translation.en).as('assessmentName');
            cy.login(roleName);
            cy.goTo(`events/${event.id}/programs`);
          });
        });
        afterEach(function () {
          if (this.provider && this.teamCreated?.id) {
            removeTeamMembersFromTeam(this.teamCreated.id, this.provider);
          }
        });
        it('should successfully make assessment mandatory for a program', function () {
          const programHomePage = new ProgramHomePage();
          programHomePage.getProgramTable().contains(this.programName).should('be.visible');

          const editProgramPage = programHomePage.editProgram();
          editProgramPage.getPageTitle().should('eq', 'Edit program');
          editProgramPage.getCancelButton().should('be.enabled');
          editProgramPage.getSaveButton().should('not.be.enabled');
          editProgramPage.checkCompletedAssessment();
          editProgramPage.selectProgramAssessment(this.assessmentName);
          const programDetailsPage = editProgramPage.saveEdit();

          cy.contains('The program has been successfully updated').should('be.visible');
          programDetailsPage.getIconCompletedAssessment().invoke('attr', 'class').should('include', 'success');
          programDetailsPage.getAssessmentName().should('eq', this.assessmentName);
          programDetailsPage.getBackToProgramButton().should('be.visible');
        });
      });
    }
  });

  describe('Cannot Roles', () => {
    before(() => {
      cy.getToken().then(async (accessToken) => {
        const { provider, event, team } = await createEventAndTeam(accessToken.access_token, allRoles);
        cy.wrap(provider).as('provider');
        cy.wrap(event).as('eventCreated');
        cy.wrap(team).as('teamCreated');
      });
    });
    after(function () {
      if (this.provider && this.teamCreated?.id) {
        removeTeamMembersFromTeam(this.teamCreated.id, this.provider);
      }
    });
    for (const roleName of filteredCannotRoles) {
      describe(`${roleName}`, () => {
        beforeEach(function () {
          cy.login(roleName);
          cy.goTo(`events/${this.eventCreated.id}/programs`);
        });
        it('should not be able to make assessment mandatory for a program', () => {
          cy.contains('You do not have permission to access this page').should('be.visible');
        });
      });
    }
  });
});
