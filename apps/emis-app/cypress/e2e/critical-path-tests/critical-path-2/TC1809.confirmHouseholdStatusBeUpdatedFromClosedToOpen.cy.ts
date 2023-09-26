import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getUserName, getUserRoleDescription } from '@libs/cypress-lib/helpers/users';
import { HouseholdStatus } from '@libs/entities-lib/household';
import { formatCurrentDate } from '@libs/cypress-lib/helpers';
import { CaseFileStatus } from '@libs/entities-lib/case-file';
import { format } from 'date-fns';
import { createEventAndTeam, prepareStateHousehold, setCasefileStatus, setHouseholdStatus } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { HouseholdProfilePage } from '../../../pages/casefiles/householdProfile.page';
import { CaseFileDetailsPage } from '../../../pages/casefiles/caseFileDetails.page';

const canRoles = {
  Level6: UserRoles.level6,
  Level5: UserRoles.level5,
  Level4: UserRoles.level4,
  Level3: UserRoles.level3,
};

const cannotRoles = {
  Level2: UserRoles.level2,
  Level1: UserRoles.level1,
  Level0: UserRoles.level0,
  Contributor1: UserRoles.contributor1,
  Contributor2: UserRoles.contributor2,
  Contributor3: UserRoles.contributor3,
  ReadOnly: UserRoles.readonly,
};

const allRolesValues = [...Object.values(canRoles), ...Object.values(cannotRoles)];

let accessTokenL6 = '';
const rationale = 'This is my reasoning for updating the status to Open';

describe('#TC1809# - Confirm that Household Status can be updated from Closed to Open (L3+)', { tags: ['@household'] }, () => {
  before(() => {
    cy.getToken().then(async (tokenResponse) => {
      accessTokenL6 = tokenResponse.access_token;
      const result = await createEventAndTeam(accessTokenL6, allRolesValues);
      cy.wrap(result.provider).as('provider');
      cy.wrap(result.event).as('eventCreated');
      cy.wrap(result.team).as('teamCreated');
    });
  });
  after(function () {
    if (this.provider && this.teamCreated?.id) {
      removeTeamMembersFromTeam(this.teamCreated.id, this.provider);
    }
  });

  describe('Can Roles', () => {
    for (const [roleName, roleValue] of Object.entries(canRoles)) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.then(async function () {
            const result = await prepareStateHousehold(accessTokenL6, this.eventCreated);
            await setCasefileStatus(result.provider, result.registrationResponse.caseFile.id, CaseFileStatus.Closed);
            await setHouseholdStatus(result.provider, result.registrationResponse.household.id, HouseholdStatus.Closed);
            cy.wrap(result.registrationResponse.caseFile.id).as('casefileId');
            cy.wrap(result.registrationResponse.household.id).as('householdId');
            cy.login(roleValue);
            cy.goTo(`casefile/household/${result.registrationResponse.household.id}`);
          });
        });
        it('should successfully update Household Status from Closed to Open', function () {
          const householdProfilePage = new HouseholdProfilePage();
          householdProfilePage.getHouseholdStatus().should('eq', 'Closed');
          householdProfilePage.selectStatusToOpen();
          householdProfilePage.getDialogTitle().contains('Open household profile').should('be.visible');
          householdProfilePage.getDialogStatus().should('eq', 'Open');
          householdProfilePage.getDialogUserInfo().should('string', `${getUserName(roleName)} (${getUserRoleDescription(roleName)})`);
          householdProfilePage.getDialogRationaleElement().should('have.attr', 'label').and('have.string', 'Rationale *'); // verifies Rationale entry field as mandatory marked with asterisk
          householdProfilePage.getDialogCancelButton().should('be.visible');
          householdProfilePage.getDialogApplyButton().should('be.visible');
          householdProfilePage.enterDialogRationale(rationale);
          householdProfilePage.getDialogApplyButton().click();
          householdProfilePage.refreshUntilHouseholdStatusUpdatedTo(HouseholdStatus.Open);
          householdProfilePage.getHouseholdStatusElement().contains('Open').should('be.visible');
          // eslint-disable-next-line
          householdProfilePage.getUserActionInformationElement().contains(`Household opened by ${getUserName(roleName)} (${getUserRoleDescription(roleName)}) - ${formatCurrentDate()}`).should('be.visible');
          householdProfilePage.getUserRationaleElement().contains(rationale).should('be.visible');

          cy.visit(`en/casefile/${this.casefileId}`);
          const caseFileDetailsPage = new CaseFileDetailsPage();
          caseFileDetailsPage.getUserName().should('eq', getUserName(roleName));
          caseFileDetailsPage.getRoleName().should('eq', `(${getUserRoleDescription(roleName)})`);
          caseFileDetailsPage.getCaseFileActivityLogDate().should('eq', format(Date.now(), 'yyyy-MM-dd'));
          caseFileDetailsPage.getCaseFileActivityTitle(0).should('string', 'Modified household information');
          caseFileDetailsPage.getCaseFileActivityBody(0).should('string', 'Household status changed:').and('string', 'Closed to Open').and('string', rationale);
        });
      });
    }
  });
  describe('Cannot Roles', () => {
    before(() => {
      cy.then(async function () {
        const result = await prepareStateHousehold(accessTokenL6, this.eventCreated);
        await setCasefileStatus(result.provider, result.registrationResponse.caseFile.id, CaseFileStatus.Closed);
        await setHouseholdStatus(result.provider, result.registrationResponse.household.id, HouseholdStatus.Closed);
        cy.wrap(result.registrationResponse.household.id).as('householdId');
      });
    });
    for (const [roleName, roleValue] of Object.entries(cannotRoles)) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.then(function () {
            cy.login(roleValue);
            cy.goTo(`casefile/household/${this.householdId}`);
          });
        });
        it('should not be able to update Household Status from Closed to Open', () => {
          const householdProfilePage = new HouseholdProfilePage();
          householdProfilePage.getHouseholdStatusChevronDownIcon().should('not.exist');
        });
      });
    }
  });
});
