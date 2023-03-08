import { format } from 'date-fns';
import { UserRoles } from '@libs/cypress-lib/support/msal';
import { faker } from '@faker-js/faker';
import { HomePage } from '../../../pages/home/home.page';
import { EventStatus, ICreateEventFields, CreateEventPage } from '../../../pages/events/createEvent.page';

const eventData = {
  name: {
    translation: {
      en: `test-auto-event-${format(Date.now(), 'yyyy-MM-dd-H-mm-ss')}`,
      fr: `fr-test-auto-event-${format(Date.now(), 'yyyy-MM-dd-H-mm-ss')}`,
    },
  },
  responseLevelIndex: 1,
  provinceCode: 'AB',
  region: 'my custom region',
  eventType: 'Earthquake',
  eventStatus: EventStatus.open,
  assistanceNumber: faker.helpers.replaceSymbols('(514) 2##-####'),
  relatedEventsIndex: [0, 1],
  description: {
    translation: {
      en: 'This is english event description',
      fr: 'This is french event description',
    },
  },
  reportedDate: { year: 1990, month: 1, day: 31 },
} as ICreateEventFields;

const cannotRoles = {
  Level5: UserRoles.level5,
  Level4: UserRoles.level4,
  Level3: UserRoles.level3,
  Level2: UserRoles.level2,
  Level1: UserRoles.level1,
  Contributor1: UserRoles.contributor1,
  Contributor2: UserRoles.contributor2,
  Contributor3: UserRoles.contributor3,
  ReadOnly: UserRoles.readonly,
};

const title = '#TC160# - Create an Event';
describe(`${title}`, () => {
  describe('level6', () => {
    before(() => {
      cy.login();
      cy.goTo('events/create');
    });
    it('should successfully create an event and show details', () => {
      const createEventPage = new CreateEventPage();
      createEventPage.fill(eventData);
      createEventPage.selectFrenchTab();
      createEventPage.fillFrenchData(eventData);

      const eventDetailsPage = createEventPage.goToEventDetailsPage();
      eventDetailsPage.expandDetails();
      eventDetailsPage.getEventName().should('eq', eventData.name.translation.en);
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
      before(() => {
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
