import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { CaseFileStatus } from '@libs/entities-lib/case-file';
import { MockCreateMassActionXlsxFileRequestParams } from '@libs/cypress-lib/mocks/mass-actions/massFinancialAssistance';
import { MassActionDataCorrectionType } from '@libs/entities-lib/mass-action';
import { getToday } from '@libs/cypress-lib/helpers';
import { getUserName } from '@libs/cypress-lib/helpers/users';
import {
  createEventAndTeam, prepareStateMultipleHouseholds,
  setCasefileStatus, getCaseFiles, prepareStateMassActionXlsxFile,
} from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { processDataCorrectionFileSteps } from '../critical-path-3/canSteps';
import { fixtureGenerateTriageDataCorrectionXlsxFile } from '../../../fixtures/mass-action-data-correction';
import { BaseDetailsMassAction } from '../../../pages/mass-action/base/baseDetailsMassAction';
import { CaseFilesHomePage } from '../../../pages/casefiles/caseFilesHome.page';

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

describe('[T28885] Process DC triage.', { tags: ['@case-file', '@mass-actions'] }, () => {
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
            const casefiles: Record<string, string> = {
              [resultCaseFiles[0].id]: resultCaseFiles[0].etag.replace(/"/g, ''),
              [resultCaseFiles[1].id]: resultCaseFiles[1].etag.replace(/"/g, ''),
            };
            const resultGeneratedCsvFile = await fixtureGenerateTriageDataCorrectionXlsxFile(casefiles, 'MassActionTable', fileName);
            const mockRequestDataParams: MockCreateMassActionXlsxFileRequestParams = {
              fileContents: resultGeneratedCsvFile,
              massActionType: MassActionDataCorrectionType.DataCorrectionTriage,
              fileName,
              eventId: null,
            };
            const resultMassAction = await prepareStateMassActionXlsxFile(resultMultipleHousehold.provider, 'data-correction', mockRequestDataParams);
            cy.wrap(resultPrepareStateEvent.provider).as('provider');
            cy.wrap(resultPrepareStateEvent.event).as('event');
            cy.wrap(resultPrepareStateEvent.team).as('teamCreated');
            cy.wrap(resultMassAction.name).as('massActionName');
            cy.wrap(resultMultipleHousehold.householdsCreated[0].registrationResponse.caseFile.caseFileNumber).as('caseFileNumber1');
            cy.login(roleName);
            cy.goTo(`mass-actions/data-correction/details/${resultMassAction.id}`);
          });
        });

        after(function () {
          if (this.provider && this.teamCreated?.id) {
            removeTeamMembersFromTeam(this.teamCreated.id, this.provider);
          }
        });

        it('should be able to process a DC triage', function () {
          processDataCorrectionFileSteps(
            { householdQuantity, processedItems: 'case files', massActionName: this.massActionName, massActionType: 'Triage', roleName, processedItemsLabelTwo: 'case files' },
          );
          const baseDetailsMassActionPage = new BaseDetailsMassAction();
          baseDetailsMassActionPage.getBackToMassActionListButton().should('be.enabled');
          baseDetailsMassActionPage.getMassActionType().should('eq', 'Triage');
          baseDetailsMassActionPage.getMassActionDateCreated().should('eq', getToday());
          baseDetailsMassActionPage.verifyAndGetMassActionCreatedBy(getUserName(roleName)).should('eq', getUserName(roleName));
          cy.goTo('casefile');
          const caseFilesHomePage = new CaseFilesHomePage();
          caseFilesHomePage.searchCaseFileTableFor(this.caseFileNumber1);
          const caseFileDetailsPage = caseFilesHomePage.goToCaseFileDetail(this.caseFileNumber1);
          caseFileDetailsPage.waitAndRefreshUntilCaseFileActivityVisibleWithBody('New triage: Tier 2');
          caseFileDetailsPage.getRoleNameSystemAdmin().should('eq', 'System Admin');
          caseFileDetailsPage.getCaseFileActivityTitle().should('string', 'Triage level changed');
          caseFileDetailsPage.getCaseFileActivityBody().should('string', 'New triage: Tier 2');
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
        it('should not be able to process a DC triage', () => {
          cy.contains('You do not have permission to access this page').should('be.visible');
        });
      });
    }
  });
});
