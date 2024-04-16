import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { ICaseFileEntity } from '@libs/entities-lib/case-file';
import { fixtureGenerateAuthenticationDataCorrectionXlsxFile } from '../../../fixtures/mass-action-data-correction';
import {
  createEventAndTeam,
  prepareStateMultipleHouseholds,
  setCaseFileIdentityAuthentication,
} from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { preprocessDataCorrectionFileCanSteps, updatedIdentityAuthenticationStatus } from './canSteps';

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
const fileName = 'authenticationDataCorrectionFile';
const filePath = `cypress/downloads/${fileName}.xlsx`;
const dataCorrectionTypeDataTest = 'Data Correction Authentication';
const dataCorrectionTypeDropDown = 'Authentication';

describe('#TC1708# - Pre-process a Authentication data correction file.', { tags: ['@case-file', '@mass-actions'] }, () => {
  describe('Can Roles', () => {
    for (const roleName of filteredCanRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.getToken().then(async (tokenResponse) => {
            accessTokenL6 = tokenResponse.access_token;
            const resultPrepareStateEvent = await createEventAndTeam(accessTokenL6, allRoles);
            // eslint-disable-next-line
            const resultMultipleHousehold = await prepareStateMultipleHouseholds(accessTokenL6, resultPrepareStateEvent.event, householdQuantity);
            const casefiles: ICaseFileEntity[] = [
              resultMultipleHousehold.householdsCreated[0].registrationResponse.caseFile,
              resultMultipleHousehold.householdsCreated[1].registrationResponse.caseFile,
              resultMultipleHousehold.householdsCreated[2].registrationResponse.caseFile,
            ];
            await setCaseFileIdentityAuthentication(resultMultipleHousehold.provider, casefiles, updatedIdentityAuthenticationStatus);
            cy.wrap(resultPrepareStateEvent.provider).as('provider');
            cy.wrap(resultPrepareStateEvent.event).as('event');
            cy.wrap(resultPrepareStateEvent.team).as('teamCreated');
            cy.wrap(casefiles).as('caseFiles');
            cy.login(roleName);
            cy.goTo('mass-actions/data-correction/create');
          });
        });
        afterEach(function () {
          if (this.teamCreated?.id && this.provider) {
            removeTeamMembersFromTeam(this.teamCreated.id, this.provider);
          }
        });
        it('should successfully pre-process an Authentication data correction file', function () {
          fixtureGenerateAuthenticationDataCorrectionXlsxFile([this.caseFiles[0], this.caseFiles[1], this.caseFiles[2]], 'MassActionTable', fileName);

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
        it('should not be able to pre-process an Authentication Other data correction file', () => {
          cy.contains('You do not have permission to access this page').should('be.visible');
        });
      });
    }
  });
});
