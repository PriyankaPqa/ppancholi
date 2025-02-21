import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { CaseFileStatus } from '@libs/entities-lib/case-file';
import {
  createEventAndTeam, prepareStateMultipleHouseholds,
  setCasefileStatus, getCaseFiles,
} from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { preprocessDataCorrectionFileCanSteps } from '../critical-path-3/canSteps';
import { fixtureGenerateTriageDataCorrectionXlsxFile } from '../../../fixtures/mass-action-data-correction';

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
const householdQuantity = 2;
const fileName = 'T28888MassActionTriage';
const filePath = `cypress/downloads/${fileName}.xlsx`;
const dataCorrectionTypeDataTest = 'DataCorrectionTriage';
const dataCorrectionTypeDropDown = 'Triage';

describe('[T28888] Pre-process DC triage', { tags: ['@case-file', '@mass-actions'] }, () => {
  describe('Can Roles', () => {
    for (const roleName of filteredCanRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.getToken().then(async (tokenResponse) => {
            accessTokenL6 = tokenResponse.access_token;
            const resultPrepareStateEvent = await createEventAndTeam(accessTokenL6, allRoles);
            const resultMultipleHousehold = await prepareStateMultipleHouseholds(accessTokenL6, resultPrepareStateEvent.event, householdQuantity);
            await setCasefileStatus(resultMultipleHousehold.provider, resultMultipleHousehold.householdsCreated[1].registrationResponse.caseFile.id, CaseFileStatus.Inactive);
            const casefileIds: string[] = [
              resultMultipleHousehold.householdsCreated[0].registrationResponse.caseFile.id,
              resultMultipleHousehold.householdsCreated[1].registrationResponse.caseFile.id,
            ];
            const resultCaseFiles = await getCaseFiles(resultMultipleHousehold.provider, casefileIds);
            cy.wrap(resultPrepareStateEvent.provider).as('provider');
            cy.wrap(resultPrepareStateEvent.event).as('event');
            cy.wrap(resultPrepareStateEvent.team).as('teamCreated');
            cy.wrap(resultCaseFiles).as('caseFiles');
            cy.login(roleName);
            cy.goTo('mass-actions/data-correction/create');
          });
        });

        after(function () {
          if (this.provider && this.teamCreated?.id) {
            removeTeamMembersFromTeam(this.teamCreated.id, this.provider);
          }
        });

        it('should be able to pre-process a DC triage', function () {
          const casefiles: Record<string, string> = {
            [this.caseFiles[0].id]: this.caseFiles[0].etag.replace(/"/g, ''),
            [this.caseFiles[1].id]: this.caseFiles[1].etag.replace(/"/g, ''),
          };
          fixtureGenerateTriageDataCorrectionXlsxFile(casefiles, 'MassActionTable', fileName);
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
    for (const roleName of filteredCannotRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.login(roleName);
          cy.goTo('mass-actions/data-correction/create');
        });
        it('should not be able to pre-process a DC triage', () => {
          cy.contains('You do not have permission to access this page').should('be.visible');
        });
      });
    }
  });
});
