import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { TeamType } from '@libs/entities-lib/team';
import { getUserName, getUserRoleDescription } from '@libs/cypress-lib/helpers/users';
import { IProvider } from '@/services/provider';
import { useProvider } from '../../../provider/provider';
import {
  createEventWithAssignableTeam,
  createHousehold,
  createTeamTask,
} from '../../helpers/prepareState';
import {
  linkEventToTeamForManyRoles,
  LinkEventToTeamParams,
  removeTeamMembersFromTeam,
} from '../../helpers/teams';
import { TasksHomePage } from '../../../pages/tasks/tasksHome.page';
import { assertTaskHistorySteps } from './canSteps';

const escalationRole = [
  UserRoles.level6,
];

const assignableRolesTeam = [
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

const { filteredCanRoles } = getRoles(canRoles, []);

let accessTokenL6 = '';

describe('[T29736] A cancelled team task can be re-opened by the person who created the task', { tags: ['@teams', '@tasks'] }, () => {
  describe('Can Roles', () => {
    for (const roleName of filteredCanRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.getToken().then(async (tokenResponse) => {
            accessTokenL6 = tokenResponse.access_token;
            const { provider, event, team } = await createEventWithAssignableTeam(accessTokenL6, assignableRolesTeam);
            const escalationTeamParamData: LinkEventToTeamParams = {
              event,
              provider,
              teamType: TeamType.AdHoc,
              roles: escalationRole,
              isAssignable: true,
              isEscalation: true,
            };
            const escalationTeam = await linkEventToTeamForManyRoles(escalationTeamParamData);

            const resultCreateHousehold = await createHousehold(provider, event);
            const caseFileId = resultCreateHousehold.registrationResponse.caseFile.id;

            cy.getToken(roleName).then(async (tokenResponse) => {
              const provider = useProvider(tokenResponse.access_token);
              const resultTeamTaskCreated = await createTeamTask(provider, caseFileId, escalationTeam.id);
              await cy.callSearchUntilMeetCondition({
                provider: useProvider(accessTokenL6),
                searchCallBack: (provider: IProvider) => (provider.teams.search({
                  filter: { Entity: { Events: { any: { Id: { value: event.id, type: 'guid' } } }, isEscalation: true } },
                })),
                conditionCallBack: (value: []) => value.length > 0,
              });
              cy.then(async () => {
                await provider.task.cancelTask(resultTeamTaskCreated.id, caseFileId, 'rationale cancel task through api');
              });
              cy.login(roleName);
              cy.goTo(`casefile/${caseFileId}/task`);
              cy.wrap(provider).as('provider');
              cy.wrap(team).as('assignableTeamCreated');
              cy.wrap(escalationTeam.name).as('escalationTeamName');
              cy.wrap(escalationTeam).as('escalationTeamCreated');
              cy.wrap(resultTeamTaskCreated.id).as('teamTaskId');
            });
          });
        });

        after(function () {
          if (this.provider && this.assignableTeamCreated?.id && this.escalationTeamCreated?.id) {
            removeTeamMembersFromTeam(this.assignableTeamCreated.id, this.provider);
            removeTeamMembersFromTeam(this.escalationTeamCreated.id, this.provider);
          }
        });

        // eslint-disable-next-line
        it('should be able to re-open cancelled team task by the person who created it', function () {
          const tasksHomePage = new TasksHomePage();
          tasksHomePage.getTableTitleElement().contains('Tasks').should('be.visible');
          cy.contains('Refresh').should('be.visible');
          tasksHomePage.getTaskById(this.teamTaskId).should('be.visible');
          tasksHomePage.getCreatedTaskAssignedToElement().contains(this.escalationTeamName).should('be.visible');
          tasksHomePage.getCreatedTaskUserWorkingOnElement().contains('N/A').should('be.visible');
          tasksHomePage.getCreatedTaskStatusElement().contains('Cancelled').should('be.visible');
          tasksHomePage.getTaskActionButtonById(this.teamTaskId).should('be.visible');
          tasksHomePage.getEditTeamTaskButtonById(this.teamTaskId).should('not.exist');
          tasksHomePage.goToTaskActionById(this.teamTaskId);

          tasksHomePage.getDialogTitleElement().contains('Task action').should('be.visible');
          tasksHomePage.getDialogTeamTaskInfoElement().contains('EMIS').should('be.visible');
          tasksHomePage.getDialogTeamTaskSubCategoryElement().contains('File correction').should('be.visible');
          tasksHomePage.getDialogTeamTaskDescriptionElement().contains('Test Team Task Description').should('be.visible');
          tasksHomePage.getDialogTeamTaskInfoElement().contains(getUserName(roleName)).should('be.visible');
          tasksHomePage.getDialogTeamTaskInfoElement().contains(getUserRoleDescription(roleName)).should('be.visible');
          tasksHomePage.getDialogReOpenCheckbox().should('not.be.checked');
          tasksHomePage.getDialogRationaleInput().should('be.visible');
          tasksHomePage.getDialogCancelButton().should('be.visible');
          tasksHomePage.getDialogApplyButton().should('be.visible');
          tasksHomePage.getDialogReOpenCheckbox().check({ force: true });
          tasksHomePage.enterRationale('Test team task Re-opened');
          tasksHomePage.getDialogSelectTeamToAssignElement().contains(this.escalationTeamName).should('be.visible');
          tasksHomePage.getDialogSelectTeamToAssignElement().should('have.attr', 'disabled').and('contains', 'disabled');

          tasksHomePage.getDialogApplyButton().click();
          tasksHomePage.getDialogApplyButton().should('not.exist');
          tasksHomePage.getTableTitleElement().contains('Tasks').should('be.visible');
          tasksHomePage.getCreatedTaskStatusElement().contains('New').should('be.visible');
          tasksHomePage.getCreatedTaskAssignedToElement().contains(this.escalationTeamName).should('be.visible');
          tasksHomePage.getCreatedTaskUserWorkingOnElement().contains('N/A').should('be.visible');
          tasksHomePage.getTaskActionButtonById(this.teamTaskId).should('be.visible');
          tasksHomePage.getEditTeamTaskButtonById(this.teamTaskId).should('be.visible');

          const teamTaskDetailsPage = tasksHomePage.goToTeamTaskById(this.teamTaskId);
          teamTaskDetailsPage.getPageTitleElement().contains('Team task details').should('be.visible');
          teamTaskDetailsPage.getTeamTaskStatusElement().contains('New').should('be.visible');
          teamTaskDetailsPage.getTeamTaskActionButton().should('be.visible');
          teamTaskDetailsPage.getEditButton().should('be.visible');
          teamTaskDetailsPage.getTeamTaskTeamAssignedTo().should('eq', this.escalationTeamName);
          teamTaskDetailsPage.getTeamTaskActionWorkingOnItElement().contains('N/A').should('be.visible');
          if (roleName === UserRoles.level6) {
            teamTaskDetailsPage.getTeamTaskActionWorkingOnItToggle().should('be.enabled');
          } else {
            teamTaskDetailsPage.getTeamTaskActionWorkingOnItToggle().should('be.disabled');
          }
          teamTaskDetailsPage.getHistoryButton().should('be.visible');
          const taskHistoryPage = teamTaskDetailsPage.goToTaskHistory();

          assertTaskHistorySteps({
            roleName,
            rationale: 'Test team task Re-opened',
            actionTaken: `Task reopened and assigned to ${this.escalationTeamName}`,
            index: 2,
          });
          taskHistoryPage.getCloseButton().click();
          taskHistoryPage.getCloseButton().should('not.exist');
          teamTaskDetailsPage.getPageTitleElement().contains('Team task details').should('be.visible');
        });
      });
    }
  });
});
