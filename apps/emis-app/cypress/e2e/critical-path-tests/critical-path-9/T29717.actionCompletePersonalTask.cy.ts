import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { useProvider } from '../../../provider/provider';
import { createEventAndTeam, createHousehold, createPersonalTask } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { PersonalTaskDetailsPage } from '../../../pages/tasks/personalTaskDetails.page';
import { assertTaskHistorySteps, personalTaskDetailsSteps } from './canSteps';

const canRoles = [
  UserRoles.level6,
  UserRoles.level5,
  UserRoles.level4,
  UserRoles.level3,
  UserRoles.level2,
  UserRoles.level1,
  UserRoles.level0,
  UserRoles.contributor1,
  UserRoles.contributor2,
  UserRoles.contributor3,
  UserRoles.readonly,
];

const { filteredCanRoles, allRoles } = getRoles(canRoles, []);

let accessTokenL6 = '';

describe('[T29717] Action Complete a Personal Task', { tags: ['@teams', '@tasks'] }, () => {
  describe('Can Roles', () => {
    for (const roleName of filteredCanRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.getToken().then(async (tokenResponse) => {
            accessTokenL6 = tokenResponse.access_token;
            const { provider, event, team } = await createEventAndTeam(accessTokenL6, allRoles);
            const resultCreateHousehold = await createHousehold(provider, event);
            const caseFileId = resultCreateHousehold.registrationResponse.caseFile.id;
            cy.getToken(roleName).then(async (tokenResponse) => {
              const provider = useProvider(tokenResponse.access_token);
              const resultPersonalTaskCreated = await createPersonalTask(provider, caseFileId);
              cy.wrap(provider).as('provider');
              cy.wrap(team).as('teamCreated');
              cy.wrap(resultPersonalTaskCreated).as('personalTask');
              cy.login(roleName);
              cy.goTo(`casefile/${resultCreateHousehold.registrationResponse.caseFile.id}/task/${resultPersonalTaskCreated.id}`);
            });
          });
        });

        afterEach(function () {
          if (this.provider && this.teamCreated?.id) {
            removeTeamMembersFromTeam(this.teamCreated.id, this.provider);
          }
        });
        // eslint-disable-next-line
        it('should be able to complete a personal task', function () {
          personalTaskDetailsSteps(this.personalTask.category.specifiedOther, this.personalTask.description);

          const personalTaskDetailsPage = new PersonalTaskDetailsPage();
          personalTaskDetailsPage.getPersonalTaskActionButton().click();
          personalTaskDetailsPage.getDialogTitleElement().contains('Task action').should('be.visible');
          personalTaskDetailsPage.getCompletedButton().should('not.be.checked');
          personalTaskDetailsPage.getCancelButton().should('not.be.checked');
          personalTaskDetailsPage.getRationaleDescription().should('be.visible');
          personalTaskDetailsPage.getCompletedButton().check({ force: true });
          personalTaskDetailsPage.getRationaleDescription().type('Test Rationale');
          personalTaskDetailsPage.getDialogApplyButton().click();

          personalTaskDetailsPage.getPersonalTaskStatus().contains('Completed').should('be.visible');
          personalTaskDetailsPage.getPersonalTaskDueDate().should('eq', '-');
          personalTaskDetailsPage.getEditButton().should('be.visible');
          personalTaskDetailsPage.getPersonalTaskActionButton().should('not.exist');
          personalTaskDetailsPage.getHistoryButton().should('be.visible');

          const tasksHistoryPage = personalTaskDetailsPage.goToTaskHistory();
          assertTaskHistorySteps({
            roleName,
            rationale: 'Test Rationale',
            actionTaken: 'Task completed',
            index: 1,
          });
          tasksHistoryPage.getCloseButton().click();
          tasksHistoryPage.getCloseButton().should('not.exist');

          personalTaskDetailsPage.getPageTitleElement().contains('Personal task details').should('be.visible');
        });
      });
    }
  });
});
