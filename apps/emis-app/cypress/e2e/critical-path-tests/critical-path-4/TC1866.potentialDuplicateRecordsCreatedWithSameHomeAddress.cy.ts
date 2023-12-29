import { mockCreateEvent } from '@libs/cypress-lib/mocks/events/event';
import { mockCreateDuplicateHouseholdWithSameAddressRequest } from '@libs/cypress-lib/mocks/household/household';
import { useProvider } from '../../../provider/provider';
import { createHousehold } from '../../helpers/prepareState';
import { potentialDuplicateCreatedSteps } from './canSteps';

describe('#TC1866# : SELF REG - Potential duplicate records created when individual enters same home Address as an existing EMIS household', { tags: ['@registration'] }, () => {
  beforeEach(() => {
    cy.then(async () => {
      cy.getToken().then(async (accessToken) => {
        const provider = useProvider(accessToken.access_token);
        const createdEvent = await provider.events.createEvent(mockCreateEvent());
        const createdHousehold = await createHousehold(provider, createdEvent);
        cy.wrap(createdEvent.id).as('eventId');
        cy.wrap(createdEvent.name).as('eventName');
        cy.wrap(createdHousehold.mockCreateHousehold.homeAddress).as('homeAddress');
        cy.wrap(createdHousehold.mockCreateHousehold.primaryBeneficiary.identitySet).as('personalInfo');
        cy.wrap(createdHousehold.registrationResponse.caseFile.caseFileNumber).as('caseFileNumber');
        cy.wrap(createdHousehold.registrationResponse.household.registrationNumber).as('registrationNumber');
        cy.wrap(createdHousehold.registrationResponse.household.address.address).as('duplicateHouseholdAddress');
        cy.wrap(provider).as('provider');
        cy.login();
      });
    });
  });
  it('should create potential duplicate records when entering same home address', function () {
    cy.then(async () => {
      const createDuplicateHousehold = mockCreateDuplicateHouseholdWithSameAddressRequest(this.homeAddress, this.eventId);
      const duplicateHousehold = await this.provider.households.postPublicRegistration(createDuplicateHousehold);
      cy.goTo(`casefile/household/${duplicateHousehold.caseFile.householdId}`);
    });

    potentialDuplicateCreatedSteps({
      firstName: this.personalInfo.firstName,
      lastName: this.personalInfo.lastName,
      registrationNumber: this.registrationNumber,
      caseFileNumber: this.caseFileNumber,
      eventName: this.eventName.translation.en,
      duplicateHouseholdAddress: this.duplicateHouseholdAddress,
    });
  });
});
