import { UserRoles } from '@libs/cypress-lib/support/msal';
import { fixtureEvent } from '../../../fixtures/events';
import { HomePage } from '../../../pages/home/home.page';
import { CreateEventPage } from '../../../pages/events/createEvent.page';

const cannotRoles = {
  Level5: UserRoles.level5,
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

describe('#TC160# - Create an Event', { tags: ['@event'] }, () => {
  describe('level6', () => {
    beforeEach(() => {
      cy.log(Cypress.env('USER_0_MAIL'));
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

  for (const [roleName, roleValue] of Object.entries(cannotRoles)) {
    describe(`${roleName}`, () => {
      beforeEach(() => {
        cy.login(roleValue);
        cy.goTo('home');
      });
      it('should not be able to create an event', () => {
        const homePage = new HomePage();
        homePage.getAddEventButton().should('not.exist');
      });
    });
  }
});
