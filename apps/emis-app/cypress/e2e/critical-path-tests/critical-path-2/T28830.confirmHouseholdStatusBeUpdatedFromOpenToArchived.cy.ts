import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { HouseholdStatus } from '@libs/entities-lib/household';
import { CaseFileStatus } from '@libs/entities-lib/case-file';
import { createEventAndTeam, prepareStateHousehold, setCasefileStatus, setHouseholdStatus } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { HouseholdProfilePage } from '../../../pages/casefiles/householdProfile.page';
import { UpdateHouseholdStatusCanStepsParams, updateHouseholdStatusCanSteps } from './canSteps';

const canRoles = [
  UserRoles.level6,
  UserRoles.level5,
  UserRoles.level4,
  UserRoles.level3,
  UserRoles.level2,
];

const cannotRoles = [
  UserRoles.level1,
  UserRoles.level0,
  UserRoles.contributor1,
  UserRoles.contributor2,
  UserRoles.contributor3,
  UserRoles.readonly,
];

const { filteredCanRoles, filteredCannotRoles, allRoles } = getRoles(canRoles, cannotRoles);

let accessTokenL6 = '';

describe('[T28830] Confirm that Household Status can be updated from Open to Archived (L2+)', { tags: ['@household'] }, () => {
  before(() => {
    cy.getToken().then(async (tokenResponse) => {
      accessTokenL6 = tokenResponse.access_token;
      const result = await createEventAndTeam(accessTokenL6, allRoles);
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
    for (const roleName of filteredCanRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.then(async function () {
            const result = await prepareStateHousehold(accessTokenL6, this.eventCreated);
            await setCasefileStatus(result.provider, result.registrationResponse.caseFile.id, CaseFileStatus.Closed);
            await setHouseholdStatus(result.provider, result.registrationResponse.household.id, HouseholdStatus.Open);
            cy.wrap(result.registrationResponse.caseFile.id).as('casefileId');
            cy.wrap(result.registrationResponse.household.id).as('householdId');
            cy.login(roleName);
            cy.goTo(`casefile/household/${result.registrationResponse.household.id}`);
          });
        });
        it('should successfully update Household Status from Open to Archived', function () {
          const householdProfilePage = new HouseholdProfilePage();
          householdProfilePage.getHouseholdStatus().should('eq', 'Open');
          householdProfilePage.selectStatusToArchived();

          const canStepsParamData: Partial<UpdateHouseholdStatusCanStepsParams> = {
            actionUpdateHousehold: 'Archive',
            updatedStatus: 'Archived',
            userActionInformation: 'Archived',
            rationale: 'This is my reasoning for updating the status to Archived',
            roleName,
            statusEnum: HouseholdStatus.Archived,
            casefileId: this.casefileId,
            casefileActivityBody: 'Open to Archived',
          };
          updateHouseholdStatusCanSteps(canStepsParamData);
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
     for (const roleName of filteredCannotRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.then(function () {
            cy.login(roleName);
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
