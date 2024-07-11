import { mockCreateEvent } from '@libs/cypress-lib/mocks/events/event';
import { mockCreateDuplicateHouseholdWithGivenPhoneNumberRequest } from '@libs/cypress-lib/mocks/household/household';
import { UserRoles } from '@libs/cypress-lib/support/msal';
import { useProvider } from '../../../provider/provider';
import { createHousehold } from '../../helpers/prepareState';
import { PotentialDuplicateBasis, potentialDuplicateCreatedSteps } from './canSteps';

describe('[T28787] SELF REG - Potential duplicate records created when individual enters same Phone number as an existing EMIS household', { tags: ['@registration'] }, () => {
  beforeEach(() => {
    cy.then(async () => {
      cy.getToken().then(async (accessToken) => {
        const provider = useProvider(accessToken.access_token);
        const createdEvent = await provider.events.createEvent(mockCreateEvent());
        const createdHousehold = await createHousehold(provider, createdEvent);
        cy.wrap(createdEvent.id).as('eventId');
        cy.wrap(createdEvent.name).as('eventName');
        cy.wrap(createdHousehold.mockCreateHousehold.primaryBeneficiary.contactInformation.homePhoneNumber.number).as('phoneNumber');
        cy.wrap(createdHousehold.mockCreateHousehold.primaryBeneficiary.identitySet).as('personalInfo');
        cy.wrap(createdHousehold.registrationResponse.caseFile.caseFileNumber).as('caseFileNumber');
        cy.wrap(createdHousehold.registrationResponse.household.registrationNumber).as('registrationNumber');
        cy.wrap(provider).as('provider');
        cy.login();
      });
    });
  });
  it('should create potential duplicate records when entering same phone number', function () {
    cy.then(async () => {
      const createDuplicateHousehold = mockCreateDuplicateHouseholdWithGivenPhoneNumberRequest(this.eventId, this.phoneNumber);
      await this.provider.households.getPublicToken();
      const duplicateHousehold = await this.provider.households.postPublicRegistration(createDuplicateHousehold);
      cy.goTo(`casefile/household/${duplicateHousehold.caseFile.householdId}`);
    });

    potentialDuplicateCreatedSteps({
      firstName: this.personalInfo.firstName,
      lastName: this.personalInfo.lastName,
      registrationNumber: this.registrationNumber,
      caseFileNumber: this.caseFileNumber,
      eventName: this.eventName.translation.en,
      phoneNumber: this.phoneNumber,
      potentialDuplicateBasis: PotentialDuplicateBasis.PhoneNumber,
      roleName: UserRoles.level6,
    });
  });
});
