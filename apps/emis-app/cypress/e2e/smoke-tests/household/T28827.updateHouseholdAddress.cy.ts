import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { IEventEntity } from '@libs/entities-lib/event';
import { getUserName, getUserRoleDescription } from '@libs/cypress-lib/helpers/users';
import { ECanadaProvinces } from '@libs/shared-lib/types';
import { ICreateHouseholdRequest } from '@libs/entities-lib/household-create';
import { ICaseFileEntity } from '@libs/entities-lib/case-file';
import { getToday } from '@libs/cypress-lib/helpers';
import { fixtureAddress } from '../../../fixtures/household';
import { createEventAndTeam, prepareStateHousehold } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { HouseholdProfilePage } from '../../../pages/casefiles/householdProfile.page';
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

let event = null as IEventEntity;
let accessTokenL6 = '';
let caseFileCreated = null as ICaseFileEntity;
let household = null as ICreateHouseholdRequest;

describe('[T28827] Update Household Address', { tags: ['@household'] }, () => {
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

  describe('Can Roles', () => {
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
        it('should successfully update household address', function () {
          const addressData = fixtureAddress();

          const householdProfilePage = new HouseholdProfilePage();

          const editHouseholdAddressPage = householdProfilePage.editAddress();
          editHouseholdAddressPage.getNoFixedHomeAddressCheckbox().should('not.be.checked').and('not.have.attr', 'checked');
          editHouseholdAddressPage.fillUpdatedAddressData(addressData, roleName); // roleName added in unitNumber to prevent creating potential duplicates.
          editHouseholdAddressPage.saveUpdatedAddress();

          cy.contains('The household address has been successfully updated').should('be.visible');
          cy.contains(`${addressData.unitNumber} ${roleName}-${addressData.streetAddress}`).should('be.visible');
          cy.contains(`${addressData.municipality}, ${addressData.province}, ${addressData.postalCode}`).should('be.visible');

          const profileHistoryPage = householdProfilePage.goToProfileHistoryPage();
          profileHistoryPage.refreshUntilHouseholdProfileReady(caseFileCreated.householdId.toString());
          profileHistoryPage.getHouseholdHistoryEditedBy().should('eq', `${getUserName(roleName)}${getUserRoleDescription(roleName)}`);
          profileHistoryPage.getHouseholdHistoryChangeDate().should('eq', getToday());
          profileHistoryPage.getHouseholdHistoryLastAction().should('eq', 'Address information changed');

          profileHistoryPage.getHouseholdHistoryPreviousValue()
            .should('string', `${this.household.homeAddress.unitSuite}-${this.household.homeAddress.streetAddress}`)
            .should('string', `${this.household.homeAddress.city}, ${ECanadaProvinces[Number(this.household.homeAddress.province.toString())]}, `
             + `${this.household.homeAddress.postalCode}`);
          profileHistoryPage.getHouseholdHistoryNewValue().should('string', `${addressData.unitNumber} ${roleName}-${addressData.streetAddress}`);
          profileHistoryPage.getHouseholdHistoryNewValue().should('string', `${addressData.municipality}, ${addressData.province}, `
          + `${addressData.postalCode}, Canada`);

          profileHistoryPage.goToHouseholdProfilePage();

          const caseFileDetailsPage = householdProfilePage.goToCaseFileDetailsPage();
          caseFileDetailsPage.waitAndRefreshUntilCaseFileActivityVisibleWithBody('Address information changed');
          caseFileDetailsPage.getUserName().should('eq', getUserName(roleName));
          caseFileDetailsPage.getRoleName().should('eq', `(${getUserRoleDescription(roleName)})`);
          caseFileDetailsPage.getCaseFileActivityTitles().should('string', 'Modified household information');
          caseFileDetailsPage.getCaseFileActivityBodies().should('string', 'Address information changed');
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
        it('should not be able to update household address', () => {
          const caseFileHomePage = new CaseFilesHomePage();

          const householdProfilePage = caseFileHomePage.getFirstAvailableHousehold(); // re-use already created household for canRoles.
          householdProfilePage.getHouseholdSize().should('be.visible');
          householdProfilePage.getEditAddressButton().should('not.exist');
        });
      });
    }
  });
});
