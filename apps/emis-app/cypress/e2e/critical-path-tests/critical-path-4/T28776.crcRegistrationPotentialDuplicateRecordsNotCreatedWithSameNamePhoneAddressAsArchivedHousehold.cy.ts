import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { CaseFileStatus } from '@libs/entities-lib/case-file';
import { HouseholdStatus } from '@libs/entities-lib/household';
import { createEventAndTeam, prepareStateHousehold, setCasefileStatus, setHouseholdStatus } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { fixtureAddressData, fixturePrimaryMember } from '../../../fixtures/registration';
import {
  PotentialDuplicateBasis,
  crcRegisterPotentialDuplicateSteps,
} from './canSteps';
import { HouseholdProfilePage } from '../../../pages/casefiles/householdProfile.page';

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
describe('[T28776] CRC REG NEW HOUSEHOLD - No potential duplicate records created when register with same LN, FN, Phone, and Address as an Archived household', { tags: ['@household'] }, () => {
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
            await setCasefileStatus(result.provider, result.registrationResponse.caseFile.id, CaseFileStatus.Archived);
            await setHouseholdStatus(result.provider, result.registrationResponse.household.id, HouseholdStatus.Archived);
            cy.wrap(result.mockCreateHousehold.primaryBeneficiary).as('primaryBeneficiary');
            cy.wrap(result.registrationResponse.caseFile.caseFileNumber).as('caseFileNumber');
            cy.wrap(result.registrationResponse.household.registrationNumber).as('registrationNumber');
            cy.wrap(result.mockCreateHousehold.homeAddress).as('homeAddress');
            cy.login(roleName);
            cy.goTo('registration');
          });
        });
        it('should not be able to flag a potential duplicates when crc user registers with same LN, FN, Phone, and Address as an Archived household', function () {
          const potentialDuplicateMemberData = fixturePrimaryMember(this.test.retries.length, {
            firstName: this.primaryBeneficiary.identitySet.firstName,
            lastName: this.primaryBeneficiary.identitySet.lastName,
            phoneNumber: this.primaryBeneficiary.contactInformation.homePhoneNumber.number,
          });

          const potentialDuplicateAddressData = fixtureAddressData({
            unitNumber: this.homeAddress.unitSuite,
            streetAddress: this.homeAddress.streetAddress,
            municipality: this.homeAddress.city,
            province: 'AB',
            postalCode: this.homeAddress.postalCode,
          });

          crcRegisterPotentialDuplicateSteps({
            eventName: this.eventCreated.name.translation.en,
            roleName,
            potentialDuplicateMemberData,
            potentialDuplicateAddressData,
            potentialDuplicateBasis: PotentialDuplicateBasis.PhoneNumber,
          });

          const householdProfilePage = new HouseholdProfilePage();
          if (roleName === UserRoles.level0) {
            householdProfilePage.getDuplicatesIcon().scrollIntoView().should('be.visible');
            householdProfilePage.getManageDuplicatesButton().should('not.exist');
            householdProfilePage.getDuplicatesCount().should('eq', '0 potential duplicate(s)');
          } else {
          householdProfilePage.getManageDuplicatesButton().should('be.visible');
          householdProfilePage.getDuplicatesCount().should('eq', '0 potential duplicate(s)');
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
        it('should not be able to register new household', () => {
          cy.contains('You do not have permission to access this page').should('be.visible');
        });
      });
    }
  });
});
