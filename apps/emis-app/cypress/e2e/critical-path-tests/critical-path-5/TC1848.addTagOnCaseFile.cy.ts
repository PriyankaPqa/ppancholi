import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { getUserName, getUserRoleDescription } from '@libs/cypress-lib/helpers/users';
import { createEventAndTeam, prepareStateHousehold } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { CaseFileDetailsPage, caseFileTags } from '../../../pages/casefiles/caseFileDetails.page';

const canRoles = [
  UserRoles.level6,
  UserRoles.level5,
  UserRoles.level4,
  UserRoles.level3,
  UserRoles.level2,
];

const cannotRoles = [
  UserRoles.level1,
  UserRoles.level0,
  UserRoles.contributor1,
  UserRoles.contributor2,
  UserRoles.contributor3,
  UserRoles.readonly,
];

const { filteredCanRoles, filteredCannotRoles, allRoles } = getRoles(canRoles, cannotRoles);

let accessTokenL6 = '';

describe('#TC1848# - Add tag on case file', { tags: ['@case-file'] }, () => {
  before(() => {
    cy.getToken().then(async (tokenResponse) => {
      accessTokenL6 = tokenResponse.access_token;
      const resultCreatedEvent = await createEventAndTeam(accessTokenL6, allRoles);
      cy.wrap(resultCreatedEvent.provider).as('provider');
      cy.wrap(resultCreatedEvent.event).as('event');
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
            cy.login(roleName);
            cy.goTo(`casefile/${resultHouseholdCreated.registrationResponse.caseFile.id}`);
          });
        });

        it('should be able to add Irregular tag on Case File', () => {
          const caseFileDetailsPage = new CaseFileDetailsPage();
          caseFileDetailsPage.addTagButton();
          caseFileDetailsPage.getDialogActionCancelButton().should('be.visible');
          caseFileDetailsPage.getDialogActionSubmitButton().should('have.attr', 'disabled').and('contains', 'disabled');
          caseFileDetailsPage.selectTagItem(caseFileTags.Irregular);
          caseFileDetailsPage.getDialogActionSubmitButton().should('be.visible');
          caseFileDetailsPage.getDialogActionSubmitButton().click();
          caseFileDetailsPage.getDisplayedSelectedTag(caseFileTags.Irregular).should('exist');
          caseFileDetailsPage.waitAndRefreshUntilCaseFileActivityVisibleWithBody('Irregular');
          caseFileDetailsPage.getUserName().should('eq', getUserName(roleName));
          caseFileDetailsPage.getRoleName().should('eq', `(${getUserRoleDescription(roleName)})`);
          caseFileDetailsPage.getCaseFileActivityTitle(0).should('string', 'Added tag(s)');
          caseFileDetailsPage.getCaseFileActivityBody(0).should('string', 'Tag name(s): Irregular');
        });
      });
    }
  });

  describe('Cannot roles', () => {
    before(() => {
      cy.then(async function () {
        const resultHouseholdCreated = await prepareStateHousehold(accessTokenL6, this.event);
        cy.wrap(resultHouseholdCreated.registrationResponse.caseFile.id).as('casefileId');
      });
    });

    for (const roleName of filteredCannotRoles) {
      describe(`${roleName}`, () => {
        beforeEach(function () {
          cy.login(roleName);
          cy.goTo(`casefile/${this.casefileId}`);
        });
        it('should not be able to add Irregular tag on casefile', () => {
          const caseFileDetailsPage = new CaseFileDetailsPage();
          cy.contains('Registration').should('be.visible');
          caseFileDetailsPage.getAddTagButton().should('not.exist');
        });
      });
    }
  });
});
