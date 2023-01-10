import { useProvider } from '../../../provider/provider';
import { buildRegistrationUrl } from '../../../support/helpers/urlBuilder';

let provider = null as ReturnType<typeof useProvider>;

before(() => {
  cy.getToken().then((accessToken) => {
    provider = useProvider(accessToken.access_token);
  });
});

describe('Foo', () => {
  it('should check that registration button is displayed', () => {
    (async () => {
      const event = await provider.events.fetchOneOpenEvent();
      const initiallyEnabled = event.entity.selfRegistrationEnabled;
      if (!initiallyEnabled) {
        await provider.events.toggleSelfRegistration(event.id, true);
      }

      cy.visit(buildRegistrationUrl(event.entity));

      cy.getByDataTest({ selector: 'startRegistration-individual-button', type: 'button' }).should('be.visible');

      if (!initiallyEnabled) {
        await provider.events.toggleSelfRegistration(event.id, false);
      }
    })();
    });
});
