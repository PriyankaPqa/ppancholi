import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { MassActionDataCorrectionType } from '@libs/entities-lib/mass-action';
import {
  MassActionDataCorrectionFileParams,
  createEventAndTeam,
  getCaseFilesSummary,
  prepareStateMassActionDataCorrectionFile,
  prepareStateMultipleHouseholds,
} from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { processDataCorrectionFileSteps } from './canSteps';
import { fixtureGenerateLabelDataCorrectionCsvFile } from '../../../fixtures/mass-action-data-correction';

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
const filePath = 'cypress/downloads/labelsDataCorrectionMassAction.csv';

describe('#TC1838# - Process a Label data correction file', { tags: ['@case-file', '@mass-actions'] }, () => {
  describe('Can Roles', () => {
    for (const roleName of filteredCanRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.getToken().then(async (tokenResponse) => {
            accessTokenL6 = tokenResponse.access_token;
            const resultPrepareStateEvent = await createEventAndTeam(accessTokenL6, allRoles);
            // eslint-disable-next-line
            const resultMultipleHousehold = await prepareStateMultipleHouseholds(accessTokenL6, resultPrepareStateEvent.event, householdQuantity);
            const casefileIds: string[] = [
              resultMultipleHousehold.householdsCreated[0].registrationResponse.caseFile.id,
              resultMultipleHousehold.householdsCreated[1].registrationResponse.caseFile.id,
              resultMultipleHousehold.householdsCreated[2].registrationResponse.caseFile.id,
            ];
            const resultCaseFilesSummary = await getCaseFilesSummary(resultMultipleHousehold.provider, casefileIds);

            const casefiles: Record<string, string> = {
              [resultCaseFilesSummary[0].id]: resultCaseFilesSummary[0].etag,
              [resultCaseFilesSummary[1].id]: resultCaseFilesSummary[1].etag,
              [resultCaseFilesSummary[2].id]: resultCaseFilesSummary[2].etag,
            };
            const resultGenerateCsvFile = fixtureGenerateLabelDataCorrectionCsvFile(casefiles, filePath);
            const massActionDataCorrectionFileParamData: MassActionDataCorrectionFileParams = {
              provider: resultMultipleHousehold.provider,
              dataCorrectionType: MassActionDataCorrectionType.Labels,
              generatedCsvFile: resultGenerateCsvFile,
              correctionType: 'Labels',
            };
            const resultMassFinancialAssistance = await prepareStateMassActionDataCorrectionFile(massActionDataCorrectionFileParamData);
            cy.wrap(resultPrepareStateEvent.provider).as('provider');
            cy.wrap(resultPrepareStateEvent.event).as('event');
            cy.wrap(resultPrepareStateEvent.team).as('teamCreated');
            cy.wrap(resultCaseFilesSummary).as('caseFilesSummary');
            cy.login(roleName);
            cy.goTo(`mass-actions/data-correction/details/${resultMassFinancialAssistance.id}`);
          });
        });

        afterEach(function () {
          if (this.teamCreated?.id && this.provider) {
            removeTeamMembersFromTeam(this.teamCreated.id, this.provider);
          }
        });

        it('should successfully process a Label data correction file', () => {
          processDataCorrectionFileSteps(householdQuantity, 'case file records');
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
        it('should not be able to process a Label data correction file', () => {
          cy.contains('You do not have permission to access this page').should('be.visible');
        });
      });
    }
  });
});
