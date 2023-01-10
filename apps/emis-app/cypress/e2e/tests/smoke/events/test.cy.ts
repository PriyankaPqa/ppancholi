import { useProvider } from '../../../../provider/provider';
import { UserRoles } from '../../../../support/msal';

const getOneOpenEvent = (roleValue = UserRoles.level6) => cy.getToken(roleValue).then(async (accessToken) => {
  const provider = useProvider(accessToken.access_token);
  const event = await provider.events.fetchOneOpenEvent();
  return event;
});

describe('test', () => {
  it('should go to a random event page', () => {
    getOneOpenEvent().then(() => {
    });
  });
});
