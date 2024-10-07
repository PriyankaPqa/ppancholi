import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { ECurrentAddressTypes } from '@libs/entities-lib/household-create';
import { MassActionDataCorrectionType } from '@libs/entities-lib/mass-action';
import { MockCreateMassActionXlsxFileRequestParams } from '@libs/cypress-lib/mocks/mass-actions/massFinancialAssistance';
import { getUserName, getUserRoleDescription } from '@libs/cypress-lib/helpers/users';
import { formatDateToMmmDdYyyy, getToday } from '@libs/cypress-lib/helpers';
import { ECanadaProvinces } from '@libs/shared-lib/types';
import { format } from 'date-fns';
import { fixtureGenerateTemporaryAddressDataCorrectionXlsxFile } from '../../../fixtures/mass-action-data-correction';
import {
  createEventAndTeam,
  getPersonsInfo,
  prepareStateMassActionXlsxFile,
  prepareStateMultipleHouseholds,
  updatePersonsCurrentAddress,
} from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { processDataCorrectionFileSteps } from './canSteps';
import { CaseFilesHomePage } from '../../../pages/casefiles/caseFilesHome.page';
import { CaseFileImpactedIndividualsHomePage } from '../../../pages/casefiles/case-file-impacted-individuals/caseFileImpactedIndividualsHome.page';
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
const fileName = 'temporaryAddressDataCorrectionFile';

describe('[T28884] Process a Temporary Address data correction file', { tags: ['@household', '@mass-actions'] }, () => {
  describe('Can Roles', () => {
    for (const roleName of filteredCanRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.getToken().then(async (tokenResponse) => {
            accessTokenL6 = tokenResponse.access_token;
            const resultPrepareStateEvent = await createEventAndTeam(accessTokenL6, allRoles);
            // eslint-disable-next-line
            const resultCreatedMultipleHousehold = await prepareStateMultipleHouseholds(accessTokenL6, resultPrepareStateEvent.event, householdQuantity);
            const personIds: string[] = [
              resultCreatedMultipleHousehold.householdsCreated[0].registrationResponse.household.members[0],
              resultCreatedMultipleHousehold.householdsCreated[1].registrationResponse.household.members[0],
              resultCreatedMultipleHousehold.householdsCreated[2].registrationResponse.household.members[0],
            ];
            const previousAddress = await updatePersonsCurrentAddress(resultCreatedMultipleHousehold.provider, personIds, ECurrentAddressTypes.FriendsFamily);
            const resultPersonsInfo = await getPersonsInfo(resultCreatedMultipleHousehold.provider, personIds);

            const memberHouseholds: Record<string, string> = {
              [resultPersonsInfo[0].id]: resultPersonsInfo[0].etag.replace(/"/g, ''),
              [resultPersonsInfo[1].id]: resultPersonsInfo[1].etag.replace(/"/g, ''),
              [resultPersonsInfo[2].id]: resultPersonsInfo[2].etag.replace(/"/g, ''),
            };

            const resultGeneratedXlsxFile = await fixtureGenerateTemporaryAddressDataCorrectionXlsxFile(memberHouseholds, 'MassActionTable', fileName);

            const mockRequestDataParams: MockCreateMassActionXlsxFileRequestParams = {
              fileContents: resultGeneratedXlsxFile,
              massActionType: MassActionDataCorrectionType.DataCorrectionTemporaryAddress,
              fileName,
              eventId: null,
            };
            const resultMassFinancialAssistance = await prepareStateMassActionXlsxFile(resultCreatedMultipleHousehold.provider, 'data-correction', mockRequestDataParams);
            cy.wrap(resultCreatedMultipleHousehold.householdsCreated[0].registrationResponse.caseFile.caseFileNumber).as('caseFileNumber');
            cy.wrap(resultCreatedMultipleHousehold.householdsCreated[0].registrationResponse.household.id).as('householdId');
            cy.wrap(resultPersonsInfo[0].identitySet.fullName).as('fullName');
            cy.wrap(previousAddress).as('previousAddress');
            cy.wrap(resultPrepareStateEvent.provider).as('provider');
            cy.wrap(resultPrepareStateEvent.event).as('event');
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

        it('should successfully process a Temporary Address data correction file', function () {
          processDataCorrectionFileSteps(
            { householdQuantity, processedItems: 'household records', massActionName: this.massActionName, massActionType: 'Temporary Address', roleName },
          );
          cy.goTo('casefile');
          const caseFilesHomePage = new CaseFilesHomePage();
          const caseFileDetailsPage = caseFilesHomePage.goToCaseFileDetail(this.caseFileNumber);
          caseFileDetailsPage.waitAndRefreshUntilCaseFileActivityVisibleWithBody(`${this.fullName} - Temporary address updated`);
          caseFileDetailsPage.getCaseFileActivityCard().within(() => {
            caseFileDetailsPage.getRoleNameSystemAdmin().should('eq', 'System Admin');
            caseFileDetailsPage.getCaseFileActivityLogDate().should('string', formatDateToMmmDdYyyy(format(Date.now(), 'PPp')));
            caseFileDetailsPage.getCaseFileActivityTitle().should('eq', 'Impacted individuals edited');
            caseFileDetailsPage.getCaseFileActivityBody().should('eq', `${this.fullName} - Temporary address updated`);
          });
          caseFileDetailsPage.goToImpactedIndividualsHomePage();
          const caseFileImpactedIndividualsHomePage = new CaseFileImpactedIndividualsHomePage();
          caseFileImpactedIndividualsHomePage.getPrimaryMemberCard().within(() => {
            caseFileImpactedIndividualsHomePage.getCurrentAddressTypeUnknown().should('eq', 'Unknown');
            caseFileImpactedIndividualsHomePage.getPreviousTemporaryAddressExpandButton().click();
            caseFileImpactedIndividualsHomePage.getCurrentAddressType().should('eq', 'Friends / Family');
            caseFileImpactedIndividualsHomePage.getCurrentAddressStreet().should(
              'eq',
              `${this.previousAddress.address.streetAddress}  #${this.previousAddress.address.unitSuite}`.trim(),
            );
            caseFileImpactedIndividualsHomePage.getCurrentAddressLine().should(
              'eq',
              `${this.previousAddress.address.city}, ${ECanadaProvinces[this.previousAddress.address.province]}, ${this.previousAddress.address.postalCode}`,
            );
          });
          caseFileDetailsPage.goToHouseholdProfilePage();
          const householdProfilePage = new HouseholdProfilePage();
          const profileHistoryPage = householdProfilePage.goToProfileHistoryPage();
          profileHistoryPage.refreshUntilHouseholdProfileReady(this.householdId.toString());
          profileHistoryPage.getHouseholdHistoryEditedBy().should('eq', `${getUserName(roleName)}${getUserRoleDescription(roleName)}`);
          profileHistoryPage.getHouseholdHistoryChangeDate().should('eq', getToday());
          profileHistoryPage.getHouseholdHistoryLastAction().should('eq', 'Temporary address changed');

          profileHistoryPage.getHouseholdHistoryPreviousValue()
            .should('string', `${this.previousAddress.address.unitSuite}-${this.previousAddress.address.streetAddress}`)
            .should('string', `${this.previousAddress.address.city}, ${ECanadaProvinces[Number(this.previousAddress.address.province.toString())]}, `
              + `${this.previousAddress.address.postalCode}`);
          profileHistoryPage.getHouseholdHistoryNewValue().should('string', 'Unknown');
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

        it('should not be able to process a Temporary Address data correction file', () => {
          cy.contains('You do not have permission to access this page').should('be.visible');
        });
      });
    }
  });
});
