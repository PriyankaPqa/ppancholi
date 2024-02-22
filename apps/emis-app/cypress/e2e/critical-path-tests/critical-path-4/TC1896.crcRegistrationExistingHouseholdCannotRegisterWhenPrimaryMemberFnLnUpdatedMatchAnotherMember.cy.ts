import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { getToday } from '@libs/cypress-lib/helpers';
import { IPersonalInfoFields } from '@libs/cypress-lib/pages/registration/personalInformation.page';
import { createEventAndTeam, prepareStateHousehold } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { CrcRegistrationPage } from '../../../pages/registration/crcRegistration.page';
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

let accessTokenL6 = '';

// eslint-disable-next-line
describe('#TC1896# - CRC REG existing household- Cannot register to Event when Primary Last Name + First Name + Phone updated to match another member in EMIS', { tags: ['@household'] }, () => {
  before(() => {
    cy.getToken().then(async (tokenResponse) => {
      accessTokenL6 = tokenResponse.access_token;
      const resultCreatedPrimaryEvent = await createEventAndTeam(accessTokenL6, allRoles);
      const resultPrimaryHouseholdPrimaryEvent = await prepareStateHousehold(accessTokenL6, resultCreatedPrimaryEvent.event);
      const resultSecondaryHouseholdPrimaryEvent = await prepareStateHousehold(accessTokenL6, resultCreatedPrimaryEvent.event);
      const resultCreatedSecondaryEvent = await createEventAndTeam(accessTokenL6, allRoles);
      cy.wrap(resultPrimaryHouseholdPrimaryEvent.mockCreateHousehold.primaryBeneficiary.identitySet).as('primaryHouseholdPrimaryBeneficiary');
      // eslint-disable-next-line
      cy.wrap(resultPrimaryHouseholdPrimaryEvent.mockCreateHousehold.primaryBeneficiary.contactInformation.homePhoneNumber.number).as('primaryHouseholdPrimaryBeneficiaryPhoneNumber');
      cy.wrap(resultSecondaryHouseholdPrimaryEvent.registrationResponse.household.registrationNumber).as('secondaryHouseholdRegistrationNumber');
      cy.wrap(resultSecondaryHouseholdPrimaryEvent.mockCreateHousehold.primaryBeneficiary.identitySet).as('secondaryHouseholdPrimaryBeneficiary');
      cy.wrap(resultCreatedPrimaryEvent.provider).as('provider');
      cy.wrap(resultCreatedPrimaryEvent.team).as('teamCreated');
      cy.wrap(resultCreatedPrimaryEvent.event).as('primaryEventCreated');
      cy.wrap(resultCreatedSecondaryEvent.event).as('secondaryEventCreated');
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
          cy.then(async () => {
            cy.login(roleName);
            cy.goTo('registration');
          });
        });
        it('should not be able to Cannot register to Event when Primary Last Name + First Name + Phone updated to match another member in EMIS', function () {
          const crcRegistrationPage = new CrcRegistrationPage();
          crcRegistrationPage.getPageTitle().should('eq', 'Welcome, let\'s get started. Please select an event:');
          crcRegistrationPage.fillEvent(this.secondaryEventCreated.name.translation.en);

          const beneficiarySearchPage = crcRegistrationPage.beginRegistration();
          beneficiarySearchPage.enterRegistrationNumber(this.secondaryHouseholdRegistrationNumber);
          beneficiarySearchPage.searchBeneficiaries();
          beneficiarySearchPage.getDetailsButton().should('be.visible');
          beneficiarySearchPage.getNextButton().should('be.visible');
          beneficiarySearchPage.getBackButton().should('be.visible');

          const associateHouseholdPage = beneficiarySearchPage.goToAssociateHouseholdPage();
          // eslint-disable-next-line
          associateHouseholdPage.getExistingBeneficiarySummary().contains(`${this.secondaryHouseholdPrimaryBeneficiary.firstName} ${this.secondaryHouseholdPrimaryBeneficiary.lastName}`).should('be.visible');
          associateHouseholdPage.getExistingBeneficiarySummary().contains(getToday()).should('be.visible');
          associateHouseholdPage.getRegisteredEvent().contains(this.primaryEventCreated.name.translation.en).should('be.visible');
          associateHouseholdPage.getPrivacyCheckbox().click({ force: true }).should('be.checked');
          associateHouseholdPage.fillUserNameIfEmpty(roleName);
          associateHouseholdPage.fillPrivacyRegistrationMethod(PrivacyRegistrationMethod.Phone);
          associateHouseholdPage.editPersonalInformation();
          const duplicatePrimaryBeneficiaryData: IPersonalInfoFields = {
            firstName: this.primaryHouseholdPrimaryBeneficiary.firstName,
            lastName: this.primaryHouseholdPrimaryBeneficiary.lastName,
            phoneNumber: this.primaryHouseholdPrimaryBeneficiaryPhoneNumber,
          };
          associateHouseholdPage.fill(duplicatePrimaryBeneficiaryData, '');
          associateHouseholdPage.fillPhoneNumber(duplicatePrimaryBeneficiaryData.phoneNumber);
          associateHouseholdPage.savePersonalInformation();
          cy.contains('This individual already exists in the system').should('be.visible');
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
        it('should not be able to register to an event', () => {
          cy.contains('You do not have permission to access this page').should('be.visible');
        });
      });
    }
  });
});
