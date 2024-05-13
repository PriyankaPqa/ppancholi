import { ECanadaProvinces } from '@libs/shared-lib/types';
import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { fixtureLocation } from '../../../fixtures/events';
import { EventDetailsPage } from '../../../pages/events/eventDetails.page';
import { createEventAndTeam } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';

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

describe('[T28648] Add Event Registration Location', { tags: ['@event'] }, () => {
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
        it('should successfully add event registration location', function () {
          const registrationLocationData = fixtureLocation(this.test.retries.length);

          const eventDetailsPage = new EventDetailsPage();

          const addRegistrationLocationPage = eventDetailsPage.addRegistrationLocation();
          addRegistrationLocationPage.getRegistrationLocationStatus().should('eq', 'Active');
          addRegistrationLocationPage.getRegistrationLocationCountry().should('eq', 'Canada'); // Canada is default country value
          addRegistrationLocationPage.fill(registrationLocationData, roleName);
          addRegistrationLocationPage.selectFrenchTab();
          addRegistrationLocationPage.fillFrenchRegistrationLocationName(registrationLocationData.name.translation.fr, roleName);
          addRegistrationLocationPage.addNewRegistrationLocation();

          cy.contains(`${registrationLocationData.name.translation.en}${roleName}`).should('be.visible');
          // eslint-disable-next-line
          cy.contains(`${registrationLocationData.address.streetAddress} ${registrationLocationData.address.city}, ${ECanadaProvinces[registrationLocationData.address.province]}, ${registrationLocationData.address.postalCode}, ${registrationLocationData.address.country}`).should('be.visible');
          eventDetailsPage.getRegistrationLocationStatus().should('eq', 'Active');
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
        it('should not be able to add event registration location', () => {
          const eventDetailsPage = new EventDetailsPage();
          eventDetailsPage.getRegistrationLocationButton().should('not.exist');
        });
      });
    }
  });
});
