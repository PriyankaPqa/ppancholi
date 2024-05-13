import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { ECurrentAddressTypes } from '@libs/entities-lib/household-create';
import { fixtureGenerateTemporaryAddressDataCorrectionXlsxFile } from '../../../fixtures/mass-action-data-correction';
import { createEventAndTeam, getPersonsInfo, prepareStateMultipleHouseholds, updatePersonsCurrentAddress } from '../../helpers/prepareState';
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
const fileName = 'temporaryAddressDataCorrectionMassAction';
const filePath = `cypress/downloads/${fileName}.xlsx`;
const dataCorrectionTypeDataTest = 'Temporary Address';
const dataCorrectionTypeDropDown = 'Temporary Address';

describe('[T28881] Pre-process a Temporary Address data correction file', { tags: ['@household', '@mass-actions'] }, () => {
  describe('Can Roles', () => {
    for (const roleName of filteredCanRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.getToken().then(async (tokenResponse) => {
            accessTokenL6 = tokenResponse.access_token;
            const resultPrepareStateEvent = await createEventAndTeam(accessTokenL6, allRoles);
            // eslint-disable-next-line
            const resultCreatedMultipleHousehold = await prepareStateMultipleHouseholds(accessTokenL6, resultPrepareStateEvent.event, householdQuantity);
            const personIds: string[] = [
              resultCreatedMultipleHousehold.householdsCreated[0].registrationResponse.household.members[0],
              resultCreatedMultipleHousehold.householdsCreated[1].registrationResponse.household.members[0],
              resultCreatedMultipleHousehold.householdsCreated[2].registrationResponse.household.members[0],
            ];
            updatePersonsCurrentAddress(resultCreatedMultipleHousehold.provider, personIds, ECurrentAddressTypes.FriendsFamily);
            const resultPersonsInfo = await getPersonsInfo(resultCreatedMultipleHousehold.provider, personIds);
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

        it('should successfully pre-process a Temporary Address data correction file', function () {
          const memberHouseholds: Record<string, string> = {
            [this.householdMembers[0].id]: this.householdMembers[0].etag.replace(/"/g, ''),
            [this.householdMembers[1].id]: this.householdMembers[1].etag.replace(/"/g, ''),
            [this.householdMembers[2].id]: this.householdMembers[2].etag.replace(/"/g, ''),
          };

          fixtureGenerateTemporaryAddressDataCorrectionXlsxFile(memberHouseholds, 'MassActionTable', fileName);

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

        it('should not be able to pre-process a Temporary Address data correction file', () => {
          cy.contains('You do not have permission to access this page').should('be.visible');
        });
      });
    }
  });
});
