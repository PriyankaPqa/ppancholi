import { mockCreateEvent } from '@libs/cypress-lib/mocks/events/event';
import { IPersonalInfoFields } from '@libs/cypress-lib/pages/registration/personalInformation.page';
import { fixturePrimaryMember, fixtureAddressData } from '../../../fixtures/registration';
import { RegistrationPage } from '../../../pages/registration.page';
import { useProvider } from '../../../provider/provider';
import { buildRegistrationUrl } from '../../../support/helpers/urlBuilder';
import { createHousehold } from '../../../support/helpers/prepareState';

describe('[T28791] SELF REG - Individual cannot register when entering same Name & Phone number as an existing EMIS member', { tags: ['@registration'] }, () => {
  beforeEach(() => {
    cy.then(async () => {
      cy.getToken().then(async (accessToken) => {
        const provider = useProvider(accessToken.access_token);
        const createdEvent = await provider.events.createEvent(mockCreateEvent());
        await provider.events.toggleSelfRegistration(createdEvent.id, true);
        await provider.households.getPublicToken(null);
        const createdHousehold = await createHousehold(provider, createdEvent);
        cy.wrap(createdHousehold.mockCreateHousehold.primaryBeneficiary.contactInformation.homePhoneNumber.number).as('phoneNumber');
        cy.wrap(createdHousehold.mockCreateHousehold.primaryBeneficiary.identitySet).as('personalInfo');
        cy.wrap(createdEvent.name.translation.en).as('eventName');
        cy.goTo(buildRegistrationUrl(createdEvent));
      });
    });
  });

  it('should not be able to register when entering same name and phone number', function () {
    const primaryMemberData = fixturePrimaryMember(this.test.retries.length);
    const addressData = fixtureAddressData(this.test.retries.length);

    const registrationPage = new RegistrationPage();
    const privacyStatementPage = registrationPage.gotoRegistrationPage();
    privacyStatementPage.getEventName().should('eq', this.eventName);
    privacyStatementPage.getPrivacyCheckbox().click({ force: true }).should('be.checked');

    const personalInformationPage = privacyStatementPage.goToPersonalInfoPage();
    personalInformationPage.fill(primaryMemberData, '');

    const addressPage = personalInformationPage.goToAddressPage();
    addressPage.fill(addressData);

    const householdMembersPage = addressPage.goToHouseholdMembersPage();

    const reviewRegistrationPage = householdMembersPage.goToReviewPage();
    reviewRegistrationPage.editPersonalInformation();
    reviewRegistrationPage.getSaveAfterEditButton().should('be.enabled');
    reviewRegistrationPage.getCancelAfterEditButton().should('be.enabled');

    const duplicatePrimaryBeneficiaryData: IPersonalInfoFields = {
      firstName: this.personalInfo.firstName,
      lastName: this.personalInfo.lastName,
      phoneNumber: this.phoneNumber,
    };
    personalInformationPage.fill(duplicatePrimaryBeneficiaryData, '');
    personalInformationPage.fillPhoneNumber(duplicatePrimaryBeneficiaryData.phoneNumber);
    reviewRegistrationPage.submitRegistration();

    const confirmationPage = reviewRegistrationPage.goToConfirmationPage();
    cy.contains('Unable to complete registration').should('be.visible');
    confirmationPage.getErrorTitleDuplicateRegistration().should('eq', 'This individual already exists in the system');
    confirmationPage.getErrorMessageDuplicateRegistration().should('string', 'We are unable to complete your registration at this time due to one of the following reasons');
    confirmationPage.getErrorMessageDuplicateRegistration().should('string', '- You have already registered with us for this event');
    confirmationPage.getErrorMessageDuplicateRegistration().should('string', '- You are registered with us from a previous event');
    cy.contains('Please contact the Canadian Red Cross if you need further assistance.').should('be.visible');
  });
});
