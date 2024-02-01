import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { getUserName, getUserRoleDescription } from '@libs/cypress-lib/helpers/users';
import { createEventAndTeam, prepareStateHousehold } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { CaseFilesHomePage } from '../../../pages/casefiles/caseFilesHome.page';
import {
  DuplicatedBy,
  PotentialDuplicateBasis,
  manualDuplicateCreatedSteps,
  potentialDuplicateCreatedSteps,
} from './canSteps';

const canRoles = [
  UserRoles.level6,
  UserRoles.level5,
  UserRoles.level4,
  UserRoles.level3,
  UserRoles.level2,
  UserRoles.level1,
];

const cannotRoles = [
  UserRoles.level0,
  UserRoles.contributor1,
  UserRoles.contributor2,
  UserRoles.contributor3,
  UserRoles.readonly,
];

const { filteredCanRoles, filteredCannotRoles, allRoles } = getRoles(canRoles, cannotRoles);

let accessTokenL6 = '';

describe('#TC1879# - User can manually create potential duplicate records based on a Home Phone number match', { tags: ['@household'] }, () => {
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
            cy.wrap(resultComparisonHousehold.mockCreateHousehold.primaryBeneficiary).as('comparisonHouseholdPrimaryBeneficiary');
            cy.wrap(resultComparisonHousehold.registrationResponse.caseFile.caseFileNumber).as('comparisonHouseholdCaseFileNumber');
            cy.wrap(resultComparisonHousehold.registrationResponse.household.registrationNumber).as('comparisonHouseholdRegistrationNumber');
            cy.login(roleName);
            cy.goTo(`casefile/household/${resultComparisonHousehold.registrationResponse.household.id}`);
          });
        });
        it('should manually create potential duplicate records based on home phone number match', function () {
          manualDuplicateCreatedSteps({
            comparisonHouseholdPrimaryBeneficiary: this.comparisonHouseholdPrimaryBeneficiary,
            originalHouseholdRegistrationNumber: this.originalHouseholdRegistrationNumber,
            duplicatedBy: DuplicatedBy.HomePhoneNumber,
          });

          potentialDuplicateCreatedSteps({
            firstName: this.originalHouseholdPrimaryBeneficiary.identitySet.firstName,
            lastName: this.originalHouseholdPrimaryBeneficiary.identitySet.lastName,
            registrationNumber: this.originalHouseholdRegistrationNumber,
            caseFileNumber: this.originalHouseholdCaseFileNumber,
            eventName: this.eventCreated.name.translation.en,
            potentialDuplicateBasis: PotentialDuplicateBasis.PhoneNumber,
            phoneNumber: this.originalHouseholdPrimaryBeneficiary.contactInformation.homePhoneNumber.number,
            rationale: 'This is a potential duplicate',
            flaggedBy: `${getUserName(roleName)} (${getUserRoleDescription(roleName)})`,
            flaggedByUserName: `${getUserName(roleName)}`,
            roleName,
          });

          potentialDuplicateCreatedSteps({
            firstName: this.comparisonHouseholdPrimaryBeneficiary.identitySet.firstName,
            lastName: this.comparisonHouseholdPrimaryBeneficiary.identitySet.lastName,
            registrationNumber: this.comparisonHouseholdRegistrationNumber,
            caseFileNumber: this.comparisonHouseholdCaseFileNumber,
            eventName: this.eventCreated.name.translation.en,
            potentialDuplicateBasis: PotentialDuplicateBasis.PhoneNumber,
            phoneNumber: this.comparisonHouseholdPrimaryBeneficiary.contactInformation.homePhoneNumber.number,
            rationale: 'This is a potential duplicate',
            flaggedBy: `${getUserName(roleName)} (${getUserRoleDescription(roleName)})`,
            flaggedByUserName: `${getUserName(roleName)}`,
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
        it('should not be able to manually create potential duplicate records', () => {
          const caseFileHomePage = new CaseFilesHomePage();

          const householdProfilePage = caseFileHomePage.getFirstAvailableHousehold();
          householdProfilePage.getDuplicatesIcon().scrollIntoView().should('be.visible');
          householdProfilePage.getManageDuplicatesButton().should('not.exist');
        });
      });
    }
  });
});
