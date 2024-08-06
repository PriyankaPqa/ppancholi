import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { formatDateToMmmDdYyyy } from '@libs/cypress-lib/helpers';
import { getUserName, getUserRoleDescription } from '@libs/cypress-lib/helpers/users';
import { format } from 'date-fns';
import { createEventAndTeam, prepareStateHousehold } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { CaseFileDetailsPage } from '../../../pages/casefiles/caseFileDetails.page';

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

describe('[T28197] Assign a Triage Level to a Case File', { tags: ['@case-file'] }, () => {
  before(() => {
    cy.getToken().then(async (tokenResponse) => {
      accessTokenL6 = tokenResponse.access_token;
      const resultCreatedEvent = await createEventAndTeam(accessTokenL6, allRoles);
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
            const resultCreateHousehold = await prepareStateHousehold(accessTokenL6, this.event);
            cy.login(roleName);
            cy.goTo(`casefile/${resultCreateHousehold.registrationResponse.caseFile.id}`);
          });
        });
        it('should be able to assign a triage level to a case file', () => {
          const caseFileDetailsPage = new CaseFileDetailsPage();
          caseFileDetailsPage.selectTriage(1);
          caseFileDetailsPage.getSelectedTriageElement().contains('Tier 1').should('be.visible');
          caseFileDetailsPage.waitAndRefreshUntilCaseFileActivityVisibleWithBody('New triage');
          caseFileDetailsPage.getUserName().should('eq', getUserName(roleName));
          caseFileDetailsPage.getRoleName().should('eq', `(${getUserRoleDescription(roleName)})`);
          caseFileDetailsPage.getCaseFileActivityLogDate().should('string', formatDateToMmmDdYyyy(format(Date.now(), 'PPp')));
          caseFileDetailsPage.getCaseFileActivityTitle().should('string', 'Triage level changed');
          caseFileDetailsPage.getCaseFileActivityBody().should('string', 'New triage: Tier 1');
        });
      });
    }
  });
  describe('Cannot Roles', () => {
    before(() => {
      cy.getToken().then(async (tokenResponse) => {
        accessTokenL6 = tokenResponse.access_token;
        const resultCreatedEvent = await createEventAndTeam(accessTokenL6, allRoles);
        const resultCreateHousehold = await prepareStateHousehold(accessTokenL6, resultCreatedEvent.event);
        cy.wrap(resultCreatedEvent.provider).as('provider');
        cy.wrap(resultCreatedEvent.team).as('teamCreated');
        cy.wrap(resultCreateHousehold.registrationResponse.caseFile.id).as('caseFileId');
      });
    });
    for (const roleName of filteredCannotRoles) {
      describe(`${roleName}`, () => {
        beforeEach(function () {
          cy.login(roleName);
          cy.goTo(`casefile/${this.caseFileId}`);
        });
        it('should not be able to assign a triage level to a case file', () => {
          const caseFileDetailsPage = new CaseFileDetailsPage();
          caseFileDetailsPage.getSelectedTriageInputElement()
          .should('have.attr', 'readonly', 'readonly')
          .and('have.attr', 'aria-readonly', 'true');
        });
      });
    }
  });
});
