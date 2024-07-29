import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { getUserName, getUserRoleDescription } from '@libs/cypress-lib/helpers/users';
import { createEventAndTeam, prepareStateHousehold } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { CaseFileDetailsPage, DataTest } from '../../../pages/casefiles/caseFileDetails.page';

const canRoles = [
  UserRoles.level6,
  UserRoles.level5,
  UserRoles.level4,
  UserRoles.level3,
  UserRoles.level2,
  UserRoles.level1,
  UserRoles.level0,
];

const cannotRoles = [
  UserRoles.contributor1,
  UserRoles.contributor2,
  UserRoles.contributor3,
  UserRoles.readonly,
];

const { filteredCanRoles, filteredCannotRoles, allRoles } = getRoles(canRoles, cannotRoles);

let accessTokenL6 = '';

describe('[T28181] Add Case File Labels', { tags: ['@case-file'] }, () => {
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

        it('should be able to add case file labels', () => {
          const caseFileDetailsPage = new CaseFileDetailsPage();
          caseFileDetailsPage.addLabel();
          caseFileDetailsPage.getDialogActionSubmitButton().should('not.be.enabled');
          caseFileDetailsPage.getDialogActionCancelButton().should('be.visible');
          caseFileDetailsPage.fillLabelField('Test label 1', DataTest.caseFileLabel1);
          caseFileDetailsPage.fillLabelField('Test label 2', DataTest.caseFileLabel2);
          caseFileDetailsPage.fillLabelField('Test label 3', DataTest.caseFileLabel3);
          caseFileDetailsPage.fillLabelField('Test label 4', DataTest.caseFileLabel4);
          caseFileDetailsPage.getDialogActionSubmitButton().should('be.enabled');
          caseFileDetailsPage.getDialogActionSubmitButton().click();
          cy.contains('Labels are modified').should('be.visible');
          caseFileDetailsPage.waitAndRefreshUntilCaseFileActivityVisibleWithBody('Previous Labels');
          caseFileDetailsPage.getLabelElement().contains('Test label 1').should('be.visible');
          caseFileDetailsPage.getLabelElement().contains('Test label 2').should('be.visible');
          caseFileDetailsPage.getLabelElement().contains('Test label 3').should('be.visible');
          caseFileDetailsPage.getLabelElement().contains('Test label 4').should('be.visible');
          caseFileDetailsPage.getUserName().should('eq', getUserName(roleName));
          caseFileDetailsPage.getRoleName().should('eq', `(${getUserRoleDescription(roleName)})`);
          caseFileDetailsPage.getCaseFileActivityTitle().should('string', 'Case File Labels Updated');
          caseFileDetailsPage.getCaseFileActivityBody()
            .should('string', 'Previous Labels:')
            .and('string', 'New Labels:')
            .and('string', 'Test label 1')
            .and('string', 'Test label 2')
            .and('string', 'Test label 3')
            .and('string', 'Test label 4');
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
        it('should not be able to add case file labels', () => {
          const caseFileDetailsPage = new CaseFileDetailsPage();
          caseFileDetailsPage.getAddLabelButton().should('have.attr', 'disabled', 'disabled');
          caseFileDetailsPage.getAddLabelButton().should('not.be.enabled');
        });
      });
    }
  });
});
