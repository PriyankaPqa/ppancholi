  /* eslint-disable max-nested-callbacks */
import { UserRoles } from '@libs/cypress-lib/support/msal';
import { IEventEntity } from '@libs/entities-lib/event';
import { mockCreateHouseholdRequest } from '@libs/cypress-lib/mocks/household/household';
import { getUserName, getUserRoleDescription } from '@libs/cypress-lib/helpers/users';
import { ECanadaProvinces } from '@libs/shared-lib/types';
import { format } from 'date-fns';
import { fixtureAddress } from '../../../fixtures/household';
import { createEventWithTeamWithUsers } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { useProvider } from '../../../provider/provider';
import { HouseholdProfilePage } from '../../../pages/casefiles/householdProfile.page';
import { CaseFilesHomePage } from '../../../pages/casefiles/caseFilesHome.page';

const canRoles = {
  Level6: UserRoles.level6,
  Level5: UserRoles.level5,
  Level4: UserRoles.level4,
  Level3: UserRoles.level3,
  Level2: UserRoles.level2,
  Level1: UserRoles.level1,
  Level0: UserRoles.level0,
};

const cannotRoles = {
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
  cy.wrap(caseFileCreated.caseFile.householdId).as('householdId');
};

const prepareEventTeam = async (accessToken: string) => {
  const provider = useProvider(accessToken);
  const result = await createEventWithTeamWithUsers(provider, allRolesValues);
  event = result.event;
  cy.wrap(result.team).as('teamCreated');
  cy.wrap(provider).as('provider');
};

const title = '#TC1049# - Update Household Address';
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
  describe('Can Roles', () => {
    for (const [roleName, roleValue] of Object.entries(canRoles)) {
      describe(`${roleName}`, () => {
        beforeEach(async () => {
          await prepareState(accessTokenL6, event);
          cy.login(roleValue);
          cy.get('@householdId').then((householdId) => {
            cy.goTo(`casefile/household/${householdId}`);
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
          cy.get('@householdId').then((householdId) => {
            profileHistoryPage.refreshUntilHouseholdProfileReady(householdId.toString());
          });
          profileHistoryPage.getHouseholdHistoryEditedBy().should('eq', `${getUserName(roleName)}${getUserRoleDescription(roleName)}`);
          profileHistoryPage.getHouseholdHistoryChangeDate().should('eq', format(Date.now(), 'yyyy-MM-dd'));
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
          caseFileDetailsPage.getUserName().should('eq', getUserName(roleName));
          caseFileDetailsPage.getRoleName().should('eq', `(${getUserRoleDescription(roleName)})`);
          caseFileDetailsPage.getCaseFileActivityLogDate().should('eq', format(Date.now(), 'yyyy-MM-dd'));
          caseFileDetailsPage.getCaseFileActivityTitles().should('string', 'Modified household information');
          caseFileDetailsPage.getCaseFileActivityBodies().should('string', 'Address information changed');
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
