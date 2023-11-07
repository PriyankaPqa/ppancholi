import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { returnDateInFormat } from '@libs/cypress-lib/helpers';
import { EventDetailsPage } from '../../../pages/events/eventDetails.page';
import { createEventAndTeam } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { fixtureCallCentre } from '../../../fixtures/events';

const canRoles = [
  UserRoles.level6,
  UserRoles.level5,
];

const cannotRoles = [
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

describe('#TC163# - Add Event Call Centre', { tags: ['@event'] }, () => {
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

  describe('Can Roles', () => {
    for (const roleName of filteredCanRoles) {
      describe(`${roleName}`, () => {
        beforeEach(function () {
          cy.login(roleName);
          cy.goTo(`events/${this.eventCreated.id}`);
        });
        it('should successfully add event call centre', function () {
          const callCentreData = fixtureCallCentre(this.test.retries.length);

          const eventDetailsPage = new EventDetailsPage();
          eventDetailsPage.getEventStatus().should('eq', 'Open' || 'eq', 'On hold');

          const addCallCentrePage = eventDetailsPage.addCallCentre();
          addCallCentrePage.getCallCentreStatus().should('eq', 'Inactive');
          addCallCentrePage.fill(callCentreData, roleName);
          addCallCentrePage.toggleStatus();
          addCallCentrePage.getCallCentreStatus().should('eq', 'Active');
          addCallCentrePage.selectFrenchTab();
          addCallCentrePage.fillFrenchData(callCentreData, roleName);
          addCallCentrePage.addNewCallCentre();

          cy.contains(`${callCentreData.name.translation.en}${roleName}`);
          eventDetailsPage.getCallCentreStartDate().should('string', returnDateInFormat(callCentreData.startDate.toString(), 'PP'));
          eventDetailsPage.getCallCentreEndDate().should('string', returnDateInFormat(callCentreData.endDate.toString(), 'PP'));
        });
      });
    }
  });

  describe('Cannot Roles', () => {
     for (const roleName of filteredCannotRoles) {
      describe(`${roleName}`, () => {
        beforeEach(function () {
          cy.login(roleName);
          cy.goTo(`events/${this.eventCreated.id}`);
        });
        it('should not be able to add event call centre', () => {
          const eventDetailsPage = new EventDetailsPage();
          eventDetailsPage.getCallCentreButton().should('not.exist');
        });
      });
    }
  });
});
