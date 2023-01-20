import { UserRoles } from '@libs/cypress-lib/support/msal';
import { useProvider } from '../../../provider/provider';

const getOneOpenEvent = (roleValue = UserRoles.level6) => cy.getToken(roleValue).then(async (accessToken) => {
  const provider = useProvider(accessToken.access_token);
  const event = await provider.cypress.events.fetchOneOpenEvent();
  return event;
});

// todo remove this comment
beforeEach(() => {
  cy.login();
  getOneOpenEvent().then((event) => {
    cy.goTo(`events/${event.entity.id}/`);
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
