import { EEventCallCentreStatus, IEventCallCentre } from '@libs/entities-lib/event';
import { faker } from '@faker-js/faker';
import { format } from 'date-fns';
import { UserRoles } from '@libs/cypress-lib/support/msal';
import { EventDetailsPage } from '../../../pages/events/eventDetails.page';
import { createEventWithTeamWithUsers } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { useProvider } from '../../../provider/provider';

const callCentreData: IEventCallCentre = {
  name: {
    translation: {
      en: 'Ontario',
      fr: 'Montreal',
    },
  },
  details: {
    translation: {
      en: 'This is English Description of Event',
      fr: "Ceci est la description française de l'événement",
    },
  },
  startDate: format(Date.now(), 'yyyy-MM-dd'),
  endDate: format(faker.date.future(), 'yyyy-MM-dd'),
  status: EEventCallCentreStatus.Active,
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
  Level0: UserRoles.level0,
  Contributor1: UserRoles.contributor1,
  Contributor2: UserRoles.contributor2,
  Contributor3: UserRoles.contributor3,
  ReadOnly: UserRoles.readonly,
};

const allRolesValues = [...Object.values(canRoles), ...Object.values(cannotRoles)];

const prepareState = () => cy.getToken().then(async (accessToken) => {
  const provider = useProvider(accessToken.access_token);
  const { event, team } = await createEventWithTeamWithUsers(provider, allRolesValues);
  cy.wrap(event).as('eventCreated');
  cy.wrap(team).as('teamCreated');
  cy.wrap(provider).as('provider');
});

const title = '#TC163# - Add Event Call Centre';
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
        it('should successfully add event call centre', function () {
          cy.goTo(`events/${this.eventCreated.id}`);

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

          eventDetailsPage.getCallCentreNameByRole(roleName).should('string', `${callCentreData.name.translation.en}${roleName}`);
          eventDetailsPage.getCallCentreStartDate().should('string', callCentreData.startDate);
          eventDetailsPage.getCallCentreEndDate().should('string', callCentreData.endDate);
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
        it('should not be able to add event call centre', function () {
          cy.goTo(`events/${this.eventCreated.id}`);

          const eventDetailsPage = new EventDetailsPage();
          eventDetailsPage.getCallCentreButton().should('not.exist');
        });
      });
    }
  });
});
