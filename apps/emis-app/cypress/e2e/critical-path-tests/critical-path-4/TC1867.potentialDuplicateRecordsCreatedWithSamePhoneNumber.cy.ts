import { mockCreateEvent } from '@libs/cypress-lib/mocks/events/event';
import { mockCreateDuplicateHouseholdWithSamePhoneNumberRequest } from '@libs/cypress-lib/mocks/household/household';
import { useProvider } from '../../../provider/provider';
import { createHousehold } from '../../helpers/prepareState';
import { PotentialDuplicateCreatedStepsParams, potentialDuplicateCreatedSteps } from './canSteps';

describe('#TC1867# : SELF REG - Potential duplicate records created when individual enters same Phone number as an existing EMIS household', { tags: ['@registration'] }, () => {
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
      const createDuplicateHousehold = mockCreateDuplicateHouseholdWithSamePhoneNumberRequest(this.eventId, this.phoneNumber);
      const duplicateHousehold = await this.provider.households.postPublicRegistration(createDuplicateHousehold);
      cy.goTo(`casefile/household/${duplicateHousehold.caseFile.householdId}`);
    });

    const potentialDuplicateCreatedStepsParamData: PotentialDuplicateCreatedStepsParams = {
      firstName: this.personalInfo.firstName,
      lastName: this.personalInfo.lastName,
      registrationNumber: this.registrationNumber,
      caseFileNumber: this.caseFileNumber,
      eventName: this.eventName.translation.en,
      phoneNumber: this.phoneNumber,
    };
    potentialDuplicateCreatedSteps(potentialDuplicateCreatedStepsParamData);
  });
});
