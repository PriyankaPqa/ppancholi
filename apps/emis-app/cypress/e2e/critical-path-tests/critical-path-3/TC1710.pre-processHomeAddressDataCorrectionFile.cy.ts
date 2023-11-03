import { UserRoles } from '@libs/cypress-lib/support/msal';
import { fixtureGenerateHomeAddressDataCorrectionCsvFile } from '../../../fixtures/mass-action-data-correction';
import { createEventAndTeam, getHouseholdsSummary, prepareStateMultipleHouseholds } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { preprocessDataCorrectionFileCanSteps } from './canSteps';

const canRoles = {
  Level6: UserRoles.level6,
};

const cannotRoles = {
  Level5: UserRoles.level5,
  Level4: UserRoles.level4,
  Level3: UserRoles.level3,
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
const householdQuantity = 3;
const filePath = 'cypress/downloads/homeAddressDataCorrectionMassAction.csv';
const dataCorrectionTypeDataTest = 'Home Address';
const dataCorrectionTypeDropDown = 'Home Address';

describe('#TC1710# - Pre-process a Home Address data correction file', { tags: ['@household', '@mass-actions'] }, () => {
  describe('Can Roles', () => {
    for (const [roleName, roleValue] of Object.entries(canRoles)) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.getToken().then(async (tokenResponse) => {
            accessTokenL6 = tokenResponse.access_token;
            const resultPrepareStateEvent = await createEventAndTeam(accessTokenL6, allRolesValues);
            // eslint-disable-next-line
            const resultMultipleHousehold = await prepareStateMultipleHouseholds(accessTokenL6, resultPrepareStateEvent.event, householdQuantity);
            const householdIds: string[] = [
              resultMultipleHousehold.householdsCreated[0].registrationResponse.household.id,
              resultMultipleHousehold.householdsCreated[1].registrationResponse.household.id,
              resultMultipleHousehold.householdsCreated[2].registrationResponse.household.id,
            ];
            const resultHouseholdSummary = await getHouseholdsSummary(resultMultipleHousehold.provider, householdIds);
            cy.wrap(resultPrepareStateEvent.provider).as('provider');
            cy.wrap(resultPrepareStateEvent.event).as('event');
            cy.wrap(resultPrepareStateEvent.team).as('teamCreated');
            cy.wrap(resultHouseholdSummary).as('householdsSummary');
            cy.login(roleValue);
            cy.goTo('mass-actions/data-correction/create');
          });
        });
        afterEach(function () {
          if (this.teamCreated?.id && this.provider) {
            removeTeamMembersFromTeam(this.teamCreated.id, this.provider);
          }
        });
        it('should successfully pre-process a Home Address data correction file', function () {
          const householdIds: Record<string, string> = {
            [this.householdsSummary[0].id]: this.householdsSummary[0].etag,
            [this.householdsSummary[1].id]: this.householdsSummary[1].etag,
            [this.householdsSummary[2].id]: this.householdsSummary[2].etag,
          };
          fixtureGenerateHomeAddressDataCorrectionCsvFile(householdIds, filePath);

          preprocessDataCorrectionFileCanSteps({
            retries: this.test.retries.length,
            dataCorrectionTypeDataTest,
            dataCorrectionTypeDropDown,
            filePath,
            preprocessedItems: 'household records',
            roleName,
            householdQuantity,
          });
        });
      });
    }
  });
  describe('Cannot Roles', () => {
    for (const [roleName, roleValue] of Object.entries(cannotRoles)) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.login(roleValue);
          cy.goTo('mass-actions/data-correction/create');
        });
        it('should not be able to pre-process a Home Address data correction file', () => {
          cy.contains('You do not have permission to access this page').should('be.visible');
        });
      });
    }
  });
});
