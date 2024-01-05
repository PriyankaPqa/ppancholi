import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { createEventAndTeam, prepareStateHousehold } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { CrcRegistrationPage } from '../../../pages/registration/crcRegistration.page';
import { fixtureAddressData, fixturePrimaryMember } from '../../../fixtures/registration';
import { ConfirmBeneficiaryRegistrationPage } from '../../../pages/registration/confirmBeneficiaryRegistration.page';
import { PotentialDuplicateBasis, potentialDuplicateCreatedSteps } from './canSteps';

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

let accessTokenL6 = '';

// eslint-disable-next-line
describe('#TC1868# - CRC REG NEW HOUSEHOLD - Potential duplicates flagged when user registers individual with same Name & DOB as another EMIS member', { tags: ['@household', '@registration'] }, () => {
  before(() => {
    cy.getToken().then(async (tokenResponse) => {
      accessTokenL6 = tokenResponse.access_token;
      const resultCreateEvent = await createEventAndTeam(accessTokenL6, allRoles);
      cy.wrap(resultCreateEvent.provider).as('provider');
      cy.wrap(resultCreateEvent.team).as('teamCreated');
      cy.wrap(resultCreateEvent.event).as('eventCreated');
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
          cy.then(async function () {
            const result = await prepareStateHousehold(accessTokenL6, this.eventCreated);
            cy.wrap(result.mockCreateHousehold.primaryBeneficiary).as('primaryBeneficiary');
            cy.wrap(result.registrationResponse.caseFile.caseFileNumber).as('caseFileNumber');
            cy.wrap(result.registrationResponse.household.registrationNumber).as('registrationNumber');
            cy.login(roleName);
            cy.goTo('registration');
          });
        });
        it('should flag potential duplicates when crc user registers with same name and dob', function () {
          const primaryMemberData = fixturePrimaryMember(this.test.retries.length);
          const addressData = fixtureAddressData();

          const crcRegistrationPage = new CrcRegistrationPage();
          crcRegistrationPage.getPageTitle().should('eq', 'Welcome, let\'s get started. Please select an event:');
          crcRegistrationPage.fillEvent(this.eventCreated.name.translation.en);

          const beneficiarySearchPage = crcRegistrationPage.beginRegistration();

          const crcPrivacyStatementPage = beneficiarySearchPage.goToCrcPrivacyStatementPage();
          crcPrivacyStatementPage.getPrivacyCheckbox().click({ force: true }).should('be.checked');
          crcPrivacyStatementPage.fillUserNameIfEmpty(roleName);
          crcPrivacyStatementPage.fillPrivacyRegistrationMethod('Phone');

          const personalInformationPage = crcPrivacyStatementPage.goToPersonalInfoPage();

          personalInformationPage.fill(primaryMemberData, '');

          personalInformationPage.fill({
            firstName: this.primaryBeneficiary.identitySet.firstName,
            lastName: this.primaryBeneficiary.identitySet.lastName,
            dateOfBirth: this.primaryBeneficiary.identitySet.dateOfBirth,
          }, '');

          personalInformationPage.getPersonalInfoDuplicateErrorElement()
            .contains('This individual appears to already exist in the system. Please confirm this individual is not a duplicate before proceeding.')
            .should('be.visible');

          const addressPage = personalInformationPage.goToAddressPage();
          addressPage.fill(addressData);

          const householdMembersPage = addressPage.goToHouseholdMembersPage();

          const reviewRegistrationPage = householdMembersPage.goToReviewPage();
          reviewRegistrationPage.goToConfirmationPage();

          const confirmBeneficiaryRegistrationPage = new ConfirmBeneficiaryRegistrationPage();
          confirmBeneficiaryRegistrationPage.getFullName()
            .should('string', this.primaryBeneficiary.identitySet.firstName)
            .and('string', this.primaryBeneficiary.identitySet.lastName);
          confirmBeneficiaryRegistrationPage.getMessage().should('string', ' is now registered!');
          confirmBeneficiaryRegistrationPage.getRegistrationNumber().should('exist');
          confirmBeneficiaryRegistrationPage.getEventName().should('string', this.eventCreated.name.translation.en);
          confirmBeneficiaryRegistrationPage.getPrintButton().should('be.visible');
          confirmBeneficiaryRegistrationPage.getNewRegistrationButton().should('be.visible');

          const caseFilesHomePage = confirmBeneficiaryRegistrationPage.goToCaseFiles();
          caseFilesHomePage.refreshUntilCaseFilesUpdated(`${this.primaryBeneficiary.identitySet.firstName} ${this.primaryBeneficiary.identitySet.lastName}`);
          const householdProfilePage = caseFilesHomePage.goToFirstHouseholdProfile(this.primaryBeneficiary);

          if (roleName === UserRoles.level0) {
            householdProfilePage.getDuplicatesIcon().should('be.visible');
            householdProfilePage.getManageDuplicatesButton().should('not.exist');
          } else {
            potentialDuplicateCreatedSteps({
              firstName: this.primaryBeneficiary.identitySet.firstName,
              lastName: this.primaryBeneficiary.identitySet.lastName,
              registrationNumber: this.registrationNumber,
              caseFileNumber: this.caseFileNumber,
              eventName: this.eventCreated.name.translation.en,
              potentialDuplicateBasis: PotentialDuplicateBasis.NameAndDob,
            });
          }
        });
      });
    }
  });

  describe('Cannot roles', () => {
    for (const roleName of filteredCannotRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.login(roleName);
          cy.goTo('registration');
        });
        it('should not be able to flag potential duplicates when crc user registers with same name and dob', () => {
          cy.contains('You do not have permission to access this page').should('be.visible');
        });
      });
    }
  });
});
