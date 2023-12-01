import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { MassActionDataCorrectionType } from '@libs/entities-lib/mass-action';
import { fixtureGenerateContactInformationDataCorrectionCsvFile } from '../../../fixtures/mass-action-data-correction';
import {
  MassActionDataCorrectionFileParams,
  createEventAndTeam,
  getPersonsInfo,
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
const filePath = 'cypress/downloads/contactInfoDataCorrectionMassAction.csv';

describe('#TC1835# - Process a Contact Information data correction file', { tags: ['@household', '@mass-actions'] }, () => {
  describe('Can Roles', () => {
    for (const roleName of filteredCanRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.getToken().then(async (tokenResponse) => {
            accessTokenL6 = tokenResponse.access_token;
            const resultPrepareStateEvent = await createEventAndTeam(accessTokenL6, allRoles);
            const resultMultipleHousehold = await prepareStateMultipleHouseholds(accessTokenL6, resultPrepareStateEvent.event, householdQuantity);

            const personIds: string[] = [
              resultMultipleHousehold.householdsCreated[0].registrationResponse.household.members[0],
              resultMultipleHousehold.householdsCreated[1].registrationResponse.household.members[0],
              resultMultipleHousehold.householdsCreated[2].registrationResponse.household.members[0],
            ];
            const resultPersonsInfo = await getPersonsInfo(resultMultipleHousehold.provider, personIds);

            const primaryMemberHouseholds: Record<string, string> = {
              [resultPersonsInfo[0].id]: resultPersonsInfo[0].etag,
              [resultPersonsInfo[1].id]: resultPersonsInfo[1].etag,
              [resultPersonsInfo[2].id]: resultPersonsInfo[2].etag,
            };
            const resultGenerateCsvFile = fixtureGenerateContactInformationDataCorrectionCsvFile(primaryMemberHouseholds, filePath);

            const massActionDataCorrectionFileParamData: MassActionDataCorrectionFileParams = {
              provider: resultMultipleHousehold.provider,
              dataCorrectionType: MassActionDataCorrectionType.ContactInformation,
              generatedCsvFile: resultGenerateCsvFile,
              correctionType: 'Contact Information',
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
        it('should successfully process a Contact Information data correction file', () => {
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
        it('should not be able to process a Contact Information data correction file', () => {
          cy.contains('You do not have permission to access this page').should('be.visible');
        });
      });
    }
  });
});
