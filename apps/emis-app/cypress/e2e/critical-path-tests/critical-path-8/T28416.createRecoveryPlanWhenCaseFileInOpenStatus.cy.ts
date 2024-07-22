import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { formatDateToMmmDdYyyy } from '@libs/cypress-lib/helpers';
import { getUserName, getUserRoleDescription } from '@libs/cypress-lib/helpers/users';
import { format } from 'date-fns';
import { createEventAndTeam, prepareStateHousehold } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { RecoveryPlanHomePage } from '../../../pages/recovery-plan/recoveryPlanHome.page';

const canRoles = [
  UserRoles.level6,
  UserRoles.level5,
  UserRoles.level4,
  UserRoles.level3,
  UserRoles.level2,
  UserRoles.level1,
  UserRoles.contributor3,
];

const cannotRoles = [
  UserRoles.level0,
  UserRoles.contributor1,
  UserRoles.contributor2,
  UserRoles.readonly,
];

const { filteredCanRoles, filteredCannotRoles, allRoles } = getRoles(canRoles, cannotRoles);

let accessTokenL6 = '';

describe('[T28416] L1+ and C3 can create Recovery Plan when Case File is in Open status', { tags: ['@case-file'] }, () => {
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
            cy.wrap(resultCreateHousehold.registrationResponse.caseFile.id).as('caseFileId');
            cy.login(roleName);
            cy.goTo(`casefile/${resultCreateHousehold.registrationResponse.caseFile.id}/recovery-plan/create`);
          });
        });

        it('should be able to create recovery plan when case file is in open status', () => {
          const recoveryPlanHomePage = new RecoveryPlanHomePage();
          recoveryPlanHomePage.getPageTitleElement().contains('Recovery plan').should('be.visible');
          recoveryPlanHomePage.getRecoveryPlanDescription().should('eq', 'Has this household established a recovery plan?');
          recoveryPlanHomePage.getRecoveryPlanYesButton().should('not.be.checked');
          recoveryPlanHomePage.getRecoveryPlanNoButton().should('not.be.checked');
          recoveryPlanHomePage.getRecoveryPlanYesButton().check({ force: true });
          recoveryPlanHomePage.getRecoveryPlanYesButton().should('be.checked');
          recoveryPlanHomePage.getCrcProvidedRecoveryPlanDescription().should('string', 'Did CRC provide support to recovery planning?');
          recoveryPlanHomePage.getCrcProvidedYesButton().should('not.be.checked');
          recoveryPlanHomePage.getCrcProvidedNoButton().should('not.be.checked');
          recoveryPlanHomePage.getRecoveryPlanSaveButton().should('be.visible');
          recoveryPlanHomePage.getRecoveryPlanCancelButton().should('be.visible');
          recoveryPlanHomePage.getCrcProvidedYesButton().check({ force: true });
          recoveryPlanHomePage.getRecoveryPlanStartDateSection().should('string', 'As of when?');
          recoveryPlanHomePage.selectDate(format(Date.now(), 'PPp'));

          const recoveryPlanDetailsPage = recoveryPlanHomePage.saveRecoveryPlan();
          recoveryPlanDetailsPage.getRecoveryPlanEditButton().should('be.visible');
          recoveryPlanDetailsPage.getRecoveryPlanUploadButton().should('be.visible');
          recoveryPlanDetailsPage.getHasRecoveryPlanEstablished().should('string', 'Yes');
          recoveryPlanDetailsPage.getCrcProvidedRecoveryPlanSupport().should('string', 'Yes');
          recoveryPlanDetailsPage.getCrcProvidedRecoveryPlanDate().should('string', formatDateToMmmDdYyyy(format(Date.now(), 'PPp')));

          const caseFileDetailsPage = recoveryPlanDetailsPage.goToCaseFileDetailsPage();
          caseFileDetailsPage.waitAndRefreshUntilCaseFileActivityVisibleWithBody('Has the household established a recovery plan?');
          caseFileDetailsPage.getUserName().should('eq', getUserName(roleName));
          caseFileDetailsPage.getRoleName().should('eq', `(${getUserRoleDescription(roleName)})`);
          caseFileDetailsPage.getCaseFileActivityTitle().should('string', 'Recovery Plan Update');
          caseFileDetailsPage.getCaseFileActivityBody().should('string', 'Has the household established a recovery plan? Yes')
            .and('string', 'Did CRC provide support to recovery planning? Yes')
            .and('string', `As of when? ${formatDateToMmmDdYyyy(format(Date.now(), 'PPp'))}`);
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
    after(function () {
      if (this.provider && this.teamCreated?.id) {
        removeTeamMembersFromTeam(this.teamCreated.id, this.provider);
      }
    });
    for (const roleName of filteredCannotRoles) {
      describe(`${roleName}`, () => {
        beforeEach(function () {
          cy.login(roleName);
          cy.goTo(`casefile/${this.caseFileId}/recovery-plan/create`);
        });
        it('should not be able to create recovery plan when case file is in open status', () => {
          cy.contains('You do not have permission to access this page').should('be.visible');
        });
      });
    }
  });
});
