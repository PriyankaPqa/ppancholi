import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { MassActionDataCorrectionType } from '@libs/entities-lib/mass-action';
import { MockCreateMassActionXlsxFileRequestParams } from '@libs/cypress-lib/mocks/mass-actions/massFinancialAssistance';
import { formatDateToMmmDdYyyy } from '@libs/cypress-lib/helpers';
import { format } from 'date-fns';
import { fixtureGenerateHomeAddressDataCorrectionXlsxFile } from '../../../fixtures/mass-action-data-correction';
import {
  createEventAndTeam,
  getHouseholdsSummary,
  prepareStateMassActionXlsxFile,
  prepareStateMultipleHouseholds,
} from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { processDataCorrectionFileSteps } from './canSteps';
import { CaseFileDetailsPage } from '../../../pages/casefiles/caseFileDetails.page';

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
const fileName = 'homeAddressDataCorrectionFile';

describe('[T28865] Process a Home Address data correction file', { tags: ['@household', '@mass-actions'] }, () => {
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
              [resultHouseholdSummary[0].id]: resultHouseholdSummary[0].etag.replace(/"/g, ''),
              [resultHouseholdSummary[1].id]: resultHouseholdSummary[1].etag.replace(/"/g, ''),
              [resultHouseholdSummary[2].id]: resultHouseholdSummary[2].etag.replace(/"/g, ''),
            };
            const resultGeneratedCsvFile = await fixtureGenerateHomeAddressDataCorrectionXlsxFile(households, 'MassActionTable', fileName);
            const mockRequestDataParams: MockCreateMassActionXlsxFileRequestParams = {
              fileContents: resultGeneratedCsvFile,
              massActionType: MassActionDataCorrectionType.DataCorrectionHomeAddress,
              fileName,
              eventId: null,
            };
            const resultMassFinancialAssistance = await prepareStateMassActionXlsxFile(resultMultipleHousehold.provider, 'data-correction', mockRequestDataParams);
            cy.wrap(resultPrepareStateEvent.provider).as('provider');
            cy.wrap(resultPrepareStateEvent.event).as('event');
            cy.wrap(resultPrepareStateEvent.team).as('teamCreated');
            cy.wrap(resultHouseholdSummary).as('householdsSummary');
            cy.wrap(resultMassFinancialAssistance.name).as('massActionName');
            cy.wrap(resultMultipleHousehold.householdsCreated[0].registrationResponse.caseFile.id).as('caseFileId1');
            cy.login(roleName);
            cy.goTo(`mass-actions/data-correction/details/${resultMassFinancialAssistance.id}`);
          });
        });
        afterEach(function () {
          if (this.teamCreated?.id && this.provider) {
            removeTeamMembersFromTeam(this.teamCreated.id, this.provider);
          }
        });
        it('should successfully process a Home Address data correction file', function () {
          processDataCorrectionFileSteps(
            { householdQuantity, processedItems: 'household records', massActionName: this.massActionName, massActionType: 'Home Address', roleName },
          );
          cy.goTo(`casefile/${this.caseFileId1}`);
          const caseFileDetailsPage = new CaseFileDetailsPage();
          caseFileDetailsPage.waitAndRefreshUntilCaseFileActivityVisibleWithBody('Address information changed');
          caseFileDetailsPage.getCaseFileActivityCard().within(() => {
            caseFileDetailsPage.getRoleNameSystemAdmin().should('eq', 'System Admin');
            caseFileDetailsPage.getCaseFileActivityLogDate().should('string', formatDateToMmmDdYyyy(format(Date.now(), 'PPp')));
            caseFileDetailsPage.getCaseFileActivityTitle().should('eq', 'Modified household information');
            caseFileDetailsPage.getCaseFileActivityBody().should('string', 'Address information changed');
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
        it('should not be able to process a Home Address data correction file', () => {
          cy.contains('You do not have permission to access this page').should('be.visible');
        });
      });
    }
  });
});
