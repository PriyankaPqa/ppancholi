import { faker } from '@faker-js/faker';
import { IAddressPageFields } from '@libs/cypress-lib/pages/registration/address.page';
import { mockCreateHouseholdRequest } from '@libs/cypress-lib/mocks/household/household';
import { IPersonalInfoFields } from '@libs/cypress-lib/pages/registration/personalInformation.page';
import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getUserName } from '@libs/cypress-lib/helpers/users';
import { IEventEntity } from '@libs/entities-lib/event';
import { CaseFilesHomePage } from 'cypress/pages/casefiles/caseFilesHome.page';
import { ICRCPrivacyStatementPageFields } from '../../../pages/registration/crcPrivacyStatement.page';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { useProvider } from '../../../provider/provider';
import { createEventWithTeamWithUsers } from '../../helpers/prepareState';
import { DataTest, HouseholdProfilePage } from '../../../pages/casefiles/householdProfile.page';

const privacyData: ICRCPrivacyStatementPageFields = {
  privacyRegistrationMethod: 'Phone',
  userName: faker.name.fullName(),
};

const primaryBeneficiaryData: IPersonalInfoFields = {
  preferredLanguage: 'French',
  indigenousIdentity: faker.helpers.arrayElement(['First Nation', 'Metis', 'Inuit', 'Other']),
};

const createAddressData: IAddressPageFields = {
  placeName: faker.address.city(),
  streetAddress: faker.address.streetAddress(),
  municipality: faker.address.cityName(),
  province: faker.helpers.arrayElement(['ON', 'QC', 'MB', 'NU']),
  postalCode: faker.helpers.replaceSymbols('?#?#?#'),
  tempAddress: 'Remaining in home',
};

const canRoles = {
  Level6: UserRoles.level6,
  Level5: UserRoles.level5,
  Level4: UserRoles.level4,
  Level3: UserRoles.level3,
  Level2: UserRoles.level2,
};

const cannotRoles = {
  Level1: UserRoles.level1,
  Level0: UserRoles.level0,
  Contributor1: UserRoles.contributor1,
  Contributor2: UserRoles.contributor2,
  Contributor3: UserRoles.contributor3,
  ReadOnly: UserRoles.readonly,
};

const allRolesValues = [...Object.values(canRoles), ...Object.values(cannotRoles)];

let event = null as IEventEntity;
let accessTokenL6 = '';

const prepareState = async (accessToken: string, event: IEventEntity) => {
  const provider = useProvider(accessToken);
  const mockCreateHousehold = mockCreateHouseholdRequest({ eventId: event.id });
  cy.wrap(mockCreateHousehold).as('household');
  const caseFileCreated = await provider.households.postCrcRegistration(mockCreateHousehold);
  cy.wrap(caseFileCreated.caseFile.householdId).as('householdCreated');
};

const prepareEventTeam = async (accessToken: string) => {
  const provider = useProvider(accessToken);
  const result = await createEventWithTeamWithUsers(provider, allRolesValues);
  event = result.event;
  const { team } = result;
  cy.wrap(team).as('teamCreated');
  cy.wrap(provider).as('provider');
};

const title = '#TC498# - Split Household';

describe(`${title}`, () => {
  before(() => {
    cy.getToken().then(async (tokenResponse) => {
      accessTokenL6 = tokenResponse.access_token;
      await prepareEventTeam(accessTokenL6);
    });
  });

  after(function () {
    if (this.teamCreated?.id && this.provider) {
      removeTeamMembersFromTeam(this.teamCreated.id, this.provider, allRolesValues);
    }
  });

  describe('Can roles', () => {
    for (const [roleName, roleValue] of Object.entries(canRoles)) {
      describe(`${roleName}`, () => {
        beforeEach(async () => {
          await prepareState(accessTokenL6, event);
          cy.login(roleValue);
         // eslint-disable-next-line
          cy.get('@householdCreated').then((householdId) => {
            cy.goTo(`casefile/household/${householdId}`);
          });
        });
        // eslint-disable-next-line
        it('should successfully split the household', function() {
          const householdProfilePage = new HouseholdProfilePage();
          const eventName = event.name.translation.en;
          const firstNamePrimaryMemberAfterSplit = this.household.additionalMembers[0].identitySet.firstName;
          const lastNamePrimaryMemberAfterSplit = this.household.additionalMembers[0].identitySet.lastName;

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
          crcPrivacyStatementPage.fillUserNameIfEmpty(privacyData.userName); // checks if CRC User Name field is empty and fills with a name if application is run using localhost.
          const personalInfoSplitMemberPage = crcPrivacyStatementPage.goToPersonalInfoSplitMemberPage();
          personalInfoSplitMemberPage.fill(primaryBeneficiaryData);

          const addressSplitHouseholdPage = personalInfoSplitMemberPage.goToAddressSplitHouseholdPage();
          addressSplitHouseholdPage.fill(createAddressData);
          const householdMembersAfterSplitPage = addressSplitHouseholdPage.goToHouseholdMembersAfterSplitPage();

          householdMembersAfterSplitPage.getAdditionalMemberDetails(0).should('string', nameFirstMember);
          householdMembersAfterSplitPage.getAdditionalMemberDetails(1).should('string', nameSecondMember);

          const reviewSplitInformationPage = householdMembersAfterSplitPage.goToReviewSplitInformationPage();
          reviewSplitInformationPage.getPrimaryFullNameMember().should('string', firstNamePrimaryMemberAfterSplit);
          reviewSplitInformationPage.getPrimaryFullNameMember().should('string', lastNamePrimaryMemberAfterSplit);

          // eslint-disable-next-line max-nested-callbacks
          cy.get('@dateOfBirthArray').then((birthdateMember) => {
            reviewSplitInformationPage.getBirthDate().should('string', birthdateMember[1]);
            reviewSplitInformationPage.getAdditionalMemberBirthdate(0).should('string', birthdateMember[2]);
            reviewSplitInformationPage.getAdditionalMemberBirthdate(1).should('string', birthdateMember[3]);
          });
          // eslint-disable-next-line max-nested-callbacks
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

          householdProfilePage.getFullNameOfMember(0).should('string', namePrimaryMemberAfterSplit);
          householdProfilePage.getFullNameOfMember(1).should('string', nameFirstMember);
          householdProfilePage.getFullNameOfMember(2).should('string', nameSecondMember);

          const caseFileDetailsPage = householdProfilePage.goToCaseFileDetailsPage();
          // eslint-disable-next-line max-nested-callbacks
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
    for (const [roleName, roleValue] of Object.entries(cannotRoles)) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.login(roleValue);
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
