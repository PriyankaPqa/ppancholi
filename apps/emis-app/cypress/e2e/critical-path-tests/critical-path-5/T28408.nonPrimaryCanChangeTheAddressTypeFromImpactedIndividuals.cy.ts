import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { returnDateInFormat } from '@libs/cypress-lib/helpers';
import { getUserName, getUserRoleDescription } from '@libs/cypress-lib/helpers/users';
import { CaseFileImpactedIndividualsHomePage } from '../../../pages/casefiles/case-file-impacted-individuals/caseFileImpactedIndividualsHome.page';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { createEventAndTeam, prepareStateHousehold } from '../../helpers/prepareState';
import { fixtureTemporaryAddress } from '../../../fixtures/case-management';
import { CaseFileDetailsPage } from '../../../pages/casefiles/caseFileDetails.page';

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
let firstSubMemberFullName = '';
const temporaryAddressData = fixtureTemporaryAddress();

describe('[T28408] Non primary can change the address type (Friends/Family) from impacted individuals', { tags: ['@impacted-individuals'] }, () => {
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
            firstSubMemberFullName = `${mockCreateHousehold.additionalMembers[0].identitySet.firstName} ${mockCreateHousehold.additionalMembers[0].identitySet.lastName}`;
            cy.login(roleName);
            cy.goTo(`casefile/${resultHousehold.registrationResponse.caseFile.id}/impactedIndividuals`);
          });
        });

        it('can update non-primary member temporary address from impacted individuals', () => {
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
          const caseFileImpactedIndividualsSubMemberEditAddressPage = caseFileImpactedIndividualsHomePage.goToEditCurrentTemporaryAddressPage(1);
          caseFileImpactedIndividualsSubMemberEditAddressPage.getEditAddressDialogTitle().should('contain', firstSubMemberFullName);
          caseFileImpactedIndividualsSubMemberEditAddressPage.getSameCurrentAddressTitle().should(
            'eq',
            'Is household member located in the same temporary address as the primary? *',
            );
          caseFileImpactedIndividualsSubMemberEditAddressPage.getSameCurrentAddressYes().should('be.checked');
          caseFileImpactedIndividualsSubMemberEditAddressPage.getCancelButton().should('be.enabled');
          caseFileImpactedIndividualsSubMemberEditAddressPage.getSaveButton().should('be.disabled');
          caseFileImpactedIndividualsSubMemberEditAddressPage.getCloseButton().should('be.visible');
          caseFileImpactedIndividualsSubMemberEditAddressPage.getSameCurrentAddressNo().first().check({ force: true });

          caseFileImpactedIndividualsSubMemberEditAddressPage.getTempAddress().should('string', 'Temporary address type');
          caseFileImpactedIndividualsSubMemberEditAddressPage.setTempAddressType('FriendsFamily');
          caseFileImpactedIndividualsSubMemberEditAddressPage.getCheckInInput().should('be.visible');
          caseFileImpactedIndividualsSubMemberEditAddressPage.getCheckOutInput().should('be.visible');
          caseFileImpactedIndividualsSubMemberEditAddressPage.getTempAddressAutoComplete().should('be.visible');
          caseFileImpactedIndividualsSubMemberEditAddressPage.getStreetAddress().should('be.visible');
          caseFileImpactedIndividualsSubMemberEditAddressPage.getUnitSuite().should('be.visible');
          caseFileImpactedIndividualsSubMemberEditAddressPage.getMunicipality().should('be.visible');
          caseFileImpactedIndividualsSubMemberEditAddressPage.getPostalCode().should('be.visible');
          caseFileImpactedIndividualsSubMemberEditAddressPage.getProvince().should('string', 'Province');
          caseFileImpactedIndividualsSubMemberEditAddressPage.getCountry().should('string', 'Canada');

          caseFileImpactedIndividualsSubMemberEditAddressPage.fill(temporaryAddressData);
          caseFileImpactedIndividualsSubMemberEditAddressPage.getSaveButton().click();

          caseFileImpactedIndividualsHomePage.refreshUntilImpactedIndividualsCardUpdated(temporaryAddressData.address.streetAddress);
          caseFileImpactedIndividualsHomePage.getNonPrimaryMemberCard().within(() => {
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
            caseFileImpactedIndividualsHomePage.getPreviousTemporaryAddressExpandButton().should('be.visible');
          });
          caseFileImpactedIndividualsHomePage.goToCaseFileActivityPage();
          const caseFileActivityHomePage = new CaseFileDetailsPage(); // avoiding dependency cycle error
          caseFileActivityHomePage.waitAndRefreshUntilCaseFileActivityVisibleWithBody('Temporary address updated');
          caseFileActivityHomePage.getUserName().should('eq', getUserName(roleName));
          caseFileActivityHomePage.getRoleName().should('eq', `(${getUserRoleDescription(roleName)})`);
          caseFileActivityHomePage.getCaseFileActivityTitles().should('string', 'Impacted individuals edited');
          caseFileActivityHomePage.getCaseFileActivityBodies().should('string', `${firstSubMemberFullName} - Temporary address updated`);
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
            cy.login(roleName);
            cy.goTo(`casefile/${resultHousehold.registrationResponse.caseFile.id}/impactedIndividuals`);
          });
        });
        it('should see the edit address button disabled', () => {
          const caseFileImpactedIndividualsHomePage = new CaseFileImpactedIndividualsHomePage();
          caseFileImpactedIndividualsHomePage.getEditCurrentTemporaryAddressButton().should('be.disabled');
        });
      });
    }
  });
});
