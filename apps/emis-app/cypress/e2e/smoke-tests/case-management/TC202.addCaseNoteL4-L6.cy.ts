import { UserRoles } from '@libs/cypress-lib/support/msal';
import { IEventEntity } from '@libs/entities-lib/event';
import { getUserNameBis, getUserRoleDescriptionBis } from '@libs/cypress-lib/helpers/users';
import { ICaseFileEntity } from '@libs/entities-lib/case-file';
import { getToday } from '@libs/cypress-lib/helpers';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { fixtureCaseNotes } from '../../../fixtures/case-management';
import { createEventAndTeam, prepareStateHousehold } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { CaseNotesPage } from '../../../pages/casefiles/caseNotes.page';
import { CaseFilesHomePage } from '../../../pages/casefiles/caseFilesHome.page';

const canRoles = [
  UserRoles.level6,
  UserRoles.level5,
  UserRoles.level4,
];

const cannotRoles = [
  UserRoles.contributor1,
  UserRoles.readonly,
];

const { filteredCanRoles, filteredCannotRoles, allRoles } = getRoles(canRoles, cannotRoles);

let event = null as IEventEntity;
let accessTokenL6 = '';
let caseFileCreated = null as ICaseFileEntity;

describe('#TC202# - Add a Case Note L4-L6', { tags: ['@case-file'] }, () => {
  before(() => {
    cy.getToken().then(async (tokenResponse) => {
      accessTokenL6 = tokenResponse.access_token;
      const result = await createEventAndTeam(accessTokenL6, allRoles);
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
    for (const roleValue of filteredCanRoles) {
      describe(`${roleValue}`, () => {
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
          caseNotesPage.fill(caseNotesData, roleValue);
          caseNotesPage.getCaseNoteButton().click();
          caseNotesPage.getCaseFileUserName().should('eq', getUserNameBis(roleValue));
          caseNotesPage.getCaseFileRoleName().should('eq', `(${getUserRoleDescriptionBis(roleValue)})`);
          caseNotesPage.getCaseNoteSubject().should('eq', `${caseNotesData.subject} ${roleValue}`);
          caseNotesPage.getCaseNoteCategory().should('eq', caseNotesData.category.trim());
          caseNotesPage.getCaseNoteDescription().should('eq', `${caseNotesData.description} ${roleValue}`);
          caseNotesPage.getCaseFileLastEditBy().should('eq', getUserNameBis(roleValue));
          caseNotesPage.getCaseFileLastModifiedDate().should('eq', getToday());
          caseNotesPage.getCaseFileEditButton().should('exist');

          const caseFileDetailsPage = caseNotesPage.goToCaseFileDetailsPage();
          caseFileDetailsPage.waitAndRefreshUntilCaseFileActivityVisibleWithBody('Category:');
          caseFileDetailsPage.getCaseFileActivityTitles().should('string', 'Case note added');
          caseFileDetailsPage.getCaseFileActivityBodies()
            .should('string', `Subject: ${caseNotesData.subject} ${roleValue}`)
            .and('string', `Category: ${caseNotesData.category.trim()}`);
          caseFileDetailsPage.getUserName().should('eq', getUserNameBis(roleValue));
          caseFileDetailsPage.getRoleName().should('eq', `(${getUserRoleDescriptionBis(roleValue)})`);
        });
      });
    }
  });
  describe('Cannot roles', () => {
    for (const roleValue of filteredCannotRoles) {
      describe(`${roleValue}`, () => {
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
