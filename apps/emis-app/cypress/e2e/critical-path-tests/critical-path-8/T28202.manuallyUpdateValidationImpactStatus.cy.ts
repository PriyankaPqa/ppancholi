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

describe('[T28202] Manually update Validation of Impact status', { tags: ['@case-file'] }, () => {
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
        it('should be able to manually update validation of impact status', () => {
          const caseFileDetailsPage = new CaseFileDetailsPage();
          caseFileDetailsPage.getImpactIconColorValidationElement().should('have.attr', 'class').and('contains', 'validation-button-warning');
          caseFileDetailsPage.getValidationOfImpactIcon().click();
          caseFileDetailsPage.getDialogTitleElement().contains('Validation of impact').should('be.visible');
          caseFileDetailsPage.getImpactValidationMethodRow().should('be.visible');
          caseFileDetailsPage.getImpactValidationStatusRow().should('be.visible');
          caseFileDetailsPage.getImpactMethodNotApplicableButton().should('be.checked');
          caseFileDetailsPage.getImpactStatusUndeterminedButton().should('be.checked');
          caseFileDetailsPage.getDialogActionCancelButton().should('be.enabled');
          caseFileDetailsPage.getDialogActionSubmitButton().should('not.be.enabled');
          caseFileDetailsPage.getImpactMethodManualButton().check({ force: true });
          caseFileDetailsPage.getImpactStatusImpactedButton().check({ force: true });
          caseFileDetailsPage.getDialogActionSubmitButton().should('be.enabled');
          cy.intercept('PATCH', '**/case-file/case-files/*/validation-of-impact-status').as('impactValidationStatus');
          caseFileDetailsPage.getDialogActionSubmitButton().click();
          cy.wait('@impactValidationStatus').then(async () => {
            cy.contains('The validation of impact has been successfully edited.').should('be.visible');
            caseFileDetailsPage.waitAndRefreshUntilCaseFileActivityVisibleWithBody('New status: Impacted');
            caseFileDetailsPage.getUserName().should('eq', getUserName(roleName));
            caseFileDetailsPage.getRoleName().should('eq', `(${getUserRoleDescription(roleName)})`);
            caseFileDetailsPage.getCaseFileActivityTitle().should('string', 'Changed validation of impact status');
            caseFileDetailsPage.getCaseFileActivityBody().should('string', 'New status: Impacted');
          });
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
        it('should not be able to manually update validation of impact status', () => {
          const caseFileDetailsPage = new CaseFileDetailsPage();
          caseFileDetailsPage.getValidationOfImpactIcon().should('be.disabled');
        });
      });
    }
  });
});
