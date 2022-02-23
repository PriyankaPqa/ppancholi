import { userLevel6 } from '../roles';
import { getURL } from '../helpers/functions';
import CreateEventPageModel, { EventStatus } from '../page-models/events/CreateEventPageModel';
import { MyRequestHook } from '../utils/RequestHook';

const EVENT_CREATE_URL = 'http://localhost:8080/en/events/create';

const myHook = new MyRequestHook([/api-dev.crc-tech.ca/]);

fixture('Event')
  .beforeEach(async (t) => {
    await t.useRole(userLevel6);
  }).requestHooks(myHook);

test('Go to create event page', async (t) => {
  await t.navigateTo(EVENT_CREATE_URL);
  await t.expect(getURL()).eql(EVENT_CREATE_URL);
});

test('Create an event', async (t) => {
  await t.navigateTo(EVENT_CREATE_URL);

  await CreateEventPageModel.createEvent({
    name: 'e2e-event-02',
    responseLevel: 'Level 3',
    provinceIndex: 0,
    region: 'my custom region',
    eventType: 'Earthquake',
    eventStatus: EventStatus.open,
    assistanceNumber: '514-706-5000',
    reportedDate: {
      year: 2020,
      month: 1,
      day: 30,
    },
    relatedEventsIndex: [0, 1],
    description: 'This is a description',
  });

  await t.expect(myHook.getRequest('/event/events', 'POST').statusCode).eql(201);
});
