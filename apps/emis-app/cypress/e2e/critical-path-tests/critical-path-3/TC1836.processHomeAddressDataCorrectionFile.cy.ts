import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { MassActionDataCorrectionType } from '@libs/entities-lib/mass-action';
import { fixtureGenerateHomeAddressDataCorrectionCsvFile } from '../../../fixtures/mass-action-data-correction';
import {
  MassActionDataCorrectionFileParams,
  createEventAndTeam,
  getHouseholdsSummary,
  prepareStateMassActionDataCorrectionFile,
  prepareStateMultipleHouseholds,
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
const filePath = 'cypress/downloads/homeAddressDataCorrectionMassAction.csv';

describe('#TC1836# - Process a Home Address data correction file', { tags: ['@household', '@mass-actions'] }, () => {
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
            const households: Record<string, string> = {
              [resultHouseholdSummary[0].id]: resultHouseholdSummary[0].etag,
              [resultHouseholdSummary[1].id]: resultHouseholdSummary[1].etag,
              [resultHouseholdSummary[2].id]: resultHouseholdSummary[2].etag,
            };
            const resultGeneratedCsvFile = fixtureGenerateHomeAddressDataCorrectionCsvFile(households, filePath);
            const massActionDataCorrectionFileParamData: MassActionDataCorrectionFileParams = {
              provider: resultMultipleHousehold.provider,
              dataCorrectionType: MassActionDataCorrectionType.HomeAddress,
              generatedCsvFile: resultGeneratedCsvFile,
              correctionType: 'Home Address',
            };
            const resultMassFinancialAssistance = await prepareStateMassActionDataCorrectionFile(massActionDataCorrectionFileParamData);
            cy.wrap(resultPrepareStateEvent.provider).as('provider');
            cy.wrap(resultPrepareStateEvent.event).as('event');
            cy.wrap(resultPrepareStateEvent.team).as('teamCreated');
            cy.wrap(resultHouseholdSummary).as('householdsSummary');
            cy.login(roleName);
            cy.goTo(`mass-actions/data-correction/details/${resultMassFinancialAssistance.id}`);
          });
        });
        afterEach(function () {
          if (this.teamCreated?.id && this.provider) {
            removeTeamMembersFromTeam(this.teamCreated.id, this.provider);
          }
        });
        it('should successfully process a Home Address data correction file', () => {
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
        it('should not be able to process a Home Address data correction file', () => {
          cy.contains('You do not have permission to access this page').should('be.visible');
        });
      });
    }
  });
});
