import { ECanadaProvinces } from '@libs/shared-lib/types';
import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { EventDetailsPage } from '../../../pages/events/eventDetails.page';
import { createEventAndTeam } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { fixtureLocation } from '../../../fixtures/events';

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

describe('#TC165# - Add Event Shelter Location', { tags: ['@event'] }, () => {
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
        it('should successfully add event shelter location', function () {
          const shelterLocationData = fixtureLocation(this.test.retries.length);

          const eventDetailsPage = new EventDetailsPage();

          const addShelterLocationPage = eventDetailsPage.addShelterLocation();
          addShelterLocationPage.getShelterLocationStatus().should('eq', 'Active');
          addShelterLocationPage.getShelterLocationCountry().should('eq', 'Canada'); // Canada is default country value
          addShelterLocationPage.fill(shelterLocationData, roleName);
          addShelterLocationPage.selectFrenchTab();
          addShelterLocationPage.fillFrenchShelterLocationName(shelterLocationData.name.translation.fr, roleName);
          addShelterLocationPage.addNewShelterLocation();

          cy.contains(`${shelterLocationData.name.translation.en}${roleName}`).should('be.visible');
          // eslint-disable-next-line
          cy.contains(`${shelterLocationData.address.streetAddress} ${shelterLocationData.address.city}, ${ECanadaProvinces[shelterLocationData.address.province]}, ${shelterLocationData.address.postalCode}, ${shelterLocationData.address.country}`).should('be.visible');;
          eventDetailsPage.getShelterLocationStatus().should('eq', 'Active');
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
        it('should not be able to add event shelter location', () => {
          const eventDetailsPage = new EventDetailsPage();
          eventDetailsPage.getShelterLocationButton().should('not.exist');
        });
      });
    }
  });
});
