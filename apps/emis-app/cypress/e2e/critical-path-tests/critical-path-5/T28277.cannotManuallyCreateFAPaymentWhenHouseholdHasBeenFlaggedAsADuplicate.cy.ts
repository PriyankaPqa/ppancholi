import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { EFinancialAmountModes } from '@libs/entities-lib/financial-assistance';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import {
  createEventAndTeam,
  createProgramWithTableWithItemAndSubItem,
  creatingDuplicateHousehold,
} from '../../helpers/prepareState';
import { CaseFileFinancialAssistanceHomePage } from '../../../pages/casefiles/caseFileFinancialAssistanceHome.page';

const canRoles = [
  UserRoles.level6,
  UserRoles.level5,
  UserRoles.level4,
  UserRoles.level3,
  UserRoles.level2,
  UserRoles.level1,
];

const cannotRoles = [
  UserRoles.level0,
  UserRoles.contributor1,
  UserRoles.contributor2,
  UserRoles.contributor3,
  UserRoles.readonly,
];

const { filteredCanRoles, filteredCannotRoles, allRoles } = getRoles(canRoles, cannotRoles);

let accessTokenL6 = '';

describe('[T28277] Cannot create manual FA payment when Household has been flagged as a duplicate', { tags: ['@financial-assistance'] }, () => {
  before(() => {
    cy.getToken().then(async (tokenResponse) => {
      accessTokenL6 = tokenResponse.access_token;
      const resultCreatedEvent = await createEventAndTeam(accessTokenL6, allRoles);
      await createProgramWithTableWithItemAndSubItem(resultCreatedEvent.provider, resultCreatedEvent.event.id, EFinancialAmountModes.Fixed);
      cy.wrap(resultCreatedEvent.provider).as('provider');
      cy.wrap(resultCreatedEvent.event).as('event');
      cy.wrap(resultCreatedEvent.team).as('teamCreated');
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
            const resultCreateDuplicateHousehold = await creatingDuplicateHousehold(accessTokenL6, this.event, this.provider);
            const { firstHousehold } = resultCreateDuplicateHousehold;
            cy.wrap(firstHousehold.registrationResponse.caseFile).as('originalCaseFile');
            cy.wrap(firstHousehold.registrationResponse.caseFile.id).as('originalCaseFileId');

            cy.login(roleName);
            cy.get('@originalCaseFileId').then((id) => {
              cy.goTo(`casefile/${id}/financialAssistance`);
            });
          });
        });

        it('should not be able to create a FA payment due to the potential duplicate', () => {
          const caseFileFinancialAssistancePage = new CaseFileFinancialAssistanceHomePage();
          cy.waitUntilTableFullyLoaded('financialAssistanceOverview__table');
          // eslint-disable-next-line cypress/no-unnecessary-waiting
          cy.wait(1000);
          caseFileFinancialAssistancePage.getAddFinancialAssistanceButton().should('be.visible');
          caseFileFinancialAssistancePage.getAddFinancialAssistanceButton().click();
          cy.getByDataTest({ selector: 'error-message' }).getAndTrimText().should('eq', 'Financial assistance cannot be created. Household is flagged as a potential duplicate.');
          cy.getByDataTest({ selector: 'dialog-submit-action' }).click();
          caseFileFinancialAssistancePage.getFinancialAssistanceTableTitle().should('contain.text', 'Financial assistance');
        });
      });
    }
  });

  describe('Cannot Roles', () => {
    for (const roleName of filteredCannotRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.then(async function () {
            const resultCreateDuplicateHousehold = await creatingDuplicateHousehold(accessTokenL6, this.event, this.provider);
            const { firstHousehold } = resultCreateDuplicateHousehold;
            cy.wrap(firstHousehold.registrationResponse.caseFile).as('originalCaseFile');
            cy.wrap(firstHousehold.registrationResponse.caseFile.id).as('originalCaseFileId');

            cy.login(roleName);
            cy.get('@originalCaseFileId').then((id) => {
              cy.log('first case File---->', id);
              cy.goTo(`casefile/${id}/financialAssistance`);
            });
          });
        });

        it('should not be able to add an FA', () => {
          const caseFileFinancialAssistancePage = new CaseFileFinancialAssistanceHomePage();
          caseFileFinancialAssistancePage.getAddFinancialAssistanceButton().should('not.exist');
        });
      });
    }
  });
});
