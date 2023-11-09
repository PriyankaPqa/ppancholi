import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { fixtureGenerateIdentitySetDataCorrectionCsvFile } from '../../../fixtures/mass-action-data-correction';
import { createEventAndTeam, getPersonsInfo, prepareStateMultipleHouseholds } from '../../helpers/prepareState';
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
const filePath = 'cypress/downloads/identitySetDataCorrectionMassAction.csv';
const dataCorrectionTypeDataTest = 'Identity Set';
const dataCorrectionTypeDropDown = 'Identity Set';

describe('#TC1711# - Pre-process a Identity Set data correction file', { tags: ['@household', '@mass-actions'] }, () => {
  describe('Can Roles', () => {
    for (const roleName of filteredCanRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.getToken().then(async (tokenResponse) => {
            accessTokenL6 = tokenResponse.access_token;
            const resultPrepareStateEvent = await createEventAndTeam(accessTokenL6, allRoles);
            // eslint-disable-next-line
            const resultCreatedMultipleHousehold = await prepareStateMultipleHouseholds(accessTokenL6, resultPrepareStateEvent.event, householdQuantity);
            const householdMemberIds: string[] = [
              resultCreatedMultipleHousehold.householdsCreated[0].registrationResponse.household.members[0],
              resultCreatedMultipleHousehold.householdsCreated[1].registrationResponse.household.members[0],
              resultCreatedMultipleHousehold.householdsCreated[2].registrationResponse.household.members[0],
            ];
            const resultPersonsInfo = await getPersonsInfo(resultCreatedMultipleHousehold.provider, householdMemberIds);
            cy.wrap(resultPrepareStateEvent.provider).as('provider');
            cy.wrap(resultPrepareStateEvent.event).as('event');
            cy.wrap(resultPrepareStateEvent.team).as('teamCreated');
            cy.wrap(resultPersonsInfo).as('householdMembers');
            cy.login(roleName);
            cy.goTo('mass-actions/data-correction/create');
          });
        });
        afterEach(function () {
          if (this.teamCreated?.id && this.provider) {
            removeTeamMembersFromTeam(this.teamCreated.id, this.provider);
          }
        });
        it('should successfully pre-process a Identity Set data correction file', function () {
          const memberHouseholds: Record<string, string> = {
            [this.householdMembers[0].id]: this.householdMembers[0].etag,
            [this.householdMembers[1].id]: this.householdMembers[1].etag,
            [this.householdMembers[2].id]: this.householdMembers[2].etag,
          };
          fixtureGenerateIdentitySetDataCorrectionCsvFile(memberHouseholds, filePath);

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
        it('should not be able to pre-process a Identity Set data correction file', () => {
          cy.contains('You do not have permission to access this page').should('be.visible');
        });
      });
    }
  });
});
