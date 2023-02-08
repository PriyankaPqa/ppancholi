import { mockCreateHouseholdRequest } from '@libs/cypress-lib/mocks/household/household';
import { useProvider } from '../../provider/provider';
import { createEventWithTeamWithUsers } from '../helpers/prepareState';

const prepareState = () => cy.getToken().then(async (accessToken) => {
  const provider = useProvider(accessToken.access_token);
  const event = await createEventWithTeamWithUsers(provider);
  const mockCreateHousehold = mockCreateHouseholdRequest({ eventId: event.id });
  await provider.households.postCrcRegistration(mockCreateHousehold);
  cy.wrap(mockCreateHousehold).as('household');
});

before(() => {
  cy.login();
  prepareState();
});

describe('Create Household', () => {
  it('should create an household associated to a event and a team associated to this event and refresh until it is displayed on the table', function () {
    cy.goTo('casefile');

    // Will access previously wrapped household, note that we don't use arrow function here.
    // When using arrow function we could use cy.get('@household).then((household) => {cy.log(household})
    const firstName = this.household.primaryBeneficiary.identitySet.firstName;
    const lastName = this.household.primaryBeneficiary.identitySet.lastName;
    const beneficiarySelector = `a[data-test="beneficiaryName-link_${firstName} ${lastName}"]`;
    cy.log(`Will refresh until: ${firstName} ${lastName} is displayed in the table`);
    cy.refreshUntil(beneficiarySelector);

    cy.contains(`${firstName} ${lastName}`);
  });
});
