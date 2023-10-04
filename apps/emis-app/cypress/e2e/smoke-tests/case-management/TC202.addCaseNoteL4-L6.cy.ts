import { UserRoles } from '@libs/cypress-lib/support/msal';
import { IEventEntity } from '@libs/entities-lib/event';
import { getUserName, getUserRoleDescription } from '@libs/cypress-lib/helpers/users';
import { ICaseFileEntity } from '@libs/entities-lib/case-file';
import { getToday } from '@libs/cypress-lib/helpers';
import { fixtureCaseNotes } from '../../../fixtures/case-management';
import { createEventAndTeam, prepareStateHousehold } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { CaseNotesPage } from '../../../pages/casefiles/caseNotes.page';
import { CaseFilesHomePage } from '../../../pages/casefiles/caseFilesHome.page';

const canRoles = {
  Level6: UserRoles.level6,
  Level5: UserRoles.level5,
  Level4: UserRoles.level4,
};

const cannotRoles = {
  Contributor1: UserRoles.contributor1,
  ReadOnly: UserRoles.readonly,
};

const allRolesValues = [...Object.values(canRoles), ...Object.values(cannotRoles)];

let event = null as IEventEntity;
let accessTokenL6 = '';
let caseFileCreated = null as ICaseFileEntity;

describe('#TC202# -Add a Case Note L4-L6', { tags: ['@case-file'] }, () => {
  before(() => {
    cy.getToken().then(async (tokenResponse) => {
      accessTokenL6 = tokenResponse.access_token;
      const result = await createEventAndTeam(accessTokenL6, allRolesValues);
      const { provider, team } = result;
      event = result.event;
      cy.wrap(provider).as('provider');
      cy.wrap(event).as('eventCreated');
      cy.wrap(team).as('teamCreated');
    });
  });

  after(function () {
    if (this.teamCreated?.id && this.provider) {
      removeTeamMembersFromTeam(this.teamCreated.id, this.provider);
    }
  });
  describe('Can Roles', () => {
    for (const [roleName, roleValue] of Object.entries(canRoles)) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.then(async () => {
            const result = await prepareStateHousehold(accessTokenL6, event);
            caseFileCreated = result.registrationResponse.caseFile;
            cy.login(roleValue);
            cy.goTo(`casefile/${caseFileCreated.id}/note`);
          });
        });
        it('should successfully add a case note for L4-L6', function () {
          const caseNotesData = fixtureCaseNotes(this.test.retries.length);

          const caseNotesPage = new CaseNotesPage();
          caseNotesPage.getCreateCaseNoteButton().click();
          caseNotesPage.fill(caseNotesData, roleName);
          caseNotesPage.getCaseNoteButton().click();
          caseNotesPage.getCaseFileUserName().should('eq', getUserName(roleName));
          caseNotesPage.getCaseFileRoleName().should('eq', `(${getUserRoleDescription(roleName)})`);
          caseNotesPage.getCaseNoteSubject().should('eq', `${caseNotesData.subject} ${roleName}`);
          caseNotesPage.getCaseNoteCategory().should('eq', caseNotesData.category.trim());
          caseNotesPage.getCaseNoteDescription().should('eq', `${caseNotesData.description} ${roleName}`);
          caseNotesPage.getCaseFileLastEditBy().should('eq', getUserName(roleName));
          caseNotesPage.getCaseFileLastModifiedDate().should('eq', getToday());
          caseNotesPage.getCaseFileEditButton().should('exist');

          const caseFileDetailsPage = caseNotesPage.goToCaseFileDetailsPage();
          caseFileDetailsPage.waitAndRefreshUntilCaseFileActivityVisibleWithBody('Category:');
          caseFileDetailsPage.getCaseFileActivityTitles().should('string', 'Case note added');
          caseFileDetailsPage.getCaseFileActivityBodies()
            .should('string', `Subject: ${caseNotesData.subject} ${roleName}`)
            .and('string', `Category: ${caseNotesData.category.trim()}`);
          caseFileDetailsPage.getUserName().should('eq', getUserName(roleName));
          caseFileDetailsPage.getRoleName().should('eq', `(${getUserRoleDescription(roleName)})`);
        });
      });
    }
  });
  describe('Cannot roles', () => {
    for (const [roleName, roleValue] of Object.entries(cannotRoles)) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.login(roleValue);
          cy.goTo('casefile');
        });
        it('should not be able to add a case note for L4-L6', () => {
          const caseFileHomePage = new CaseFilesHomePage();
          const caseNotesPage = new CaseNotesPage();

          const caseFileDetailsPage = caseFileHomePage.getFirstAvailableCaseFile(); // re-use already created Case File for canRoles.
          caseFileDetailsPage.goToCaseNotesPage();

          caseNotesPage.getPageTitle().should('be.visible');
          caseNotesPage.getCreateCaseNoteButton().should('not.exist');
        });
      });
    }
  });
});
