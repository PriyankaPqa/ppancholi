import { UserRoles } from '@libs/cypress-lib/support/msal';
import { IEventEntity } from '@libs/entities-lib/event';
import { mockCreateHouseholdRequest } from '@libs/cypress-lib/mocks/household/household';
import { getUserName, getUserRoleDescription } from '@libs/cypress-lib/helpers/users';
import { format } from 'date-fns';
import { fixtureCaseNotes } from '../../../fixtures/case-management';
import { useProvider } from '../../../provider/provider';
import { createEventWithTeamWithUsers } from '../../helpers/prepareState';
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

const prepareState = async (accessToken: string, event: IEventEntity) => {
  const provider = useProvider(accessToken);
  const mockCreateHousehold = mockCreateHouseholdRequest({ eventId: event.id });
  cy.wrap(mockCreateHousehold).as('household');
  const caseFileCreated = await provider.households.postCrcRegistration(mockCreateHousehold);
  cy.wrap(caseFileCreated.caseFile.id).as('householdId');
};

const prepareEventwithTeamWithUsers = async (accessToken: string) => {
  const provider = useProvider(accessToken);
  const result = await createEventWithTeamWithUsers(provider, allRolesValues);
  event = result.event;
  const { team } = result;
  cy.wrap(event).as('eventCreated');
  cy.wrap(team).as('teamCreated');
  cy.wrap(provider).as('provider');
};

const title = '#TC202# -Add a Case Note L4-L6';
describe(`${title}`, () => {
  before(() => {
    cy.getToken().then(async (tokenResponse) => {
      accessTokenL6 = tokenResponse.access_token;
      await prepareEventwithTeamWithUsers(accessTokenL6);
    });
  });

  after(function () {
    if (this.teamCreated?.id && this.provider) {
      removeTeamMembersFromTeam(this.teamCreated.id, this.provider, allRolesValues);
    }
  });
  describe('Can Roles', () => {
    for (const [roleName, roleValue] of Object.entries(canRoles)) {
      describe(`${roleName}`, () => {
        beforeEach(async () => {
          await prepareState(accessTokenL6, event);
          cy.login(roleValue);
          // eslint-disable-next-line
          cy.get('@householdId').then((householdId) => {                    
            cy.goTo(`casefile/${householdId}/note`);
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
          caseNotesPage.getCaseFileCreated().should('eq', format(Date.now(), 'yyyy-MM-dd'));
          caseNotesPage.getCaseNoteSubject().should('eq', `${caseNotesData.subject} ${roleName}`);
          caseNotesPage.getCaseNoteCategory().should('eq', caseNotesData.category.trim());
          caseNotesPage.getCaseNoteDescription().should('eq', `${caseNotesData.description} ${roleName}`);
          caseNotesPage.getCaseFileLastEditBy().should('eq', getUserName(roleName));
          caseNotesPage.getCaseFileLastModifiedDate().should('eq', format(Date.now(), 'yyyy-MM-dd'));
          caseNotesPage.getCaseFileEditButton().should('exist');

          const caseFileDetailsPage = caseNotesPage.goToCaseFileDetailsPage();
          caseFileDetailsPage.getCaseFileActivityTitles().should('string', 'Case note added');
          caseFileDetailsPage.getCaseFileActivityBodies()
            .should('string', `Subject: ${caseNotesData.subject} ${roleName}`)
            .and('string', `Category: ${caseNotesData.category.trim()}`);
          caseFileDetailsPage.getUserName().should('eq', getUserName(roleName));
          caseFileDetailsPage.getRoleName().should('eq', `(${getUserRoleDescription(roleName)})`);
          caseFileDetailsPage.getCaseFileActivityLogDate().should('eq', format(Date.now(), 'yyyy-MM-dd'));
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
