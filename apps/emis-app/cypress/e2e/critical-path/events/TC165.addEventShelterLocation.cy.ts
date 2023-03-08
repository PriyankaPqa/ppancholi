import { faker } from '@faker-js/faker';
import { ECanadaProvinces } from '@libs/shared-lib/types';
import { UserRoles } from '@libs/cypress-lib/support/msal';
import { IShelterLocationFields } from '../../../pages/events/addShelterLocation.page';
import { EventDetailsPage } from '../../../pages/events/eventDetails.page';
import { useProvider } from '../../../provider/provider';
import { createEventWithTeamWithUsers } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';

const shelterLocationData: IShelterLocationFields = {
  name: {
    translation: {
      en: 'Shelter Toronto-En-',
      fr: 'Shelter Toronto-Fr-',
    },
  },
  country: 'CA',
  streetAddress: faker.address.streetAddress(),
  city: faker.address.cityName(),
  provinceIndex: ECanadaProvinces.NB,
  postalCode: faker.helpers.replaceSymbols('?#?#?#'),
};

const canRoles = {
  Level6: UserRoles.level6,
  Level5: UserRoles.level5,
};

const cannotRoles = {
  Level4: UserRoles.level4,
  Level3: UserRoles.level3,
  Level2: UserRoles.level2,
  Level1: UserRoles.level1,
  Contributor1: UserRoles.contributor1,
  Contributor2: UserRoles.contributor2,
  Contributor3: UserRoles.contributor3,
  ReadOnly: UserRoles.readonly,
};

const allRolesValues = [...Object.values(canRoles), ...Object.values(cannotRoles)] as UserRoles[];

const prepareState = () => cy.getToken().then(async (accessToken) => {
  const provider = useProvider(accessToken.access_token);
  const { event, team } = await createEventWithTeamWithUsers(provider, allRolesValues);
  cy.wrap(event).as('eventCreated');
  cy.wrap(team).as('teamCreated');
  cy.wrap(provider).as('provider');
});

const title = '#TC165# - Add Event Shelter Location';
describe(`${title}`, () => {
  before(() => {
    prepareState();
  });

  after(function () {
    if (this.provider && this.teamCreated?.id) {
      removeTeamMembersFromTeam(this.teamCreated.id, this.provider, allRolesValues);
    }
  });

  describe('Can Roles', () => {
    for (const [roleName, roleValue] of Object.entries(canRoles)) {
      describe(`${roleName}`, () => {
        before(() => {
          cy.login(roleValue);
        });
        it('should successfully add event shelter location', function () {
          cy.goTo(`events/${this.eventCreated.id}`);
          const eventDetailsPage = new EventDetailsPage();

          const addShelterLocationPage = eventDetailsPage.addShelterLocation();
          addShelterLocationPage.getShelterLocationStatus().should('eq', 'Active');
          addShelterLocationPage.fill(shelterLocationData, roleName);
          addShelterLocationPage.selectFrenchTab();
          addShelterLocationPage.fillFrenchShelterLocationName(shelterLocationData.name.translation.fr, roleName);
          addShelterLocationPage.addNewShelterLocation();

          eventDetailsPage.getShelterLocationNameByRole(roleName).should('eq', `${shelterLocationData.name.translation.en}${roleName}`);
          eventDetailsPage.getShelterLocationAddress().should('eq', `${shelterLocationData.streetAddress} ${shelterLocationData.city}`
          + `, ${ECanadaProvinces[shelterLocationData.provinceIndex]}, ${shelterLocationData.postalCode}, ${shelterLocationData.country}`);
          eventDetailsPage.getShelterLocationStatus().should('eq', 'Active');
        });
      });
    }
  });

  describe('Cannot Roles', () => {
    for (const [roleName, roleValue] of Object.entries(cannotRoles)) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.login(roleValue);
        });
        it('should not be able to add event shelter location', function () {
          cy.goTo(`events/${this.eventCreated.id}`);

          const eventDetailsPage = new EventDetailsPage();
          eventDetailsPage.getShelterLocationButton().should('not.exist');
        });
      });
    }
  });
});
