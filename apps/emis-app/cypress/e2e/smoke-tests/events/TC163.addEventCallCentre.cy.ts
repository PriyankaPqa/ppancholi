import { UserRoles } from '@libs/cypress-lib/support/msal';
import { returnDateInFormat } from '@libs/cypress-lib/helpers';
import { EventDetailsPage } from '../../../pages/events/eventDetails.page';
import { createEventAndTeam } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { fixtureCallCentre } from '../../../fixtures/events';

const canRoles = {
  Level6: UserRoles.level6,
  Level5: UserRoles.level5,
};

const cannotRoles = {
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

const allRolesValues = [...Object.values(canRoles), ...Object.values(cannotRoles)];

describe('#TC163# - Add Event Call Centre', { tags: ['@event'] }, () => {
  before(() => {
    cy.getToken().then(async (accessToken) => {
      const { provider, event, team } = await createEventAndTeam(accessToken.access_token, allRolesValues);
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
    for (const [roleName, roleValue] of Object.entries(canRoles)) {
      describe(`${roleName}`, () => {
        beforeEach(function () {
          cy.login(roleValue);
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
    for (const [roleName, roleValue] of Object.entries(cannotRoles)) {
      describe(`${roleName}`, () => {
        beforeEach(function () {
          cy.login(roleValue);
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
