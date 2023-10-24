import { UserRoles } from '@libs/cypress-lib/support/msal';
import { MassActionRunStatus } from '@libs/entities-lib/mass-action';
import { getToday } from '@libs/cypress-lib/helpers';
import { getUserName } from '@libs/cypress-lib/helpers/users';
import { fixtureBaseMassAction, fixtureGenerateContactInformationDataCorrectionCsvFile } from '../../../fixtures/mass-actions';
import { NewDataCorrectionPage } from '../../../pages/mass-action/data-correction/newDataCorrection.page';
import { createEventAndTeam, getPersonsInfo, prepareStateMultipleHouseholds } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';

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
const filePath = 'cypress/downloads/contactInfoDataCorrectionMassAction.csv';
const dataCorrectionType = 'Contact Information';

describe('#TC1709# - Pre-process a Contact Information data correction file', { tags: ['@household', '@mass-actions'] }, () => {
  describe('Can Roles', () => {
    for (const [roleName, roleValue] of Object.entries(canRoles)) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.getToken().then(async (tokenResponse) => {
            accessTokenL6 = tokenResponse.access_token;
            const resultPrepareStateEvent = await createEventAndTeam(accessTokenL6, allRolesValues);
            // eslint-disable-next-line
            const resultMultipleHousehold = await prepareStateMultipleHouseholds(accessTokenL6, resultPrepareStateEvent.event, householdQuantity);
            const personIds: string[] = [
              resultMultipleHousehold.householdsCreated[0].registrationResponse.household.members[0],
              resultMultipleHousehold.householdsCreated[1].registrationResponse.household.members[0],
              resultMultipleHousehold.householdsCreated[2].registrationResponse.household.members[0],
            ];
            const resultPersonsInfo = await getPersonsInfo(resultMultipleHousehold.provider, personIds);
            cy.wrap(resultPrepareStateEvent.provider).as('provider');
            cy.wrap(resultPrepareStateEvent.event).as('event');
            cy.wrap(resultPrepareStateEvent.team).as('teamCreated');
            cy.wrap(resultPersonsInfo).as('primaryMemberHouseholds');
            cy.login(roleValue);
            cy.goTo('mass-actions/data-correction/create');
          });
        });
        afterEach(function () {
          if (this.teamCreated?.id && this.provider) {
            removeTeamMembersFromTeam(this.teamCreated.id, this.provider);
          }
        });
        it('should successfully pre-process a Contact Information data correction file', function () {
          const primaryMemberHouseholds: Record<string, string> = {
            [this.primaryMemberHouseholds[0].id]: this.primaryMemberHouseholds[0].etag,
            [this.primaryMemberHouseholds[1].id]: this.primaryMemberHouseholds[1].etag,
            [this.primaryMemberHouseholds[2].id]: this.primaryMemberHouseholds[2].etag,
          };
          fixtureGenerateContactInformationDataCorrectionCsvFile(primaryMemberHouseholds, filePath);
          const baseMassActionData = fixtureBaseMassAction(this.test.retries.length);

          const newDataCorrectionPage = new NewDataCorrectionPage();
          newDataCorrectionPage.selectMassActionCorrectionType(dataCorrectionType);
          newDataCorrectionPage.fillMassActionDescription(baseMassActionData.description);
          newDataCorrectionPage.uploadFile().selectFile(filePath, { force: true });
          newDataCorrectionPage.clickNext();
          newDataCorrectionPage.getDialogTitle().should('eq', 'Confirm pre-processing');
          newDataCorrectionPage.getDialogText().should('eq', 'Are you sure you want to start pre-processing this mass action?');
          newDataCorrectionPage.getDialogSubmitButton().should('be.visible');
          newDataCorrectionPage.getDialogCancelButton().should('be.visible');

          const baseDetailsMassActionPage = newDataCorrectionPage.confirmPreprocessing();
          baseDetailsMassActionPage.getPreProcessingLabelOne().should('eq', 'Please wait while the file is being pre-processed.');
          baseDetailsMassActionPage.getPreProcessingLabelTwo().should('eq', 'This might take a few minutes, depending on the number of household records');
          cy.waitForMassActionToBe(MassActionRunStatus.PreProcessed);
          baseDetailsMassActionPage.getMassActionStatus().contains('Pre-processed').should('be.visible');
          baseDetailsMassActionPage.getMassActionSuccessfulCaseFiles().then((quantity) => {
            if (quantity === householdQuantity.toString()) {
              baseDetailsMassActionPage.getMassActionProcessButton().should('be.enabled');
              baseDetailsMassActionPage.getInvalidCasefilesDownloadButton().should('be.disabled');
            } else {
              baseDetailsMassActionPage.getMassActionProcessButton().should('be.disabled');
              baseDetailsMassActionPage.getInvalidCasefilesDownloadButton().should('be.enabled');
            }
          });
          baseDetailsMassActionPage.getMassActionName().should('string', dataCorrectionType);
          baseDetailsMassActionPage.getMassActionDescription().should('eq', baseMassActionData.description);
          baseDetailsMassActionPage.getMassActionType().should('eq', dataCorrectionType);
          baseDetailsMassActionPage.getMassActionDateCreated().should('eq', getToday());
          baseDetailsMassActionPage.verifyAndGetMassActionCreatedBy().should('eq', getUserName(roleName));
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
        it('should not be able to pre-process a Contact Information data correction file', () => {
          cy.contains('You do not have permission to access this page').should('be.visible');
        });
      });
    }
  });
});
