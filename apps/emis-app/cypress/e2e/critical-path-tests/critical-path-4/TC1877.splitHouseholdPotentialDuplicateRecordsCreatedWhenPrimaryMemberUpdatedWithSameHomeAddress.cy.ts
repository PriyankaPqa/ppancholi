import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { padNumberWithZeroes } from '@libs/cypress-lib/helpers';
import { IAddressPageFields } from '@libs/cypress-lib/pages/registration/address.page';
import { faker } from '@faker-js/faker';
import { createEventAndTeam, prepareStateHousehold } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { PotentialDuplicateBasis, potentialDuplicateCreatedSteps, splitHouseholdDuplicateHouseholdSteps } from './canSteps';
import { CaseFilesHomePage } from '../../../pages/casefiles/caseFilesHome.page';

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

let accessTokenL6 = '';

// eslint-disable-next-line
describe('#TC1877# - Split Household - Potential duplicate records created when Home Address updated to match that of another household', { tags: ['@household'] }, () => {
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
            const resultComparisonHousehold = await prepareStateHousehold(accessTokenL6, this.eventCreated);
            cy.wrap(resultOriginalHousehold.mockCreateHousehold.primaryBeneficiary).as('originalHouseholdPrimaryBeneficiary');
            cy.wrap(resultOriginalHousehold.registrationResponse.caseFile.caseFileNumber).as('originalHouseholdCaseFileNumber');
            cy.wrap(resultOriginalHousehold.registrationResponse.household.registrationNumber).as('originalHouseholdRegistrationNumber');
            cy.wrap(resultOriginalHousehold.mockCreateHousehold.homeAddress).as('originalHouseholdHomeAddress');
            cy.wrap(resultComparisonHousehold.mockCreateHousehold.additionalMembers[0].identitySet).as('comparisonHouseholdNewPrimaryMember');
            cy.login(roleName);
            cy.goTo(`casefile/household/${resultComparisonHousehold.registrationResponse.household.id}`);
          });
        });
        it('should create potential duplicate records when crc user splits household with primary member having home address matching another household', function () {
          const potentialDuplicateAddressData: IAddressPageFields = {
            unitNumber: this.originalHouseholdHomeAddress.unitSuite,
            streetAddress: this.originalHouseholdHomeAddress.streetAddress,
            municipality: this.originalHouseholdHomeAddress.city,
            province: 'AB',
            postalCode: this.originalHouseholdHomeAddress.postalCode,
            tempAddress: 'Remaining in home',
          };

          splitHouseholdDuplicateHouseholdSteps({
            eventName: this.eventCreated.name.translation.en,
            originalHouseholdPrimaryBeneficiary: this.originalHouseholdPrimaryBeneficiary,
            splitMemberHouesholdAddress: potentialDuplicateAddressData,
            splitMemberPhoneNumber: faker.phone.number('5143######'),
            comparisonHouseholdNewPrimaryMember: this.comparisonHouseholdNewPrimaryMember,
            potentialDuplicateBasis: PotentialDuplicateBasis.HomeAddress,
            roleName,
          });

          potentialDuplicateCreatedSteps({
            firstName: this.originalHouseholdPrimaryBeneficiary.identitySet.firstName,
            lastName: this.originalHouseholdPrimaryBeneficiary.identitySet.lastName,
            registrationNumber: this.originalHouseholdRegistrationNumber,
            caseFileNumber: this.originalHouseholdCaseFileNumber,
            eventName: this.eventCreated.name.translation.en,
            potentialDuplicateBasis: PotentialDuplicateBasis.HomeAddress,
            duplicateHouseholdAddress: this.originalHouseholdHomeAddress,
            roleName,
          });

          cy.get('@registrationNumberDuplicateHousehold').then((registrationNumberDuplicateHousehold) => {
            potentialDuplicateCreatedSteps({
              firstName: this.comparisonHouseholdNewPrimaryMember.firstName,
              lastName: this.comparisonHouseholdNewPrimaryMember.lastName,
              registrationNumber: `${registrationNumberDuplicateHousehold}`,
              caseFileNumber: `${registrationNumberDuplicateHousehold}-${padNumberWithZeroes(6, this.eventCreated.number)}`,
              eventName: this.eventCreated.name.translation.en,
              potentialDuplicateBasis: PotentialDuplicateBasis.HomeAddress,
              duplicateHouseholdAddress: this.originalHouseholdHomeAddress,
              roleName,
            });
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
        it('should not be able to split a household', () => {
          const caseFileHomePage = new CaseFilesHomePage();

          const householdProfilePage = caseFileHomePage.getFirstAvailableHousehold();
          householdProfilePage.getHouseholdSize().should('be.visible');
          householdProfilePage.getSplitMemberButtons().should('not.exist');
        });
      });
    }
  });
});
