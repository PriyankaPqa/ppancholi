import { UserRoles } from '@libs/cypress-lib/support/msal';
import { IIdentityAuthentication, IdentityAuthenticationMethod, IdentityAuthenticationStatus } from '@libs/entities-lib/case-file';
import { fixtureGenerateAuthenticationOtherDataCorrectionCsvFile } from '../../../fixtures/mass-action-data-correction';
import { createEventAndTeam, getCaseFilesSummary, prepareStateMultipleHouseholds, setCaseFileIdentityAuthentication } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { preprocessDataCorrectionFileCanSteps } from './canSteps';

const updatedIdentityAuthenticationStatus: IIdentityAuthentication = {
  status: IdentityAuthenticationStatus.Passed,
  method: IdentityAuthenticationMethod.Exceptional,
  identificationIds: [{
    optionItemId: 'd9c5618e-40df-446c-86d4-19d5d6b37a04',
    specifiedOther: 'Update Identity Authentication using Mass Action',
  }],
};
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
const filePath = 'cypress/downloads/authenticationOtherDataCorrectionMassAction.csv';
const dataCorrectionTypeDataTest = 'Authentication Specified Other';
const dataCorrectionTypeDropDown = 'Authentication Other';

describe('#TC1708# - Pre-process a Authentication Other data correction file', { tags: ['@case-file', '@mass-actions'] }, () => {
  describe('Can Roles', () => {
    for (const [roleName, roleValue] of Object.entries(canRoles)) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.getToken().then(async (tokenResponse) => {
            accessTokenL6 = tokenResponse.access_token;
            const resultPrepareStateEvent = await createEventAndTeam(accessTokenL6, allRolesValues);
            // eslint-disable-next-line
            const resultMultipleHousehold = await prepareStateMultipleHouseholds(accessTokenL6, resultPrepareStateEvent.event, householdQuantity);
            const casefileIds: string[] = [
              resultMultipleHousehold.householdsCreated[0].registrationResponse.caseFile.id,
              resultMultipleHousehold.householdsCreated[1].registrationResponse.caseFile.id,
              resultMultipleHousehold.householdsCreated[2].registrationResponse.caseFile.id,
            ];
            await setCaseFileIdentityAuthentication(resultMultipleHousehold.provider, casefileIds, updatedIdentityAuthenticationStatus);
            const resultCaseFilesSummary = await getCaseFilesSummary(resultMultipleHousehold.provider, casefileIds);
            cy.wrap(resultPrepareStateEvent.provider).as('provider');
            cy.wrap(resultPrepareStateEvent.event).as('event');
            cy.wrap(resultPrepareStateEvent.team).as('teamCreated');
            cy.wrap(resultCaseFilesSummary).as('caseFilesSummary');
            cy.login(roleValue);
            cy.goTo('mass-actions/data-correction/create');
          });
        });
        afterEach(function () {
          if (this.teamCreated?.id && this.provider) {
            removeTeamMembersFromTeam(this.teamCreated.id, this.provider);
          }
        });
        it('should successfully pre-process an Authentication Other data correction file', function () {
          const casefiles: Record<string, string> = {
            [this.caseFilesSummary[0].id]: this.caseFilesSummary[0].etag,
            [this.caseFilesSummary[1].id]: this.caseFilesSummary[1].etag,
            [this.caseFilesSummary[2].id]: this.caseFilesSummary[2].etag,
          };
          fixtureGenerateAuthenticationOtherDataCorrectionCsvFile(casefiles, filePath);

          preprocessDataCorrectionFileCanSteps({
            retries: this.test.retries.length,
            dataCorrectionTypeDataTest,
            dataCorrectionTypeDropDown,
            filePath,
            preprocessedItems: 'case files',
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
        it('should not be able to pre-process an Authentication Other data correction file', () => {
          cy.contains('You do not have permission to access this page').should('be.visible');
        });
      });
    }
  });
});
