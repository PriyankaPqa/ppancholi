import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { capitalize } from '@libs/cypress-lib/helpers';
import { PreferredLanguage } from '@libs/cypress-lib/pages/registration/personalInformation.page';
import { CrcRegistrationPage } from '../../../pages/registration/crcRegistration.page';
import { fixturePrimaryMember, fixtureAddressData, fixtureAdditionalMemberPersonalData } from '../../../fixtures/registration';
import { ConfirmBeneficiaryRegistrationPage } from '../../../pages/registration/confirmBeneficiaryRegistration.page';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { createEventAndTeam } from '../../helpers/prepareState';
import { PrivacyRegistrationMethod } from '../../../pages/registration/crcPrivacyStatement.page';

const canRoles = [
  UserRoles.level6,
  UserRoles.level5,
  UserRoles.level4,
  UserRoles.level3,
  UserRoles.level2,
  UserRoles.level1,
  UserRoles.level0,
];

const cannotRoles = [
  UserRoles.contributor1,
  UserRoles.contributor2,
  UserRoles.contributor3,
  UserRoles.readonly,
];

const { filteredCanRoles, filteredCannotRoles, allRoles } = getRoles(canRoles, cannotRoles);

describe('#TC1110# - Register Beneficiary for Event .', { tags: ['@registration'] }, () => {
  before(() => {
    cy.getToken().then(async (accessToken) => {
      const { provider, event, team } = await createEventAndTeam(accessToken.access_token, allRoles);
      cy.wrap(provider).as('provider');
      cy.wrap(event).as('event');
      cy.wrap(team).as('teamCreated');
    });
  });

  after(function () {
    if (this.provider && this.teamCreated?.id) {
      removeTeamMembersFromTeam(this.teamCreated.id, this.provider);
    }
  });

  describe('Can Roles', () => {
    for (const roleName of filteredCanRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.login(roleName);
          cy.goTo('registration');
        });
        // eslint-disable-next-line
        it('should successfully register beneficiary for event', function() {
          const crcRegistrationPage = new CrcRegistrationPage();
          const primaryMemberData = fixturePrimaryMember(this.test.retries.length);
          const addressData = fixtureAddressData();
          const additionalMemberPersonalData = fixtureAdditionalMemberPersonalData(this.test.retries.length);
          const roleNameCap = capitalize(roleName);

          crcRegistrationPage.getPageTitle().should('eq', 'Welcome, let\'s get started. Please select an event:');
          crcRegistrationPage.getBeginRegistrationButton().should('be.disabled');
          crcRegistrationPage.fillEvent(this.event.name.translation.en);

          const beneficiarySearchPage = crcRegistrationPage.beginRegistration();

          const crcPrivacyStatementPage = beneficiarySearchPage.goToCrcPrivacyStatementPage();
          crcPrivacyStatementPage.getPrivacyCheckbox().click({ force: true }).should('be.checked');
          crcPrivacyStatementPage.fillUserNameIfEmpty(roleName);
          crcPrivacyStatementPage.fillPrivacyRegistrationMethod(PrivacyRegistrationMethod.Phone);

          const personalInformationPage = crcPrivacyStatementPage.goToPersonalInfoPage();
          personalInformationPage.fill(primaryMemberData, roleName);

          const addressPage = personalInformationPage.goToAddressPage();
          addressPage.fill(addressData);

          const householdMembersPage = addressPage.goToHouseholdMembersPage();

          const addHouseholdMemberPage = householdMembersPage.addMember();
          addHouseholdMemberPage.fill(additionalMemberPersonalData);
          addHouseholdMemberPage.addHouseholdMember();

          householdMembersPage.getAdditionalMemberDetails(0).should('eq', `${additionalMemberPersonalData.firstName} ${additionalMemberPersonalData.lastName}`);

          const reviewRegistrationPage = householdMembersPage.goToReviewPage();
          reviewRegistrationPage.getFirstName().should('string', `${roleNameCap}${primaryMemberData.firstName}`);
          reviewRegistrationPage.getLastName().should('string', primaryMemberData.lastName);
          reviewRegistrationPage.getBirthDate().should('string', reviewRegistrationPage.getDateOfBirthString(primaryMemberData.dateOfBirth));
          reviewRegistrationPage.getPreferredLanguage().should('string', primaryMemberData.preferredLanguage);
          reviewRegistrationPage.getGender().should('string', primaryMemberData.gender);
          reviewRegistrationPage.getStreetHomeAddress().should('string', addressData.streetAddress);
          // eslint-disable-next-line
          reviewRegistrationPage.getLineHomeAddress().should('string', `${addressData.municipality}, ${addressData.province}, ${addressData.postalCode}`);
          reviewRegistrationPage.getAdditionalMemberName(0).should('eq', `${additionalMemberPersonalData.firstName} ${additionalMemberPersonalData.lastName}`);
          reviewRegistrationPage.getAdditionalMemberBirthdate(0).should('string', reviewRegistrationPage.getDateOfBirthString(additionalMemberPersonalData.dateOfBirth));
          reviewRegistrationPage.getAdditionalMemberGender(0).should('eq', additionalMemberPersonalData.gender);
          reviewRegistrationPage.editPersonalInformation();

          personalInformationPage.selectPreferredLanguage(PreferredLanguage.English);

          reviewRegistrationPage.submitRegistration();
          reviewRegistrationPage.getPreferredLanguage().should('string', PreferredLanguage.English);
          reviewRegistrationPage.goToConfirmationPage();

          const confirmBeneficiaryRegistrationPage = new ConfirmBeneficiaryRegistrationPage();
          confirmBeneficiaryRegistrationPage.getFullName().should('string', `${roleNameCap}${primaryMemberData.firstName}`).and('string', `${primaryMemberData.lastName}`);
          confirmBeneficiaryRegistrationPage.getMessage().should('string', ' is now registered!');
          confirmBeneficiaryRegistrationPage.getRegistrationNumber().should('exist');
          confirmBeneficiaryRegistrationPage.getEventName().should('string', this.event.name.translation.en);
          confirmBeneficiaryRegistrationPage.getPrintButton().should('be.visible');
          confirmBeneficiaryRegistrationPage.getNewRegistrationButton().should('be.visible');

          const caseFilesHomePage = confirmBeneficiaryRegistrationPage.goToCaseFiles();
          caseFilesHomePage.refreshUntilCaseFilesUpdated(`${roleNameCap}${primaryMemberData.firstName} ${primaryMemberData.lastName}`);
          cy.contains(`${roleNameCap}${primaryMemberData.firstName} ${primaryMemberData.lastName}`).should('be.visible');
        });
      });
    }
  });
  describe('Cannot Roles', () => {
     for (const roleName of filteredCannotRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.login(roleName);
          cy.goTo('registration');
        });
        it('should not be able to register beneficiary for event', () => {
          cy.contains('You do not have permission to access this page').should('be.visible');
        });
      });
    }
  });
});
