import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { formatDateToMmmDdYyyy } from '@libs/cypress-lib/helpers';
import { getUserName, getUserRoleDescription } from '@libs/cypress-lib/helpers/users';
import { format } from 'date-fns';
import { createEventAndTeam, prepareStateHousehold } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { createTestXlsxFile } from '../../../fixtures/event-document';
import { DocumentHomePage } from '../../../pages/documents/documentHome.page';

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
const fileName = 'eventDocumentTestFile';
const filePath = `cypress/downloads/${fileName}.xlsx`;

describe('[T28260] Add a Document to a Case File', { tags: ['@case-file'] }, () => {
  before(() => {
    cy.getToken().then(async (tokenResponse) => {
      accessTokenL6 = tokenResponse.access_token;
      const resultCreatedEvent = await createEventAndTeam(accessTokenL6, allRoles);
      cy.wrap(resultCreatedEvent.provider).as('provider');
      cy.wrap(resultCreatedEvent.event).as('event');
      cy.wrap(resultCreatedEvent.team).as('teamCreated');
    });
    createTestXlsxFile(fileName);
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
            cy.goTo(`casefile/${resultCreateHousehold.registrationResponse.caseFile.id}/documents`);
          });
        });
        it('should be able to add document to a case file', () => {
          const documentHomePage = new DocumentHomePage();

          const addDocumentPage = documentHomePage.addDocument();
          addDocumentPage.uploadFile().selectFile(filePath, { force: true });
          addDocumentPage.chooseDocumentCategory('Assessment');
          addDocumentPage.addDocumentNotes('Test Document');
          addDocumentPage.getAddButton().click();
          addDocumentPage.getDialogTitleElement().contains('Confirm adding document').should('be.visible');
          addDocumentPage.getDialogMessage()
            .should('string', 'Once added a document cannot be deleted,')
            .and('string', 'Are you sure you want to add this document?');
          addDocumentPage.getDialogSubmitButton().should('be.visible');
          addDocumentPage.getDialogCancelButton().should('be.visible');

          const documentDetailsPage = addDocumentPage.confirmDialogSubmit();
          cy.contains('The document has been successfully created.').should('be.visible');
          documentDetailsPage.getPageTitle().contains('Document details').should('be.visible');
          documentDetailsPage.getIconText().should('eq', 'Current');

          if (roleName === UserRoles.contributor3) {
            documentDetailsPage.getEditDocumentButton().should('not.exist');
          } else {
            documentDetailsPage.getEditDocumentButton().should('be.visible');
          }

          if (roleName === UserRoles.level6) {
            documentDetailsPage.getDeleteDocumentButton().should('be.visible');
          }

          documentDetailsPage.getFileName().should('eq', `${fileName}.xlsx`);
          documentDetailsPage.getOpenDocumentLink().should('be.visible');
          documentDetailsPage.getDownloadDocumentLink().should('be.visible');
          documentDetailsPage.getDocumentCategory().should('string', 'Assessment');
          documentDetailsPage.getDocumentAddedDate().should('string', formatDateToMmmDdYyyy(format(Date.now(), 'PPp')));
          documentDetailsPage.getDocumentNotes().should('string', 'Test Document');
          documentDetailsPage.getBackToDocumentsButton().should('be.visible');

          const caseFileDetailsPage = documentDetailsPage.goToCaseFileDetailsPage();
          caseFileDetailsPage.waitAndRefreshUntilCaseFileActivityVisibleWithBody('Document name');
          caseFileDetailsPage.getUserName().should('eq', getUserName(roleName));
          caseFileDetailsPage.getRoleName().should('eq', `(${getUserRoleDescription(roleName)})`);
          caseFileDetailsPage.getCaseFileActivityTitle().should('string', 'Added document');
          caseFileDetailsPage.getCaseFileActivityBody().should('string', 'Document name:')
            .and('string', `${fileName}.xlsx`);
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
          cy.goTo(`casefile/${this.caseFileId}/documents`);
        });
        it('should not be able to add document to a case file', () => {
          if (roleName === UserRoles.level0) {
            cy.contains('You do not have permission to access this page').should('be.visible');
          } else {
            const documentHomePage = new DocumentHomePage();
            documentHomePage.getPageTitle().contains('Documents').should('be.visible');
            documentHomePage.addDocumentButton().should('not.exist');
          }
        });
      });
    }
  });
});
