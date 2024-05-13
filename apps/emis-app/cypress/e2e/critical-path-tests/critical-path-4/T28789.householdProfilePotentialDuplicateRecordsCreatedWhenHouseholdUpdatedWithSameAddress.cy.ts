import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { IAddressPageFields } from '@libs/cypress-lib/pages/registration/address.page';
import { createEventAndTeam, prepareStateHousehold } from '../../helpers/prepareState';
import { HouseholdProfilePage } from '../../../pages/casefiles/householdProfile.page';
import { PotentialDuplicateBasis, potentialDuplicateCreatedSteps } from './canSteps';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { CaseFilesHomePage } from '../../../pages/casefiles/caseFilesHome.page';

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

describe('[T28789] Household Profile - Potential duplicate records created when Home Address updated to match that of another household', { tags: ['@household'] }, () => {
  before(() => {
    cy.getToken().then(async (tokenResponse) => {
      accessTokenL6 = tokenResponse.access_token;
      const resultCreatedEvent = await createEventAndTeam(accessTokenL6, allRoles);
      cy.wrap(resultCreatedEvent.provider).as('provider');
      cy.wrap(resultCreatedEvent.team).as('teamCreated');
      cy.wrap(resultCreatedEvent.event).as('eventCreated');
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
            const resultOriginalHousehold = await prepareStateHousehold(accessTokenL6, this.eventCreated);
            const resultDuplicateHousehold = await prepareStateHousehold(accessTokenL6, this.eventCreated);
            cy.wrap(resultOriginalHousehold.mockCreateHousehold.primaryBeneficiary).as('originalHouseholdPrimaryBeneficiary');
            cy.wrap(resultOriginalHousehold.mockCreateHousehold.homeAddress).as('originalHouseholdHomeAddress');
            cy.wrap(resultOriginalHousehold.registrationResponse.caseFile.caseFileNumber).as('originalHouseholdCaseFileNumber');
            cy.wrap(resultOriginalHousehold.registrationResponse.household.registrationNumber).as('originalHouseholdRegistrationNumber');
            cy.wrap(resultDuplicateHousehold.mockCreateHousehold.primaryBeneficiary).as('duplicateHouseholdPrimaryBeneficiary');
            cy.wrap(resultDuplicateHousehold.registrationResponse.caseFile.caseFileNumber).as('duplicateHouseholdCaseFileNumber');
            cy.wrap(resultDuplicateHousehold.registrationResponse.household.registrationNumber).as('duplicateHouseholdRegistrationNumber');
            cy.login(roleName);
            cy.goTo(`casefile/household/${resultDuplicateHousehold.registrationResponse.household.id}`);
          });
        });
        it('should flag potential duplicates when crc user updates home address to match another household', function () {
          const householdProfilePage = new HouseholdProfilePage();

          const potentialDuplicateAddressData: IAddressPageFields = {
            unitNumber: this.originalHouseholdHomeAddress.unitSuite,
            streetAddress: this.originalHouseholdHomeAddress.streetAddress,
            municipality: this.originalHouseholdHomeAddress.city,
            province: 'AB',
            postalCode: this.originalHouseholdHomeAddress.postalCode,
          };

          const editHouseholdAddressPage = householdProfilePage.editAddress();
          editHouseholdAddressPage.fillUpdatedAddressData(potentialDuplicateAddressData, '');
          editHouseholdAddressPage.fillUnitNumber(potentialDuplicateAddressData);
          editHouseholdAddressPage.saveUpdatedAddress();

          // asserts value of original household in duplicate household's Manage Duplicate pop up
          potentialDuplicateCreatedSteps({
            firstName: this.originalHouseholdPrimaryBeneficiary.identitySet.firstName,
            lastName: this.originalHouseholdPrimaryBeneficiary.identitySet.lastName,
            registrationNumber: this.originalHouseholdRegistrationNumber,
            caseFileNumber: this.originalHouseholdCaseFileNumber,
            eventName: this.eventCreated.name.translation.en,
            potentialDuplicateBasis: PotentialDuplicateBasis.HomeAddress,
            duplicateHouseholdAddress: this.originalHouseholdHomeAddress,
            roleName,
            caseFileLogIndex: 1,
          });

          // asserts value of duplicate household in original household's Manage Duplicate pop up
          potentialDuplicateCreatedSteps({
            firstName: this.duplicateHouseholdPrimaryBeneficiary.identitySet.firstName,
            lastName: this.duplicateHouseholdPrimaryBeneficiary.identitySet.lastName,
            registrationNumber: this.duplicateHouseholdRegistrationNumber,
            caseFileNumber: this.duplicateHouseholdCaseFileNumber,
            eventName: this.eventCreated.name.translation.en,
            potentialDuplicateBasis: PotentialDuplicateBasis.HomeAddress,
            duplicateHouseholdAddress: this.originalHouseholdHomeAddress,
            roleName,
          });
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
        it('should not be able to flag potential duplicates with crc user not able to update home address to match another household', () => {
          const caseFileHomePage = new CaseFilesHomePage();

          const householdProfilePage = caseFileHomePage.getFirstAvailableHousehold();
          householdProfilePage.getHouseholdSize().should('be.visible');
          householdProfilePage.getEditAddressButton().should('not.exist');
        });
      });
    }
  });
});
