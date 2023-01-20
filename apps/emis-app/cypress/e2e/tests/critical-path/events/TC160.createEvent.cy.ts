import { format } from 'date-fns';
import { UserRoles } from '@libs/cypress-lib/support/msal';
import { EventDetailsPage } from '../../../pages/events/eventDetails.page';
import { HomePage } from '../../../pages/home/home.page';
import {
  EventStatus,
  IFields as ICreateEventFields,
  CreateEventPage,
} from '../../../pages/events/createEvent.page';

const createData = {
  name: `test-auto-event-${format(Date.now(), 'yyyy-MM-dd-H-mm-ss')}`,
  responseLevelIndex: 1,
  province: 'Alberta',
  region: 'my custom region',
  eventType: 'Earthquake',
  eventStatus: EventStatus.open,
  assistanceNumber: '514-706-5000',
  relatedEventsIndex: [0, 1],
  description: 'This is a description',
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
  noRole: UserRoles.no_role,
};

const title = '#TC160# - Create Event';
let createEventPage: CreateEventPage;
let eventDetailsPage: EventDetailsPage;
describe(`${title}`, () => {
  describe('Level6', () => {
    beforeEach(() => {
      cy.login();
      cy.goTo('events/create');
    });
    it('should successfully create an event and show details', () => {
      createEventPage = new CreateEventPage();
      cy.wrap(1)
        .then(() => {
          createEventPage.fill(createData);
          // Click create button
          eventDetailsPage = createEventPage.saveAndGoToEventDetailsPage();
          // Expand full details
          eventDetailsPage.expandDetails();
        }).then(() => {
        // Check if we are in details page with correct information
          eventDetailsPage.getEventName().should('string', createData.name);
          eventDetailsPage.getEventDescription().should('string', createData.description);
          eventDetailsPage.getEventType().should('string', createData.eventType);
          eventDetailsPage.getEventStatus().should('string', 'Open');
          eventDetailsPage.getEventLink().should('string', `https://beneficiary-test.crc-tech.ca/en/registration/${createData.name}`);
          eventDetailsPage.getEventProvince().should('string', createData.province);
          eventDetailsPage.getEventRegion().should('string', createData.region);
          eventDetailsPage.getEventPhone().should('string', '1 (514) 706-5000');
        });
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
