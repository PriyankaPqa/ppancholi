import { UserRoles } from '@libs/cypress-lib/support/msal';
import { IEventEntity } from '@libs/entities-lib/event';
import { CrcRegistrationPage } from '../../../pages/registration/crcRegistration.page';
import { fixturePrimaryMember, fixtureAddressData, fixtureAdditionalMemberPersonalData } from '../../../fixtures/registration';
import { ConfirmBeneficiaryRegistrationPage } from '../../../pages/registration/confirmBeneficiaryRegistration.page';
import { useProvider } from '../../../provider/provider';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { createEventWithTeamWithUsers } from '../../helpers/prepareState';

const canRoles = {
  Level6: UserRoles.level6,
  Level5: UserRoles.level5,
  Level4: UserRoles.level4,
  Level3: UserRoles.level3,
  Level2: UserRoles.level2,
  Level1: UserRoles.level1,
  Level0: UserRoles.level0,
};

const cannotRoles = {
  Contributor1: UserRoles.contributor1,
  Contributor2: UserRoles.contributor2,
  Contributor3: UserRoles.contributor3,
  ReadOnly: UserRoles.readonly,
};

const allRolesValues = [...Object.values(canRoles), ...Object.values(cannotRoles)];

let event = null as IEventEntity;

const prepareState = () => cy.getToken().then(async (accessToken) => {
  const provider = useProvider(accessToken.access_token);
  const result = await createEventWithTeamWithUsers(provider, allRolesValues);
  event = result.event;
  const { team } = result;
  cy.wrap(team).as('teamCreated');
  cy.wrap(provider).as('provider');
});

const title = '#TC1110# - Register Beneficiary for Event';
describe(`${title}`, () => {
  before(() => {
    prepareState();
  });

  after(function () {
    if (this.provider && this.teamCreated?.id) {
      removeTeamMembersFromTeam(this.teamCreated.id, this.provider, allRolesValues);
    }
  });

  describe('Can Roles', () => {
    for (const [roleName, roleValue] of Object.entries(canRoles)) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.login(roleValue);
          cy.goTo('registration');
        });
        // eslint-disable-next-line
        it('should successfully register beneficiary for event', function() {
          const crcRegistrationPage = new CrcRegistrationPage();
          const primaryMemberData = fixturePrimaryMember(this.test.retries.length);
          const addressData = fixtureAddressData();
          const additionalMemberPersonalData = fixtureAdditionalMemberPersonalData(this.test.retries.length);

          crcRegistrationPage.getPageTitle().should('eq', 'Welcome, let\'s get started. Please select an event:');
          crcRegistrationPage.getBeginRegistrationButton().should('be.disabled');
          crcRegistrationPage.fillEvent(event.name.translation.en);

          const beneficiarySearchPage = crcRegistrationPage.beginRegistration();

          const crcPrivacyStatementPage = beneficiarySearchPage.goToCrcPrivacyStatementPage();
          crcPrivacyStatementPage.getPrivacyCheckbox().click({ force: true }).should('be.checked');
          crcPrivacyStatementPage.fillUserNameIfEmpty(roleName);
          crcPrivacyStatementPage.fillPrivacyRegistrationMethod('Phone');

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
          reviewRegistrationPage.getFirstName().should('string', `${roleName}${primaryMemberData.firstName}`);
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

          personalInformationPage.selectPreferredLanguage('English');

          reviewRegistrationPage.submitRegistration();
          reviewRegistrationPage.getPreferredLanguage().should('string', 'English');
          reviewRegistrationPage.goToConfirmationPage();

          const confirmBeneficiaryRegistrationPage = new ConfirmBeneficiaryRegistrationPage();
          confirmBeneficiaryRegistrationPage.getFullName().should('string', `${roleName}${primaryMemberData.firstName}`).and('string', `${primaryMemberData.lastName}`);
          confirmBeneficiaryRegistrationPage.getMessage().should('string', ' is now registered!');
          confirmBeneficiaryRegistrationPage.getRegistrationNumber().should('exist');
          confirmBeneficiaryRegistrationPage.getEventName().should('string', event.name.translation.en);
          confirmBeneficiaryRegistrationPage.getPrintButton().should('be.visible');
          confirmBeneficiaryRegistrationPage.getNewRegistrationButton().should('be.visible');

          const caseFilesHomePage = confirmBeneficiaryRegistrationPage.goToCaseFiles();
          caseFilesHomePage.getCaseFileTable().should('be.visible');
          cy.contains(`${roleName}${primaryMemberData.firstName} ${primaryMemberData.lastName}`).should('be.visible');
        });
      });
    }
  });
  describe('Cannot Roles', () => {
    for (const [roleName, roleValue] of Object.entries(cannotRoles)) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.login(roleValue);
          cy.goTo('registration');
        });
        it('should not be able to register beneficiary for event', () => {
          cy.contains('You do not have permission to access this page').should('be.visible');
        });
      });
    }
  });
});
