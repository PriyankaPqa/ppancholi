import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { fixtureGenerateHomeAddressDataCorrectionXlsxFile } from '../../../fixtures/mass-action-data-correction';
import { createEventAndTeam, getHouseholdsSummary, prepareStateMultipleHouseholds } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { preprocessDataCorrectionFileCanSteps } from './canSteps';

const canRoles = [
  UserRoles.level6,
];

const cannotRoles = [
  UserRoles.level5,
  UserRoles.level4,
  UserRoles.level3,
  UserRoles.level2,
  UserRoles.level1,
  UserRoles.level0,
  UserRoles.contributor1,
  UserRoles.contributor2,
  UserRoles.contributor3,
  UserRoles.readonly,
];

const { filteredCanRoles, filteredCannotRoles, allRoles } = getRoles(canRoles, cannotRoles);

let accessTokenL6 = '';
const householdQuantity = 3;
const fileName = 'homeAddressDataCorrectionMassAction';
const filePath = `cypress/downloads/${fileName}.xlsx`;
const dataCorrectionTypeDataTest = 'Home Address';
const dataCorrectionTypeDropDown = 'Home Address';

describe('#TC1710# - Pre-process a Home Address data correction file', { tags: ['@household', '@mass-actions'] }, () => {
  describe('Can Roles', () => {
    for (const roleName of filteredCanRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.getToken().then(async (tokenResponse) => {
            accessTokenL6 = tokenResponse.access_token;
            const resultPrepareStateEvent = await createEventAndTeam(accessTokenL6, allRoles);
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
            cy.login(roleName);
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
            [this.householdsSummary[0].id]: this.householdsSummary[0].etag.replace(/"/g, ''),
            [this.householdsSummary[1].id]: this.householdsSummary[1].etag.replace(/"/g, ''),
            [this.householdsSummary[2].id]: this.householdsSummary[2].etag.replace(/"/g, ''),
          };
          fixtureGenerateHomeAddressDataCorrectionXlsxFile(householdIds, 'MassActionTable', fileName);

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
    for (const roleName of filteredCannotRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.login(roleName);
          cy.goTo('mass-actions/data-correction/create');
        });
        it('should not be able to pre-process a Home Address data correction file', () => {
          cy.contains('You do not have permission to access this page').should('be.visible');
        });
      });
    }
  });
});
