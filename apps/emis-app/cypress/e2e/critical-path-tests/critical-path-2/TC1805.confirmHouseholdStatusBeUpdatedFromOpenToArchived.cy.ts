import { UserRoles } from '@libs/cypress-lib/support/msal';
import { HouseholdStatus } from '@libs/entities-lib/household';
import { CaseFileStatus } from '@libs/entities-lib/case-file';
import { createEventAndTeam, prepareStateHousehold, setCasefileStatus, setHouseholdStatus } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { HouseholdProfilePage } from '../../../pages/casefiles/householdProfile.page';
import { updateHouseholdStatusCanSteps } from './canSteps';

const canRoles = {
  Level6: UserRoles.level6,
  Level5: UserRoles.level5,
  Level4: UserRoles.level4,
  Level3: UserRoles.level3,
  Level2: UserRoles.level2,
};

const cannotRoles = {
  Level1: UserRoles.level1,
  Level0: UserRoles.level0,
  Contributor1: UserRoles.contributor1,
  Contributor2: UserRoles.contributor2,
  Contributor3: UserRoles.contributor3,
  ReadOnly: UserRoles.readonly,
};

const allRolesValues = [...Object.values(canRoles), ...Object.values(cannotRoles)];

let accessTokenL6 = '';
const rationale = 'This is my reasoning for updating the status to Archived';

describe('#TC1805# - Confirm that Household Status can be updated from Open to Archived (L2+)', { tags: ['@household'] }, () => {
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
            await setHouseholdStatus(result.provider, result.registrationResponse.household.id, HouseholdStatus.Open);
            cy.wrap(result.registrationResponse.caseFile.id).as('casefileId');
            cy.wrap(result.registrationResponse.household.id).as('householdId');
            cy.login(roleValue);
            cy.goTo(`casefile/household/${result.registrationResponse.household.id}`);
          });
        });
        it('should successfully update Household Status from Open to Archived', function () {
          const householdProfilePage = new HouseholdProfilePage();
          householdProfilePage.getHouseholdStatus().should('eq', 'Open');
          householdProfilePage.selectStatusToArchived();

          updateHouseholdStatusCanSteps({
            actionUpdateHousehold: 'Archive',
            updatedStatus: 'Archived',
            userActionInformation: 'Archived',
            rationale,
            roleName,
            statusEnum: HouseholdStatus.Archived,
            casefileId: this.casefileId,
            casefileActivityBody: 'Open to Archived',
          });
        });
      });
    }
  });
  describe('Cannot Roles', () => {
    before(() => {
      cy.then(async function () {
        const result = await prepareStateHousehold(accessTokenL6, this.eventCreated);
        await setCasefileStatus(result.provider, result.registrationResponse.caseFile.id, CaseFileStatus.Closed);
        await setHouseholdStatus(result.provider, result.registrationResponse.household.id, HouseholdStatus.Open);
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
        it('should not be able to update Household Status from Open to Archived', () => {
          const householdProfilePage = new HouseholdProfilePage();
          householdProfilePage.getHouseholdStatus().should('eq', 'Open');
          householdProfilePage.getHouseholdStatusChevronDownIcon().should('not.exist');
        });
      });
    }
  });
});
