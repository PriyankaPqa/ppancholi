import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { fixtureEvent } from '../../../fixtures/events';
import { HomePage } from '../../../pages/home/home.page';
import { CreateEventPage } from '../../../pages/events/createEvent.page';

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

const { filteredCannotRoles } = getRoles([], cannotRoles);

describe('[T28626] Create an Event.', { tags: ['@event'] }, () => {
  describe('level6', () => {
    beforeEach(() => {
      cy.login();
      cy.goTo('events/create');
    });
    it('should successfully create an event and show details', function () {
      const eventData = fixtureEvent(this.test.retries.length);

      const createEventPage = new CreateEventPage();
      createEventPage.fill(eventData);
      createEventPage.selectFrenchTab();
      createEventPage.fillFrenchData(eventData);

      const eventDetailsPage = createEventPage.goToEventDetailsPage();
      eventDetailsPage.expandDetails();
      eventDetailsPage.getEventName().should('eq', `${eventData.name.translation.en}`);
      eventDetailsPage.getEventStatus().should('eq', eventData.eventStatus);
      eventDetailsPage.getEventResponseLevel().should('string', eventData.responseLevelIndex);
      eventDetailsPage.getEventDescription().should('eq', eventData.description.translation.en);
      eventDetailsPage.getEventType().should('eq', eventData.eventType);
      eventDetailsPage.getEventStatus().should('eq', eventData.eventStatus);
      eventDetailsPage.getEventLink().should('eq', `https://beneficiary-test.crc-tech.ca/en/registration/${eventData.name.translation.en}`);
      eventDetailsPage.getEventProvince().should('eq', 'Alberta');
      eventDetailsPage.getEventRegion().should('eq', eventData.region);
      eventDetailsPage.getEventPhone().should('string', eventData.assistanceNumber);
      eventDetailsPage.getEventId().should('exist');
      eventDetailsPage.getEventReportedDate().should('eq', `${eventData.reportedDate.year}-${eventData.reportedDate.month.toString().padStart(2, '0')}`
      + `-${eventData.reportedDate.day}`);
    });
  });

   for (const roleName of filteredCannotRoles) {
    describe(`${roleName}`, () => {
      beforeEach(() => {
        cy.login(roleName);
        cy.goTo('home');
      });
      it('should not be able to create an event', () => {
        const homePage = new HomePage();
        cy.contains('Refresh').should('be.visible'); // Refresh is a common text displayed in each table of home page across all roles
        homePage.getAddEventButton().should('not.exist');
      });
    });
  }
});
