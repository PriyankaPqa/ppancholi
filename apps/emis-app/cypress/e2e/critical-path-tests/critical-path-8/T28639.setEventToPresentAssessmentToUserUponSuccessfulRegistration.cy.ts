import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { Language } from '@libs/cypress-lib/helpers';
import {
  prepareStateEventAndProgram,
  createAndUpdateAssessment,
  createEventAndTeam,
} from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { EventDetailsPage } from '../../../pages/events/eventDetails.page';
import { fixtureEventAssessment } from '../../../fixtures/events';

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

describe('[T28639] Set Event to present an Assessment to the user upon successful registration', { tags: ['@event', '@assessments'] }, () => {
  describe('Can Roles', () => {
    for (const roleName of filteredCanRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.getToken().then(async (tokenResponse) => {
            accessTokenL6 = tokenResponse.access_token;
            const { provider, event, team, program } = await prepareStateEventAndProgram(accessTokenL6, filteredCanRoles);
            const resultAssessment = await createAndUpdateAssessment(provider, event.id, program.id);
            cy.wrap(provider).as('provider');
            cy.wrap(event).as('eventCreated');
            cy.wrap(team).as('teamCreated');
            cy.wrap(resultAssessment.id).as('assessmentFormId');
            cy.wrap(resultAssessment.name.translation.en).as('assessmentName');
            cy.login(roleName);
            cy.goTo(`events/${event.id}`);
          });
        });
        afterEach(function () {
          if (this.provider && this.teamCreated?.id) {
            removeTeamMembersFromTeam(this.teamCreated.id, this.provider);
          }
        });
        it('should successfully set event to present an assessment to the user upon successful registration', function () {
          const eventAssessmentData = fixtureEventAssessment(this.test.retries.length);

          const eventDetailsPage = new EventDetailsPage();
          eventDetailsPage.getSectionTitleRegistrationAssessment().should('eq', 'Assessment to be completed during registration');
          eventDetailsPage.getAddRegistrationAssessmentButton().should('be.visible');

          const addAssessmentPage = eventDetailsPage.addRegistrationAssessment();
          addAssessmentPage.selectAssessment(this.assessmentName);
          addAssessmentPage.fillAssessmentTitleDescription(eventAssessmentData, Language.English);
          addAssessmentPage.selectTab(Language.French);
          addAssessmentPage.fillAssessmentTitleDescription(eventAssessmentData, Language.French);
          addAssessmentPage.addAssessment();

          eventDetailsPage.getRegistrationAssessmentSectionNameElement().contains(this.assessmentName).should('be.visible');
          eventDetailsPage.getRegistrationAssessmentSectionDescription().should('eq', eventAssessmentData.description.translation.en);
          eventDetailsPage.getRegistrationAssessmentSectionStatusElement().contains('Active').should('be.visible');
          eventDetailsPage.getRegistrationAssessmentSectionPublishStatusElement().contains('Published').should('be.visible');
          eventDetailsPage.getRegistrationAssessmentEditButton().should('be.visible');
          eventDetailsPage.getRegistrationAssessmentDeleteButton().should('be.visible');
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
          cy.goTo(`events/${this.eventCreated.id}`);
        });
        it('should not be able to set event to present an assessment to the user upon successful registration', () => {
          const eventDetailsPage = new EventDetailsPage();
          eventDetailsPage.getAddRegistrationAssessmentButton().should('not.exist');
        });
      });
    }
  });
});
