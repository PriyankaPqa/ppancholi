import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { getUserName } from '@libs/cypress-lib/helpers/users';
import { useProvider } from '../../../provider/provider';
import { createEventAndTeam, createHousehold, createPersonalTask } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { assertTaskHistorySteps, assertTaskHomeAndGoToEditTaskSteps, editPersonalTaskSteps, personalTaskDetailsSteps } from './canSteps';
import { PersonalTaskDetailsPage } from '../../../pages/tasks/personalTaskDetails.page';

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

describe('[T29792] Completed Personal task can be edited by the person who created it', { tags: ['@teams', '@tasks'] }, () => {
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
              provider.task.completeTask(resultPersonalTaskCreated.id, caseFileId, 'complete personal task using endpoint');
              cy.wrap(provider).as('provider');
              cy.wrap(team).as('teamCreated');
              cy.wrap(resultPersonalTaskCreated).as('personalTask');
              cy.login(roleName);
              cy.goTo(`casefile/${resultCreateHousehold.registrationResponse.caseFile.id}/task`);
            });
          });
        });

        afterEach(function () {
          if (this.provider && this.teamCreated?.id) {
            removeTeamMembersFromTeam(this.teamCreated.id, this.provider);
          }
        });
        // eslint-disable-next-line
        it('should be able to edit a completed a personal task by the person who created it', function () {
          assertTaskHomeAndGoToEditTaskSteps(this.personalTask.id);

          editPersonalTaskSteps('Updated Task Category attempt1', 'Updated task description attempt1');

          personalTaskDetailsSteps('Updated Task Category attempt1', 'Updated task description attempt1', true);

          const personalTaskDetailsPage = new PersonalTaskDetailsPage();
          const tasksHistoryPage = personalTaskDetailsPage.goToTaskHistory();

          assertTaskHistorySteps({
            roleName,
            actionTaken: `${getUserName(roleName)} updated task details`,
            index: 2,
          });

          tasksHistoryPage.getCloseButton().click();

          personalTaskDetailsPage.getBackToTasksButton().should('be.visible');
          personalTaskDetailsPage.getBackToTasksButton().click();

          assertTaskHomeAndGoToEditTaskSteps(this.personalTask.id);

          editPersonalTaskSteps('Updated Task Category attempt2', 'Updated task description attempt2');

          personalTaskDetailsSteps('Updated Task Category attempt2', 'Updated task description attempt2', true);

          personalTaskDetailsPage.goToTaskHistory();
          assertTaskHistorySteps({
            roleName,
            actionTaken: `${getUserName(roleName)} updated task details`,
            index: 3,
          });
          tasksHistoryPage.getCloseButton().click();
        });
      });
    }
  });
});
