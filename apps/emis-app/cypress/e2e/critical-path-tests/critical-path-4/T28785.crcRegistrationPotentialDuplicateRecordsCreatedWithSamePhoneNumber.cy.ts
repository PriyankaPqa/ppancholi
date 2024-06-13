import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { createEventAndTeam, prepareStateHousehold } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { fixtureAddressData, fixturePrimaryMember } from '../../../fixtures/registration';
import {
  PotentialDuplicateBasis,
  crcRegisterPotentialDuplicateSteps,
  potentialDuplicateCreatedSteps,
} from './canSteps';

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
describe('[T28785] CRC REG NEW HOUSEHOLD - Potential duplicate records created when user registers individual with same Phone number as existing EMIS member.', { tags: ['@household', '@registration'] }, () => {
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
        it('should flag potential duplicates when crc user registers with same phone number', function () {
          const potentialDuplicateMemberData = fixturePrimaryMember(this.test.retries.length, {
            phoneNumber: this.primaryBeneficiary.contactInformation.homePhoneNumber.number,
          });
          const potentialDuplicateAddressData = fixtureAddressData();

          crcRegisterPotentialDuplicateSteps({
            eventName: this.eventCreated.name.translation.en,
            roleName,
            potentialDuplicateMemberData,
            potentialDuplicateAddressData,
            potentialDuplicateBasis: PotentialDuplicateBasis.PhoneNumber,
          });

          potentialDuplicateCreatedSteps({
            firstName: this.primaryBeneficiary.identitySet.firstName,
            lastName: this.primaryBeneficiary.identitySet.lastName,
            registrationNumber: this.registrationNumber,
            caseFileNumber: this.caseFileNumber,
            eventName: this.eventCreated.name.translation.en,
            phoneNumber: this.primaryBeneficiary.contactInformation.homePhoneNumber.number,
            potentialDuplicateBasis: PotentialDuplicateBasis.PhoneNumber,
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
          cy.goTo('registration');
        });
        it('should not be able to flag potential duplicates when crc user registers with same phone number', () => {
          cy.contains('You do not have permission to access this page').should('be.visible');
        });
      });
    }
  });
});
