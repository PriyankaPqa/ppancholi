import { ECanadaProvinces } from '@libs/shared-lib/types';
import { UserRoles } from '@libs/cypress-lib/support/msal';
import { EventDetailsPage } from '../../../pages/events/eventDetails.page';
import { createEventAndTeam } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { fixtureLocation } from '../../../fixtures/events';

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

const allRolesValues = [...Object.values(canRoles), ...Object.values(cannotRoles)] as UserRoles[];

describe('#TC165# - Add Event Shelter Location', { tags: ['@event'] }, () => {
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
    for (const [roleName, roleValue] of Object.entries(cannotRoles)) {
      describe(`${roleName}`, () => {
        beforeEach(function () {
          cy.login(roleValue);
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
