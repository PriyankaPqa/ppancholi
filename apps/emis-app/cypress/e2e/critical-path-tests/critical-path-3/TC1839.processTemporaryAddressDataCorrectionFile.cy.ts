import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { ECurrentAddressTypes } from '@libs/entities-lib/household-create';
import { MassActionDataCorrectionType } from '@libs/entities-lib/mass-action';
import { fixtureGenerateTemporaryAddressDataCorrectionCsvFile } from '../../../fixtures/mass-action-data-correction';
import {
  MassActionDataCorrectionFileParams,
  createEventAndTeam,
  getPersonsInfo,
  prepareStateMassActionDataCorrectionFile,
  prepareStateMultipleHouseholds,
  updatePersonsCurrentAddress,
} from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { processDataCorrectionFileSteps } from './canSteps';

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
const filePath = 'cypress/downloads/temporaryAddressDataCorrectionMassAction.csv';

describe('#TC1839# - Process a Temporary Address data correction file', { tags: ['@household', '@mass-actions'] }, () => {
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
            const memberHouseholds: Record<string, string> = {
              [resultPersonsInfo[0].id]: resultPersonsInfo[0].etag,
              [resultPersonsInfo[1].id]: resultPersonsInfo[1].etag,
              [resultPersonsInfo[2].id]: resultPersonsInfo[2].etag,
            };

            const resultGenerateCsvFile = fixtureGenerateTemporaryAddressDataCorrectionCsvFile(memberHouseholds, filePath);
            const massActionDataCorrectionFileParamData: MassActionDataCorrectionFileParams = {
              provider: resultCreatedMultipleHousehold.provider,
              dataCorrectionType: MassActionDataCorrectionType.TemporaryAddress,
              generatedCsvFile: resultGenerateCsvFile,
              correctionType: 'Temporary Address',
            };
            const resultMassFinancialAssistance = await prepareStateMassActionDataCorrectionFile(massActionDataCorrectionFileParamData);
            cy.wrap(resultPrepareStateEvent.provider).as('provider');
            cy.wrap(resultPrepareStateEvent.event).as('event');
            cy.wrap(resultPrepareStateEvent.team).as('teamCreated');
            cy.login(roleName);
            cy.goTo(`mass-actions/data-correction/details/${resultMassFinancialAssistance.id}`);
          });
        });

        afterEach(function () {
          if (this.teamCreated?.id && this.provider) {
            removeTeamMembersFromTeam(this.teamCreated.id, this.provider);
          }
        });

        it('should successfully process a Temporary Address data correction file', () => {
          processDataCorrectionFileSteps(householdQuantity, 'household records');
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

        it('should not be able to process a Temporary Address data correction file', () => {
          cy.contains('You do not have permission to access this page').should('be.visible');
        });
      });
    }
  });
});
