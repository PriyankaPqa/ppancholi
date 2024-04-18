import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { getUserName, getUserRoleDescription } from '@libs/cypress-lib/helpers/users';
import { returnDateInFormat } from '@libs/cypress-lib/helpers';
import { createEventAndTeam, prepareStateHousehold } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { CaseFileImpactedIndividualsHomePage } from '../../../pages/casefiles/case-file-impacted-individuals/caseFileImpactedIndividualsHome.page';
import { fixtureTemporaryAddress } from '../../../fixtures/case-management';
import { CaseFileDetailsPage } from '../../../pages/casefiles/caseFileDetails.page';
import { HouseholdProfilePage } from '../../../pages/casefiles/householdProfile.page';

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
let fullName = '';
const temporaryAddressData = fixtureTemporaryAddress();

describe('#TC1817# - User can change the address type from Impacted Individuals. (Friends/Family)', { tags: ['@case-file'] }, () => {
  before(() => {
    cy.getToken().then(async (tokenResponse) => {
      accessTokenL6 = tokenResponse.access_token;
      const resultCreatedEvent = await createEventAndTeam(accessTokenL6, allRoles);
      cy.wrap(resultCreatedEvent.provider).as('provider');
      cy.wrap(resultCreatedEvent.event).as('event');
      cy.wrap(resultCreatedEvent.team).as('teamCreated');
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
            const resultHousehold = await prepareStateHousehold(accessTokenL6, this.event);
            const { mockCreateHousehold } = resultHousehold;
            fullName = `${mockCreateHousehold.primaryBeneficiary.identitySet.firstName} ${mockCreateHousehold.primaryBeneficiary.identitySet.lastName}`;
            cy.wrap(resultHousehold.registrationResponse.caseFile).as('caseFile');
            cy.wrap(resultHousehold.registrationResponse.caseFile.id).as('caseFileId');
            cy.login(roleName);
            cy.goTo(`casefile/${resultHousehold.registrationResponse.caseFile.id}/impactedIndividuals`);
          });
        });

        it('can change the address type from Impacted Individuals', () => {
          const caseFileImpactedIndividualsHomePage = new CaseFileImpactedIndividualsHomePage();
          caseFileImpactedIndividualsHomePage.getPrimaryMemberCard().within(() => {
            caseFileImpactedIndividualsHomePage.getPrimaryMemberLabel().should('be.visible');
            caseFileImpactedIndividualsHomePage.getCurrentTemporaryAddress().should('eq', 'Remaining in home');
            caseFileImpactedIndividualsHomePage.getCheckIn().should('eq', '-');
            caseFileImpactedIndividualsHomePage.getCheckOut().should('eq', '-');
            caseFileImpactedIndividualsHomePage.getIsCrcProvided().should('eq', 'No');
            caseFileImpactedIndividualsHomePage.getEditCurrentTemporaryAddressButton().should('be.enabled');
            caseFileImpactedIndividualsHomePage.getReceivingAssistanceToggle().should('be.checked');
          });
          const caseFileImpactedIndividualsEditAddressPage = caseFileImpactedIndividualsHomePage.goToEditCurrentTemporaryAddressPage();
          caseFileImpactedIndividualsEditAddressPage.getEditAddressDialogTitle().should('contain', fullName);
          caseFileImpactedIndividualsEditAddressPage.getTempAddress().should('string', 'Remaining in home'.trim());
          caseFileImpactedIndividualsEditAddressPage.getCancelButton().should('be.visible');
          caseFileImpactedIndividualsEditAddressPage.getSaveButton().should('be.visible');
          caseFileImpactedIndividualsEditAddressPage.getCloseButton().should('be.visible');

          caseFileImpactedIndividualsEditAddressPage.setTempAddressType('FriendsFamily');
          caseFileImpactedIndividualsEditAddressPage.getCheckInInput().should('be.visible');
          caseFileImpactedIndividualsEditAddressPage.getCheckOutInput().should('be.visible');
          caseFileImpactedIndividualsEditAddressPage.getTempAddressAutoComplete().should('be.visible');
          caseFileImpactedIndividualsEditAddressPage.getStreetAddress().should('be.visible');
          caseFileImpactedIndividualsEditAddressPage.getUnitSuite().should('be.visible');
          caseFileImpactedIndividualsEditAddressPage.getMunicipality().should('be.visible');
          caseFileImpactedIndividualsEditAddressPage.getPostalCode().should('be.visible');
          caseFileImpactedIndividualsEditAddressPage.getProvince().should('be.visible');
          caseFileImpactedIndividualsEditAddressPage.getCountry().should('be.visible');

          caseFileImpactedIndividualsEditAddressPage.fill(temporaryAddressData);
          caseFileImpactedIndividualsEditAddressPage.getSaveButton().click();

          caseFileImpactedIndividualsHomePage.refreshUntilImpactedIndividualsCardUpdated('Friends / Family');
          caseFileImpactedIndividualsHomePage.getPrimaryMemberCard().within(() => {
            caseFileImpactedIndividualsHomePage.getCurrentAddressType().should('eq', 'Friends / Family');
            caseFileImpactedIndividualsHomePage.getCurrentAddressStreet().should(
              'eq',
              `${temporaryAddressData.address.streetAddress}  #${temporaryAddressData.address.unitSuite}`.trim(),
            );
            caseFileImpactedIndividualsHomePage.getCurrentAddressLine().should(
              'eq',
              `${temporaryAddressData.address.city}, ${temporaryAddressData.address.province}, ${temporaryAddressData.address.postalCode}`,
            );
            caseFileImpactedIndividualsHomePage.getCurrentAddressCountry().should('eq', temporaryAddressData.address.country);
            caseFileImpactedIndividualsHomePage.getCheckIn().should('eq', returnDateInFormat(temporaryAddressData.checkIn, 'PP'));
            caseFileImpactedIndividualsHomePage.getCheckOut().should('eq', returnDateInFormat(temporaryAddressData.checkOut, 'PP'));
            caseFileImpactedIndividualsHomePage.getIsCrcProvided().should('eq', 'No');
          });
          caseFileImpactedIndividualsHomePage.getPreviousTemporaryAddressExpandButton().click();
          caseFileImpactedIndividualsHomePage.getPreviousTemporaryAddressRow().within(() => {
              caseFileImpactedIndividualsHomePage.getCurrentAddressTemplate().should('eq', 'Remaining in home');
            });

          caseFileImpactedIndividualsHomePage.goToCaseFileActivityPage();
          const caseFileActivityHomePage = new CaseFileDetailsPage(); // avoiding dependency cycle error
          caseFileActivityHomePage.waitAndRefreshUntilCaseFileActivityVisibleWithBody('Temporary address updated');
          caseFileActivityHomePage.getUserName().should('eq', getUserName(roleName));
          caseFileActivityHomePage.getRoleName().should('eq', `(${getUserRoleDescription(roleName)})`);
          caseFileActivityHomePage.getCaseFileActivityTitles().should('string', 'Impacted individuals edited');
          caseFileActivityHomePage.getCaseFileActivityBodies().should('string', `${fullName} - Temporary address updated`);

          caseFileActivityHomePage.goToHouseholdProfilePage();
          const householdProfilePage = new HouseholdProfilePage(); // avoiding dependency cycle error
          householdProfilePage.getHouseholdMemberCard().within(() => {
            householdProfilePage.getCurrentAddressType().should('eq', 'Friends / Family');
            householdProfilePage.getCurrentAddressStreet().should('eq', `${temporaryAddressData.address.streetAddress}  #${temporaryAddressData.address.unitSuite}`.trim());
            householdProfilePage.getCurrentAddressLine().should(
              'eq',
              `${temporaryAddressData.address.city}, ${temporaryAddressData.address.province}, ${temporaryAddressData.address.postalCode}`,
            );
            householdProfilePage.getCurrentAddressCountry().should('eq', temporaryAddressData.address.country);
          });
        });
      });
    }
  });

  describe('Cannot Roles', () => {
    for (const roleName of filteredCannotRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.then(async function () {
            const resultHousehold = await prepareStateHousehold(accessTokenL6, this.event);
            const { mockCreateHousehold } = resultHousehold;
            fullName = `${mockCreateHousehold.primaryBeneficiary.identitySet.firstName} ${mockCreateHousehold.primaryBeneficiary.identitySet.lastName}`;
            cy.wrap(resultHousehold.registrationResponse.caseFile).as('caseFile');
            cy.wrap(resultHousehold.registrationResponse.caseFile.id).as('caseFileId');
            cy.login(roleName);
            cy.goTo(`casefile/${resultHousehold.registrationResponse.caseFile.id}/impactedIndividuals`);
          });
        });
        it('should see temporary address edit button disabled', () => {
          const caseFileImpactedIndividualsHomePage = new CaseFileImpactedIndividualsHomePage();
          caseFileImpactedIndividualsHomePage.getEditCurrentTemporaryAddressButton().should('be.disabled');
        });
      });
    }
  });
});
