import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { EFinancialAmountModes } from '@libs/entities-lib/financial-assistance';
import { mockAddTagToCaseFileRequest } from '@libs/cypress-lib/mocks/casefiles/casefile';
import {
  createEventAndTeam,
  createProgramWithTableWithItemAndSubItem,
  prepareStateHousehold,
} from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { caseFileTags } from '../../../pages/casefiles/caseFileDetails.page';
import { cannotPreProcessFaMassActionSteps } from './steps';

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

// eslint-disable-next-line
describe('[T29097] Confirm that a record cannot be pre-processed in a Mass Action FA file for a Case File that has an Irregular tag on it', { tags: ['@financial-assistance', '@mass-actions'] }, () => {
  before(() => {
    cy.getToken().then(async (tokenResponse) => {
      accessTokenL6 = tokenResponse.access_token;
      const resultCreatedEvent = await createEventAndTeam(accessTokenL6, allRoles);
      const resultCreateProgram = await createProgramWithTableWithItemAndSubItem(resultCreatedEvent.provider, resultCreatedEvent.event.id, EFinancialAmountModes.Fixed);
      cy.wrap(resultCreatedEvent.provider).as('provider');
      cy.wrap(resultCreatedEvent.event).as('event');
      cy.wrap(resultCreateProgram.table).as('faTable');
      cy.wrap(resultCreateProgram.program.name.translation.en).as('programName');
    });
  });

  after(function () {
    if (this.provider && this.teamCreated?.id) {
      removeTeamMembersFromTeam(this.teamCreated.id, this.provider);
    }
  });

  describe('Can Roles', () => {
    for (const roleName of filteredCanRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.then(async function () {
            const resultHouseholdCreated = await prepareStateHousehold(accessTokenL6, this.event);
            await this.provider.caseFiles.setCaseFileTags(resultHouseholdCreated.registrationResponse.caseFile.id, [mockAddTagToCaseFileRequest(caseFileTags.Irregular)]);
            cy.wrap(resultHouseholdCreated.registrationResponse.caseFile).as('caseFile');
            cy.login(roleName);
            cy.goTo('mass-actions/financial-assistance');
          });
        });

        it('should fail to pre-process financial assistance mass action for casefile with irregular tag', function () {
          cannotPreProcessFaMassActionSteps({
            programName: this.programName,
            eventName: this.event.name.translation.en,
            filePath: 'cypress/downloads/TC1850FaFile.csv',
            retries: this.test.retries.length,
            errorMessage: 'Financial assistance cannot be added due to tags',
            financialAssistanceTable: this.faTable,
            caseFile: this.caseFile,
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
          cy.goTo('mass-actions/financial-assistance');
        });
        it('should not be able to pre-process a financial assistance Mass Action', () => {
          cy.contains('You do not have permission to access this page').should('be.visible');
        });
      });
    }
  });
});
