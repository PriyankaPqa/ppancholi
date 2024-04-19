import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { getUserName } from '@libs/cypress-lib/helpers/users';
import { IEventEntity } from '@libs/entities-lib/event';
import { CaseFilesHomePage } from 'cypress/pages/casefiles/caseFilesHome.page';
import { fixtureCreateAddress, fixturePrimaryBeneficiary, fixturePrivacy } from 'cypress/fixtures/household';
import { ICreateHouseholdRequest } from '@libs/entities-lib/household-create';
import { ICaseFileEntity } from '@libs/entities-lib/case-file';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { createEventAndTeam, prepareStateHousehold } from '../../helpers/prepareState';
import { DataTest, HouseholdProfilePage } from '../../../pages/casefiles/householdProfile.page';

const canRoles = [
  UserRoles.level6,
  UserRoles.level5,
  UserRoles.level4,
  UserRoles.level3,
  UserRoles.level2,
];

const cannotRoles = [
  UserRoles.level1,
  UserRoles.level0,
  UserRoles.contributor1,
  UserRoles.contributor2,
  UserRoles.contributor3,
  UserRoles.readonly,
];

const { filteredCanRoles, filteredCannotRoles, allRoles } = getRoles(canRoles, cannotRoles);

let event = null as IEventEntity;
let accessTokenL6 = '';
let caseFileCreated = null as ICaseFileEntity;
let household = null as ICreateHouseholdRequest;

describe('#TC498# - Split Household.', { tags: ['@household'] }, () => {
  before(() => {
    cy.getToken().then(async (tokenResponse) => {
      accessTokenL6 = tokenResponse.access_token;
      const result = await createEventAndTeam(accessTokenL6, allRoles);
      const { provider, team } = result;
      event = result.event;
      cy.wrap(provider).as('provider');
      cy.wrap(team).as('teamCreated');
    });
  });

  after(function () {
    if (this.teamCreated?.id && this.provider) {
      removeTeamMembersFromTeam(this.teamCreated.id, this.provider);
    }
  });

  describe('Can roles', () => {
    for (const roleName of filteredCanRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.then(async () => {
            const result = await prepareStateHousehold(accessTokenL6, event);
            caseFileCreated = result.registrationResponse.caseFile;
            household = result.mockCreateHousehold;
            cy.wrap(household).as('household');
            cy.login(roleName);
            cy.goTo(`casefile/household/${caseFileCreated.householdId}`);
          });
        });
        // eslint-disable-next-line
        it('should successfully split the household', function() {
          const eventName = event.name.translation.en;
          const firstNamePrimaryMemberAfterSplit = this.household.additionalMembers[0].identitySet.firstName;
          const lastNamePrimaryMemberAfterSplit = this.household.additionalMembers[0].identitySet.lastName;
          const privacyData = fixturePrivacy();
          const primaryBeneficiaryData = fixturePrimaryBeneficiary();
          const createAddressData = fixtureCreateAddress();

          const householdProfilePage = new HouseholdProfilePage();
          householdProfilePage.getGender().as('genderArray');
          householdProfilePage.getDateOfBirth().as('dateOfBirthArray');
          householdProfilePage.getRegistrationNumber().as('registrationNumber');

          const splitHouseholdMemberPage = householdProfilePage.selectMemberToSplit();
          splitHouseholdMemberPage.selectCheckBoxes();

          const namePrimaryMemberAfterSplit = `${firstNamePrimaryMemberAfterSplit} ${lastNamePrimaryMemberAfterSplit}`;
          const nameFirstMember = `${this.household.additionalMembers[1].identitySet.firstName} ${this.household.additionalMembers[1].identitySet.lastName}`;
          const nameSecondMember = `${this.household.additionalMembers[2].identitySet.firstName} ${this.household.additionalMembers[2].identitySet.lastName}`;

          const beneficiarySearchPage = splitHouseholdMemberPage.goToBeneficiarySearchPage();
          beneficiarySearchPage.getFirstName().should('string', firstNamePrimaryMemberAfterSplit);
          beneficiarySearchPage.getLastName().should('string', lastNamePrimaryMemberAfterSplit);
          beneficiarySearchPage.searchBeneficiaries();
          beneficiarySearchPage.verifyDuplicateBeneficiary().should('not.exist');
          const splitHouseholdPrivacyStatementPage = beneficiarySearchPage.goToSelectEventPage();

          const crcPrivacyStatementPage = splitHouseholdPrivacyStatementPage.fillEvent(eventName);
          crcPrivacyStatementPage.getPrivacyCheckbox().should('not.be.checked');
          crcPrivacyStatementPage.getPrivacyCheckbox().click({ force: true }).should('be.checked');
          crcPrivacyStatementPage.fillPrivacyRegistrationMethod(privacyData.privacyRegistrationMethod);
          crcPrivacyStatementPage.fillUserNameIfEmpty(privacyData.userName); // checks if CRC User Name field is empty and fills with a name if application is run using localhost
          const personalInfoSplitMemberPage = crcPrivacyStatementPage.goToPersonalInfoSplitMemberPage();
          personalInfoSplitMemberPage.fill(primaryBeneficiaryData, roleName);

          const addressSplitHouseholdPage = personalInfoSplitMemberPage.goToAddressSplitHouseholdPage();
          addressSplitHouseholdPage.fill(createAddressData);
          const householdMembersAfterSplitPage = addressSplitHouseholdPage.goToHouseholdMembersAfterSplitPage();

          householdMembersAfterSplitPage.getAdditionalMemberDetails(0).should('string', nameFirstMember);
          householdMembersAfterSplitPage.getAdditionalMemberDetails(1).should('string', nameSecondMember);

          const reviewSplitInformationPage = householdMembersAfterSplitPage.goToReviewSplitInformationPage();
          reviewSplitInformationPage.getPrimaryFullNameMember().should('string', firstNamePrimaryMemberAfterSplit);
          reviewSplitInformationPage.getPrimaryFullNameMember().should('string', lastNamePrimaryMemberAfterSplit);

          cy.get('@dateOfBirthArray').then((birthdateMember) => {
            reviewSplitInformationPage.getBirthDate().should('string', birthdateMember[1]);
            reviewSplitInformationPage.getAdditionalMemberBirthdate(0).should('string', birthdateMember[2]);
            reviewSplitInformationPage.getAdditionalMemberBirthdate(1).should('string', birthdateMember[3]);
          });
          cy.get('@genderArray').then((gender) => {
            reviewSplitInformationPage.getGender().should('string', gender[1]);
            reviewSplitInformationPage.getAdditionalMemberGender(0).should('string', gender[2]);
            reviewSplitInformationPage.getAdditionalMemberGender(1).should('string', gender[3]);
          });
          reviewSplitInformationPage.getStreetHomeAddress().should('string', createAddressData.streetAddress);
          reviewSplitInformationPage.getLineHomeAddress().should('string', createAddressData.municipality).and('string', createAddressData.postalCode);
          reviewSplitInformationPage.getAdditionalMemberName(0).should('string', nameFirstMember);
          reviewSplitInformationPage.getAdditionalMemberName(1).should('string', nameSecondMember);
          const splitConfirmationPage = reviewSplitInformationPage.goToConfirmationPage();

          splitConfirmationPage.getMessage().should('string', firstNamePrimaryMemberAfterSplit).should('string', 'is now registered!');
          splitConfirmationPage.getEventName().should('string', eventName);
          splitConfirmationPage.closeRegistration(); // takes to household profile page

          householdProfilePage.getFullNameOfMemberByIndex(0).should('string', namePrimaryMemberAfterSplit);
          householdProfilePage.getFullNameOfMemberByIndex(1).should('string', nameFirstMember);
          householdProfilePage.getFullNameOfMemberByIndex(2).should('string', nameSecondMember);

          const caseFileDetailsPage = householdProfilePage.goToCaseFileDetailsPage();
          caseFileDetailsPage.waitAndRefreshUntilCaseFileActivityVisibleWithBody('Individual(s) split');
          cy.get('@registrationNumber').then((registrationNumber) => {
            caseFileDetailsPage.getCaseFileActivityTitles()
              .should('string', `Household member(s) split from Household #${registrationNumber}`)
              .and('string', 'Registration');
          });
          caseFileDetailsPage.getCaseFileActivityBodies()
            .should('string', `Created By ${getUserName(roleName)}\nRegistration method: Phone`)
            .and('string', `Individual(s) split: ${namePrimaryMemberAfterSplit}, ${nameFirstMember}, ${nameSecondMember}`);
        });
      });
    }
  });

  describe('Cannot roles', () => {
     for (const roleName of filteredCannotRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.login(roleName);
          cy.goTo('casefile');
        });
        it('should not be able to split the household', () => {
          const caseFileHomePage = new CaseFilesHomePage();

          // We don't need specific household as we just need to verify that spit button is not displayed.
          const householdProfilePage = caseFileHomePage.getFirstAvailableHousehold();

          // We  make sure the page is loaded, by waiting for data to be displayed. Note that we could have chosen something else.
          cy.getByDataTest({ selector: DataTest.dateOfBirth }).should('be.visible');
          householdProfilePage.getSplitIcon().should('not.exist');
        });
      });
    }
  });
});
