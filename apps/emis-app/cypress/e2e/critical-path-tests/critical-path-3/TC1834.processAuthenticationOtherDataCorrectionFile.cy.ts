import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { MassActionDataCorrectionType } from '@libs/entities-lib/mass-action';
import {
  createEventAndTeam,
  getCaseFilesSummary,
  prepareStateMassActionDataCorrectionFile,
  prepareStateMultipleHouseholds,
  setCaseFileIdentityAuthentication,
} from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { processDataCorrectionFileSteps, updatedIdentityAuthenticationStatus } from './canSteps';
import { fixtureGenerateAuthenticationOtherDataCorrectionCsvFile } from '../../../fixtures/mass-action-data-correction';

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
const filePath = 'cypress/downloads/authenticationOtherDataCorrectionMassAction.csv';

describe('#TC1834# - Process an Authentication Other data correction file', { tags: ['@case-file', '@mass-actions'] }, () => {
  describe('Can Roles', () => {
    for (const roleName of filteredCanRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.getToken().then(async (tokenResponse) => {
            accessTokenL6 = tokenResponse.access_token;
            const resultPrepareStateEvent = await createEventAndTeam(accessTokenL6, allRoles);
            const resultMultipleHousehold = await prepareStateMultipleHouseholds(accessTokenL6, resultPrepareStateEvent.event, householdQuantity);
            const casefileIds: string[] = [
              resultMultipleHousehold.householdsCreated[0].registrationResponse.caseFile.id,
              resultMultipleHousehold.householdsCreated[1].registrationResponse.caseFile.id,
              resultMultipleHousehold.householdsCreated[2].registrationResponse.caseFile.id,
            ];
            await setCaseFileIdentityAuthentication(resultMultipleHousehold.provider, casefileIds, updatedIdentityAuthenticationStatus);
            const resultCaseFilesSummary = await getCaseFilesSummary(resultMultipleHousehold.provider, casefileIds);
            const casefiles: Record<string, string> = {
              [resultCaseFilesSummary[0].id]: resultCaseFilesSummary[0].etag,
              [resultCaseFilesSummary[1].id]: resultCaseFilesSummary[1].etag,
              [resultCaseFilesSummary[2].id]: resultCaseFilesSummary[2].etag,
            };
            const resultGenerateCsvFile = fixtureGenerateAuthenticationOtherDataCorrectionCsvFile(casefiles, filePath);
            const resultMassFinancialAssistance = await prepareStateMassActionDataCorrectionFile(
              resultMultipleHousehold.provider,
              MassActionDataCorrectionType.AuthenticationSpecifiedOther,
              resultGenerateCsvFile,
            );
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
        it('should successfully process an Authentication Other data correction file', () => {
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
       it('should not be able to process an Authentication Other data correction file', () => {
         cy.contains('You do not have permission to access this page').should('be.visible');
       });
     });
   }
 });
});
