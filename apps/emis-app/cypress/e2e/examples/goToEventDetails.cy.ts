import { UserRoles } from '@libs/cypress-lib/support/msal';
import { mockCreateEvent } from '@libs/cypress-lib/mocks/events/event';
import { useProvider } from '../../provider/provider';

const createOpenEvent = (roleValue = UserRoles.level6) => cy.getToken(roleValue).then(async (accessToken) => {
  const provider = useProvider(accessToken.access_token);
  const createdEvent = await provider.events.createEvent(mockCreateEvent());
  return createdEvent;
});

before(() => {
  cy.login();
  createOpenEvent().then((event) => {
    cy.goTo(`events/${event.id}/`);
  });
});

describe('Go to event details page', () => {
  it('should load a random event details page ', () => {
    cy.getByDataTest({ selector: 'page-title', type: 'h1' })
      .invoke('text')
      .then((text) => {
        expect(text.trim())
          .equal('Event details');
      });
  });
});
