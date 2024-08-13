import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { getUserName, getUserRoleDescription } from '@libs/cypress-lib/helpers/users';
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

describe('[T28211] Manually update Authenticate Identity status to Failed', { tags: ['@case-file'] }, () => {
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
        it('should be able to manually update authenticate identity status to failed', () => {
          const caseFileDetailsPage = new CaseFileDetailsPage();
          caseFileDetailsPage.getIdentityIconColorValidationElement().should('have.attr', 'class').and('contains', 'validation-button-warning');
          caseFileDetailsPage.getIdentityIconColorValidationElement().contains('Identity: Not verified').should('be.visible');
          caseFileDetailsPage.getVerifyIdentityIconButton().click({ force: true });
          caseFileDetailsPage.getDialogTitleElement().contains('Authenticate identity').should('be.visible');
          caseFileDetailsPage.getDialogAuthenticationStatusNotVerifiedCheckbox().should('be.checked');
          caseFileDetailsPage.getDialogVerifyIdentityMethodDropdown().should('have.attr', 'disabled').and('contains', 'disabled');
          caseFileDetailsPage.getDialogVerifyIdentityOptionsDropdown().should('have.attr', 'disabled').and('contains', 'disabled');
          caseFileDetailsPage.getDialogVerifyIdentityOptionsDropdown().contains('Not Applicable').should('be.visible');
          caseFileDetailsPage.getDialogActionCancelButton().should('be.enabled');
          caseFileDetailsPage.getDialogActionSubmitButton().should('not.be.enabled');
          caseFileDetailsPage.getDialogAuthenticationStatusFailedCheckbox().check({ force: true });
          caseFileDetailsPage.getDialogAuthenticationStatusFailedCheckbox().should('be.checked');
          caseFileDetailsPage.getDialogActionSubmitButton().should('be.enabled');
          caseFileDetailsPage.getDialogActionSubmitButton().click();
          cy.contains('Your changes have been successfully saved.').should('be.visible');
          caseFileDetailsPage.getIdentityIconColorValidationElement().should('have.attr', 'class').and('contains', 'validation-button-error');
          caseFileDetailsPage.getIdentityIconColorValidationElement().contains('Identity: Failed').should('be.visible');
          caseFileDetailsPage.waitAndRefreshUntilCaseFileActivityVisibleWithBody('New status: Failed');
          caseFileDetailsPage.getUserName().should('eq', getUserName(roleName));
          caseFileDetailsPage.getRoleName().should('eq', `(${getUserRoleDescription(roleName)})`);
          caseFileDetailsPage.getCaseFileActivityTitle().should('string', 'Changed authenticate identity');
          caseFileDetailsPage.getCaseFileActivityBody().should('string', 'New status: Failed');
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
          cy.goTo(`casefile/${this.caseFileId}`);
        });
        it('should not be able to manually update authenticate identity status to failed', () => {
          const caseFileDetailsPage = new CaseFileDetailsPage();
          cy.contains('Impact').should('be.visible');
          caseFileDetailsPage.getVerifyIdentityIconButton().should('not.exist');
        });
      });
    }
  });
});
