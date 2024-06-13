import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { CaseFileStatusUpdateReason } from '@libs/cypress-lib/helpers';
import { CaseFileStatus } from '@libs/entities-lib/case-file';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import {
  MassActionCaseFileStatusViaUploadFileParams,
  createEventAndTeam,
  prepareStateMassActionCaseFileStatusViaUploadFile,
} from '../../helpers/prepareState';
import { ProcessMassActionCaseFileStatusUpdateCanSteps, caseFileDetailsPageAssertionSteps } from './canSteps';

const canRoles = [
  UserRoles.level6,
  UserRoles.level5,
];

const cannotRoles = [
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

describe('[T29047] Processed Mass Case File status(open to inactive) upload file', { tags: ['@case-file', '@mass-actions'] }, () => {
  describe('Can Roles', () => {
    for (const roleName of filteredCanRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.getToken().then(async (tokenResponse) => {
            accessTokenL6 = tokenResponse.access_token;
            const resultPrepareStateEvent = await createEventAndTeam(accessTokenL6, allRoles);
            cy.wrap(resultPrepareStateEvent.provider).as('provider');
            cy.wrap(resultPrepareStateEvent.team).as('teamCreated');
            cy.wrap(resultPrepareStateEvent.event).as('event');
            cy.getToken(roleName).then(async (tokenResponse) => {
              const massActionCaseFileStatusUploadFileParamData: MassActionCaseFileStatusViaUploadFileParams = {
                accessToken: tokenResponse.access_token,
                event: resultPrepareStateEvent.event,
                householdQuantity,
                filePath: 'cypress/downloads/caseFileUpdateFile.csv',
                reason: {
                  optionItemId: CaseFileStatusUpdateReason.Inactive,
                  specifiedOther: null,
                },
                rationale: 'it is not Mandatory field',
                status: CaseFileStatus.Inactive,
              };

              const resultMassActionCaseFileStatusViaUploadFile = await prepareStateMassActionCaseFileStatusViaUploadFile(massActionCaseFileStatusUploadFileParamData);
              cy.wrap(massActionCaseFileStatusUploadFileParamData).as('massActionCaseFileStatusUploadFile');
              cy.wrap(resultMassActionCaseFileStatusViaUploadFile.responseMassCaseFileStatusUpdate).as('responseMassCaseFileStatusUpdate');
              cy.wrap(resultMassActionCaseFileStatusViaUploadFile.resultCreateHouseholds.caseFileCreated1.caseFileNumber).as('caseFileNumber1');
              cy.wrap(resultMassActionCaseFileStatusViaUploadFile.responseMassCaseFileStatusUpdate.name).as('massActionName');
              cy.login(roleName);
              cy.goTo(`mass-actions/case-file-status/details/${resultMassActionCaseFileStatusViaUploadFile.responseMassCaseFileStatusUpdate.id}`);
            });
          });
        });
        afterEach(function () {
          if (this.teamCreated?.id && this.provider) {
            removeTeamMembersFromTeam(this.teamCreated.id, this.provider);
          }
        });
        // eslint-disable-next-line
        it('should successfully process mass action for case file status update via upload file', function () {
          ProcessMassActionCaseFileStatusUpdateCanSteps({
            massActionName: this.massActionName,
            massActionCaseFileStatusUpdateRationale: this.massActionCaseFileStatusUploadFile.rationale,
            massActionCaseFileStatusUpdateReason: 'Deceased',
            caseFileStatus: 'Inactive',
            roleName,
            householdQuantity,
            eventName: this.event.name.translation.en,
          });

          caseFileDetailsPageAssertionSteps({
            caseFileNumber1: this.caseFileNumber1,
            massActionCaseFileStatusUpdateRationale: this.massActionCaseFileStatusUploadFile.rationale,
            massActionCaseFileStatusUpdateReason: 'Deceased',
            caseFileStatus: 'Inactive',
            roleName,
            caseFileActivityTitle: 'Case file set to inactive',
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
          cy.goTo('mass-actions/case-file-status');
        });
        it('should not be able to process mass action for case file status update via upload file', () => {
          cy.contains('You do not have permission to access this page').should('be.visible');
        });
      });
    }
  });
});
