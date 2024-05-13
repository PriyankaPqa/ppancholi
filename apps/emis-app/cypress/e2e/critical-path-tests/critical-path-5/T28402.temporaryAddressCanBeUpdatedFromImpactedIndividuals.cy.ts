import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { ECurrentAddressTypes, ICurrentAddress } from '@libs/entities-lib/value-objects/current-address';
import { format } from 'date-fns';
import { faker } from '@faker-js/faker';
import { getToday, returnDateInFormat } from '@libs/cypress-lib/helpers';
import { ECanadaProvinces } from '@libs/shared-lib/types';
import { ECanadaProvincesName } from '@libs/shared-lib/types/enums/ECanadaProvinces';
import { getUserName, getUserRoleDescription } from '@libs/cypress-lib/helpers/users';
import { ICaseFileEntity } from '@libs/entities-lib/case-file';
import { CaseFileImpactedIndividualsHomePage } from '../../../pages/casefiles/case-file-impacted-individuals/caseFileImpactedIndividualsHome.page';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { createEventAndTeam, prepareStateHousehold, updatePersonsCurrentAddress } from '../../helpers/prepareState';
import { fixtureTemporaryAddress } from '../../../fixtures/case-management';
import { HouseholdProfilePage } from '../../../pages/casefiles/householdProfile.page';
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
let fullName = '';
let currentAddress = {} as ICurrentAddress;
let caseFileCreated = null as ICaseFileEntity;
const temporaryAddressData = fixtureTemporaryAddress({ checkIn: null, checkOut: null });

describe('[T28402] Temporary address can be updated from impacted individuals', { tags: ['@impacted-individuals'] }, () => {
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
            caseFileCreated = resultHousehold.registrationResponse.caseFile;
            currentAddress = await updatePersonsCurrentAddress(
              this.provider,
              [resultHousehold.registrationResponse.household.primaryBeneficiary],
              ECurrentAddressTypes.FriendsFamily,
              { checkIn: format(Date.now(), 'PP'), checkOut: format(faker.date.future(), 'PP') },
              );
            const { mockCreateHousehold } = resultHousehold;
            fullName = `${mockCreateHousehold.primaryBeneficiary.identitySet.firstName} ${mockCreateHousehold.primaryBeneficiary.identitySet.lastName}`;
            cy.login(roleName);
            cy.goTo(`casefile/${resultHousehold.registrationResponse.caseFile.id}/impactedIndividuals`);
          });
        });

        it('can update temporary address from impacted individuals', () => {
          const caseFileImpactedIndividualsHomePage = new CaseFileImpactedIndividualsHomePage();
          caseFileImpactedIndividualsHomePage.getPrimaryMemberCard().within(() => {
            caseFileImpactedIndividualsHomePage.getPrimaryMemberLabel().should('be.visible');
            caseFileImpactedIndividualsHomePage.getCurrentAddressType().should('eq', 'Friends / Family');
            caseFileImpactedIndividualsHomePage.getCheckIn().should('eq', returnDateInFormat(currentAddress.checkIn as string, 'PP'));
            caseFileImpactedIndividualsHomePage.getCheckOut().should('eq', returnDateInFormat(currentAddress.checkOut as string, 'PP'));
            caseFileImpactedIndividualsHomePage.getCurrentAddressStreet().should('eq', `${currentAddress.address.streetAddress}  #${currentAddress.address.unitSuite}`.trim());
            caseFileImpactedIndividualsHomePage.getCurrentAddressLine().should(
              'eq',
              `${currentAddress.address.city}, ${ECanadaProvinces[currentAddress.address.province]}, ${currentAddress.address.postalCode}`,
            );
            caseFileImpactedIndividualsHomePage.getCurrentAddressCountry().should('eq', currentAddress.address.country);
            caseFileImpactedIndividualsHomePage.getIsCrcProvided().should('eq', 'No');
            caseFileImpactedIndividualsHomePage.getEditCurrentTemporaryAddressButton().should('be.enabled');
            caseFileImpactedIndividualsHomePage.getReceivingAssistanceToggle().should('be.checked');
            caseFileImpactedIndividualsHomePage.getPreviousTemporaryAddressExpandButton().should('be.visible');
          });
          const caseFileImpactedIndividualsEditAddressPage = caseFileImpactedIndividualsHomePage.goToEditCurrentTemporaryAddressPage();
          caseFileImpactedIndividualsEditAddressPage.getEditAddressDialogTitle().should('contain', fullName);
          caseFileImpactedIndividualsEditAddressPage.getTempAddress().should('string', 'Friends / Family'.trim());
          caseFileImpactedIndividualsEditAddressPage.getCheckInInput().invoke('val').should('eq', returnDateInFormat(currentAddress.checkIn as string, 'PP'));
          caseFileImpactedIndividualsEditAddressPage.getCheckOutInput().invoke('val').should('eq', returnDateInFormat(currentAddress.checkOut as string, 'PP'));
          caseFileImpactedIndividualsEditAddressPage.getStreetAddress().invoke('val').should('eq', currentAddress.address.streetAddress);
          caseFileImpactedIndividualsEditAddressPage.getUnitSuite().invoke('val').should('eq', currentAddress.address.unitSuite);
          caseFileImpactedIndividualsEditAddressPage.getMunicipality().invoke('val').should('eq', currentAddress.address.city);
          caseFileImpactedIndividualsEditAddressPage.getPostalCode().invoke('val').should('eq', currentAddress.address.postalCode);
          caseFileImpactedIndividualsEditAddressPage.getProvince().should(
            'string',
            ECanadaProvincesName[currentAddress.address.province],
            );
          caseFileImpactedIndividualsEditAddressPage.getCountry().should('string', 'Canada');
          caseFileImpactedIndividualsEditAddressPage.getTempAddressAutoComplete().should('be.visible');
          caseFileImpactedIndividualsEditAddressPage.fill(temporaryAddressData);
          caseFileImpactedIndividualsEditAddressPage.getSaveButton().click();

          caseFileImpactedIndividualsHomePage.refreshUntilImpactedIndividualsCardUpdated(temporaryAddressData.address.streetAddress);
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
          });
          caseFileImpactedIndividualsHomePage.goToCaseFileActivityPage();
          const caseFileActivityHomePage = new CaseFileDetailsPage(); // avoiding dependency cycle error
          caseFileActivityHomePage.goToHouseholdProfilePage();
          const householdProfilePage = new HouseholdProfilePage(); // avoiding dependency cycle error
          const profileHistoryPage = householdProfilePage.goToProfileHistoryPage();
          profileHistoryPage.refreshUntilHouseholdProfileReady(caseFileCreated.householdId.toString());
          profileHistoryPage.getHouseholdHistoryEditedBy().should('eq', `${getUserName(roleName)}${getUserRoleDescription(roleName)}`);
          profileHistoryPage.getHouseholdHistoryChangeDate().should('eq', getToday());
          profileHistoryPage.getHouseholdHistoryLastAction().should('eq', 'Temporary address changed');

          profileHistoryPage.getHouseholdHistoryPreviousValue()
            .should('string', `${currentAddress.address.unitSuite}-${currentAddress.address.streetAddress}`)
            .should('string', `${currentAddress.address.city}, ${ECanadaProvinces[Number(currentAddress.address.province.toString())]}, `
              + `${currentAddress.address.postalCode}`);
          profileHistoryPage.getHouseholdHistoryNewValue().should('string', `${temporaryAddressData.address.unitSuite}-${temporaryAddressData.address.streetAddress}`);
          profileHistoryPage.getHouseholdHistoryNewValue().should('string', `${temporaryAddressData.address.city}, ${temporaryAddressData.address.province}, `
            + `${temporaryAddressData.address.postalCode}, Canada`);

          profileHistoryPage.goToHouseholdProfilePage();
          const caseFileDetailsPage = householdProfilePage.goToCaseFileDetailsPage();
          caseFileDetailsPage.waitAndRefreshUntilCaseFileActivityVisibleWithBody('Temporary address updated');
          caseFileDetailsPage.getUserName().should('eq', getUserName(roleName));
          caseFileDetailsPage.getRoleName().should('eq', `(${getUserRoleDescription(roleName)})`);
          caseFileDetailsPage.getCaseFileActivityTitles().should('string', 'Impacted individuals edited');
          caseFileDetailsPage.getCaseFileActivityBodies().should('string', `${fullName} - Temporary address updated`);
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
