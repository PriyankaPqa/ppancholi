import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { MassActionDataCorrectionType } from '@libs/entities-lib/mass-action';
import { MockCreateMassActionXlsxFileRequestParams } from '@libs/cypress-lib/mocks/mass-actions/massFinancialAssistance';
import { formatDateToMmmDdYyyy } from '@libs/cypress-lib/helpers';
import { format } from 'date-fns';
import {
  createEventAndTeam,
  getCaseFiles,
  prepareStateMassActionXlsxFile,
  prepareStateMultipleHouseholds,
} from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { processDataCorrectionFileSteps } from './canSteps';
import { fixtureGenerateLabelDataCorrectionXlsxFile } from '../../../fixtures/mass-action-data-correction';
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
const householdQuantity = 3;
const fileName = 'labelsDataCorrectionMassAction';

describe('[T28869] Process a Label data correction file', { tags: ['@case-file', '@mass-actions'] }, () => {
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

            const resultCaseFiles = await getCaseFiles(resultMultipleHousehold.provider, casefileIds);

            const casefiles: Record<string, string> = {
              [resultCaseFiles[0].id]: resultCaseFiles[0].etag.replace(/"/g, ''),
              [resultCaseFiles[1].id]: resultCaseFiles[1].etag.replace(/"/g, ''),
              [resultCaseFiles[2].id]: resultCaseFiles[2].etag.replace(/"/g, ''),
            };
            const resultGeneratedXlsxFile = await fixtureGenerateLabelDataCorrectionXlsxFile(casefiles, 'MassActionTable', fileName);

            const mockRequestDataParams: MockCreateMassActionXlsxFileRequestParams = {
              fileContents: resultGeneratedXlsxFile,
              massActionType: MassActionDataCorrectionType.DataCorrectionLabels,
              fileName,
              eventId: null,
            };
            const resultMassFinancialAssistance = await prepareStateMassActionXlsxFile(resultMultipleHousehold.provider, 'data-correction', mockRequestDataParams);
            cy.wrap(resultMultipleHousehold.householdsCreated[0].registrationResponse.caseFile.caseFileNumber).as('caseFileNumber');
            cy.wrap(resultPrepareStateEvent.provider).as('provider');
            cy.wrap(resultPrepareStateEvent.event).as('event');
            cy.wrap(resultPrepareStateEvent.team).as('teamCreated');
            cy.wrap(resultCaseFiles).as('caseFiles');
            cy.wrap(resultMassFinancialAssistance.name).as('massActionName');
            cy.login(roleName);
            cy.goTo(`mass-actions/data-correction/details/${resultMassFinancialAssistance.id}`);
          });
        });

        afterEach(function () {
          if (this.teamCreated?.id && this.provider) {
            removeTeamMembersFromTeam(this.teamCreated.id, this.provider);
          }
        });

        it('should successfully process a Label data correction file', function () {
          processDataCorrectionFileSteps(
            { householdQuantity, processedItems: 'case file records', massActionName: this.massActionName, massActionType: 'Labels', roleName },
          );
          cy.goTo('casefile');
          const caseFilesHomePage = new CaseFilesHomePage();
          const caseFileDetailsPage = caseFilesHomePage.goToCaseFileDetail(this.caseFileNumber);
          caseFileDetailsPage.waitAndRefreshUntilCaseFileActivityVisibleWithBody('New Labels: Test Label 1 | Test Label 2 | Test Label 3 | Test Label 4');
          caseFileDetailsPage.getCaseFileActivityCard().within(() => {
            caseFileDetailsPage.getRoleNameSystemAdmin().should('eq', 'System Admin');
            caseFileDetailsPage.getCaseFileActivityLogDate().should('string', formatDateToMmmDdYyyy(format(Date.now(), 'PPp')));
            caseFileDetailsPage.getCaseFileActivityTitle().should('eq', 'Case File Labels Updated');
            caseFileDetailsPage.getCaseFileActivityBody().should('string', 'New Labels: Test Label 1 | Test Label 2 | Test Label 3 | Test Label 4');
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
        it('should not be able to process a Label data correction file', () => {
          cy.contains('You do not have permission to access this page').should('be.visible');
        });
      });
    }
  });
});
