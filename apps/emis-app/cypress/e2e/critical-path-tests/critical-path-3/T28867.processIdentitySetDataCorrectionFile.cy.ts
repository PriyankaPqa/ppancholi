import { MassActionDataCorrectionType } from '@libs/entities-lib/mass-action';
import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { MockCreateMassActionXlsxFileRequestParams } from '@libs/cypress-lib/mocks/mass-actions/massFinancialAssistance';
import { getUserName, getUserRoleDescription } from '@libs/cypress-lib/helpers/users';
import { getToday, formatDateToMmmDdYyyy } from '@libs/cypress-lib/helpers';
import { format } from 'date-fns';
import { fixtureGenerateIdentitySetDataCorrectionXlsxFile } from '../../../fixtures/mass-action-data-correction';

import {
  createEventAndTeam,
  getPersonsInfo,
  prepareStateMassActionXlsxFile,
  prepareStateMultipleHouseholds,
  updatePersonsGender,
} from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { processDataCorrectionFileSteps } from './canSteps';
import { CaseFilesHomePage } from '../../../pages/casefiles/caseFilesHome.page';
import { HouseholdProfilePage } from '../../../pages/casefiles/householdProfile.page';

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
const fileName = 'identitySetDataCorrectionMassAction';

describe('[T28867] Process an Identity Set data correction file', { tags: ['@household', '@mass-actions'] }, () => {
  describe('Can Roles', () => {
    for (const roleName of filteredCanRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.getToken().then(async (tokenResponse) => {
            accessTokenL6 = tokenResponse.access_token;
            const resultPrepareStateEvent = await createEventAndTeam(accessTokenL6, allRoles);
            // eslint-disable-next-line
            const resultCreatedMultipleHousehold = await prepareStateMultipleHouseholds(accessTokenL6, resultPrepareStateEvent.event, householdQuantity);
            const householdMemberIds: string[] = [
              resultCreatedMultipleHousehold.householdsCreated[0].registrationResponse.household.members[0],
              resultCreatedMultipleHousehold.householdsCreated[1].registrationResponse.household.members[0],
              resultCreatedMultipleHousehold.householdsCreated[2].registrationResponse.household.members[0],
            ];
            await updatePersonsGender(resultCreatedMultipleHousehold.provider, householdMemberIds);
            const resultPersonsInfo = await getPersonsInfo(resultCreatedMultipleHousehold.provider, householdMemberIds);
            const memberHouseholds: Record<string, string> = {
              [resultPersonsInfo[0].id]: resultPersonsInfo[0].etag.replace(/"/g, ''),
              [resultPersonsInfo[1].id]: resultPersonsInfo[1].etag.replace(/"/g, ''),
              [resultPersonsInfo[2].id]: resultPersonsInfo[2].etag.replace(/"/g, ''),
            };
            const resultGenerateXlsxFile = await fixtureGenerateIdentitySetDataCorrectionXlsxFile(memberHouseholds, 'MassActionTable', fileName);
            const mockRequestDataParams: MockCreateMassActionXlsxFileRequestParams = {
              fileContents: resultGenerateXlsxFile,
              massActionType: MassActionDataCorrectionType.DataCorrectionIdentitySet,
              fileName,
              eventId: null,
            };
            const resultMassFinancialAssistance = await prepareStateMassActionXlsxFile(resultCreatedMultipleHousehold.provider, 'data-correction', mockRequestDataParams);
            cy.wrap(resultCreatedMultipleHousehold.householdsCreated[0].registrationResponse.caseFile.caseFileNumber).as('caseFileNumber');
            cy.wrap(resultCreatedMultipleHousehold.householdsCreated[0].registrationResponse.household.id).as('householdId');
            cy.wrap(resultPrepareStateEvent.provider).as('provider');
            cy.wrap(resultPrepareStateEvent.team).as('teamCreated');
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
        it('should successfully process a Identity Set data correction file', function () {
          processDataCorrectionFileSteps(
            { householdQuantity, processedItems: 'household records', massActionName: this.massActionName, massActionType: 'Identity Set', roleName },
          );
          cy.goTo('casefile');
          const caseFilesHomePage = new CaseFilesHomePage();
          const caseFileDetailsPage = caseFilesHomePage.goToCaseFileDetail(this.caseFileNumber);
          caseFileDetailsPage.waitAndRefreshUntilCaseFileActivityVisibleWithBody('Personal information changed');
          caseFileDetailsPage.getCaseFileActivityCard().within(() => {
            caseFileDetailsPage.getRoleNameSystemAdmin().should('eq', 'System Admin');
            caseFileDetailsPage.getCaseFileActivityLogDate().should('string', formatDateToMmmDdYyyy(format(Date.now(), 'PPp')));
            caseFileDetailsPage.getCaseFileActivityTitle().should('eq', 'Modified household information');
            caseFileDetailsPage.getCaseFileActivityBody().should('eq', 'Personal information changed');
          });
          caseFileDetailsPage.goToHouseholdProfilePage();
          const householdProfilePage = new HouseholdProfilePage();
          const profileHistoryPage = householdProfilePage.goToProfileHistoryPage();
          profileHistoryPage.refreshUntilHouseholdProfileReady(this.householdId.toString());
          profileHistoryPage.getHouseholdHistoryEditedBy().should('eq', `${getUserName(roleName)}${getUserRoleDescription(roleName)}`);
          profileHistoryPage.getHouseholdHistoryChangeDate().should('eq', getToday());
          profileHistoryPage.getHouseholdHistoryLastAction().should('eq', 'Personal information changed');
          profileHistoryPage.getHouseholdHistoryPreviousValue().should('string', 'before mass action data correction');
          profileHistoryPage.getHouseholdHistoryNewValue().should('string', 'after mass action data correction');
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
        it('should not be able to process a Identity Set data correction file', () => {
          cy.contains('You do not have permission to access this page').should('be.visible');
        });
      });
    }
  });
});
