import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { getUserId, getUserName, getUserRoleDescription } from '@libs/cypress-lib/helpers/users';
import { TeamType } from '@libs/entities-lib/team';
import { formatDateToMmmDdYyyy } from '@libs/cypress-lib/helpers';
import { format } from 'date-fns';
import { ITaskCombined } from '@libs/entities-lib/task';
import { IProvider } from '@/services/provider';
import { useProvider } from '../../../provider/provider';
import { assignTeamTask, createEventWithAssignableTeam, createHousehold, createTeamTask } from '../../helpers/prepareState';
import { linkEventToTeamForManyRoles, LinkEventToTeamParams, removeTeamMembersFromTeam } from '../../helpers/teams';
import { assertTaskHistorySteps } from './canSteps';
import { TasksHomePage } from '../../../pages/tasks/tasksHome.page';
import { CaseFileDetailsPage } from '../../../pages/casefiles/caseFileDetails.page';

const escalationRole = [
  UserRoles.level6,
];

const assignableRoles = [
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

const canRoles = [
  UserRoles.level6,
  UserRoles.level5,
  UserRoles.level4,
  UserRoles.level3,
  UserRoles.level2,
  UserRoles.level1,
  UserRoles.contributor1,
  UserRoles.contributor2,
  UserRoles.contributor3,
  UserRoles.readonly,
];

const cannotRoles = [
  UserRoles.level0,
];

const { filteredCanRoles, filteredCannotRoles } = getRoles(canRoles, cannotRoles);

let accessTokenL6 = '';

describe(
  '[T29469] TASKS MAIN MENU: Team task can be marked as Completed',
  { tags: ['@team-task', '@tasks'] },
  // eslint-disable-next-line max-lines-per-function
  () => {
  describe('Can Roles', () => {
    for (const roleName of filteredCanRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.getToken().then(async (tokenResponse) => {
            accessTokenL6 = tokenResponse.access_token;
            const { provider, event, team } = await createEventWithAssignableTeam(accessTokenL6, assignableRoles);
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
            let taskId = '';
            cy.getToken(roleName).then(async (tokenResponse) => {
              const provider = useProvider(tokenResponse.access_token);
              const resultTeamTaskCreated = await createTeamTask(provider, caseFileId, escalationTeam.id);
              await assignTeamTask(provider, resultTeamTaskCreated.id, caseFileId, team.id);
              taskId = resultTeamTaskCreated.id;
              await cy.callSearchUntilMeetCondition({
                provider: useProvider(accessTokenL6),
                searchCallBack: (provider: IProvider) => (provider.task.search({
                  filter: { Entity: { Id: { value: taskId, type: 'guid' } } },
                  top: 1,
                })),
                conditionCallBack: (value: ITaskCombined[]) => (value.find((el) => el.metadata.assignedTeamName === team.name)),
              });
              cy.wrap(resultTeamTaskCreated.id).as('teamTaskId');
            });
            cy.then(async () => {
              await provider.task.setWorkingOn(taskId, caseFileId, getUserId(UserRoles.level6));
            });
            cy.login(roleName);
            cy.goTo(`casefile/${caseFileId}/task`);
            cy.wrap(resultCreateHousehold.registrationResponse.caseFile.id).as('caseFileId');
            cy.wrap(provider).as('provider');
            cy.wrap(team).as('assignableTeamCreated');
            cy.wrap(team.name).as('assignableTeamName');
            cy.wrap(escalationTeam).as('escalationTeamCreated');
            cy.wrap(escalationTeam.name).as('escalationTeamName');
          });
        });

        after(function () {
          if (this.provider && this.assignableTeamCreated?.id && this.escalationTeamCreated?.id) {
            removeTeamMembersFromTeam(this.assignableTeamCreated.id, this.provider);
            removeTeamMembersFromTeam(this.escalationTeamCreated.id, this.provider);
          }
        });

        // eslint-disable-next-line max-statements
        it('should be able to complete a team task', function () {
          const tasksHomePage = new TasksHomePage();
          tasksHomePage.getTableTitleElement().contains('Tasks').should('be.visible');
          cy.contains('Refresh').should('be.visible');
          tasksHomePage.getTaskById(this.teamTaskId).should('be.visible');
          tasksHomePage.getCreatedTaskCategory().should('eq', 'EMIS');
          tasksHomePage.getCreatedTaskSubCategory().should('eq', 'File correction');
          tasksHomePage.verifyCreatedTaskAssignedTeamName(this.assignableTeamName);
          tasksHomePage.verifyTaskTableUserWorkingOn(getUserName(UserRoles.level6));
          tasksHomePage.getCreatedTaskDateAdded().should('eq', formatDateToMmmDdYyyy(format(Date.now(), 'PPp')));
          tasksHomePage.getCreatedTaskStatusElement().contains('In progress').should('be.visible');
          tasksHomePage.getTaskActionButtonById(this.teamTaskId).should('be.visible');
          tasksHomePage.goToTaskActionById(this.teamTaskId);
          tasksHomePage.getDialogTitleElement().contains('Task action').should('be.visible');
          tasksHomePage.getDialogTeamTaskInfoElement().contains('EMIS').should('be.visible');
          tasksHomePage.getDialogTeamTaskInfoElement().contains(getUserName(roleName)).should('be.visible');
          tasksHomePage.getDialogTeamTaskInfoElement().contains(getUserRoleDescription(roleName)).should('be.visible');
          tasksHomePage.getDialogTeamTaskSubCategoryElement().contains('File correction').should('be.visible');
          tasksHomePage.getDialogTeamTaskDescriptionElement().contains('Test Team Task Description').should('be.visible');
          tasksHomePage.getDialogAssignCheckbox().should('not.be.checked');
          tasksHomePage.getDialogActionCompletedCheckbox().should('not.be.checked');
          tasksHomePage.getDialogTaskCompletedCheckbox().should('not.be.checked');
          tasksHomePage.getDialogRationaleInput().should('be.visible');
          tasksHomePage.getDialogCancelButton().should('be.visible');
          tasksHomePage.getDialogApplyButton().should('be.visible');

          tasksHomePage.getDialogTaskCompletedCheckbox().check({ force: true });
          tasksHomePage.enterRationale('Test team task assigning');
          tasksHomePage.getDialogApplyButton().click();
          tasksHomePage.getDialogApplyButton().should('not.exist');
          tasksHomePage.getCreatedTaskUserWorkingOn().should('eq', '-');
          tasksHomePage.getCreatedTaskStatusElement().contains('Completed').should('be.visible');
          tasksHomePage.getTaskActionButtonById(this.teamTaskId).should('be.visible');
          if (roleName === UserRoles.level6) {
            tasksHomePage.getEditTeamTaskButtonById(this.teamTaskId).should('be.visible');
          } else {
            tasksHomePage.getEditTeamTaskButtonById(this.teamTaskId).should('not.exist');
          }
          const teamTaskDetailsPage = tasksHomePage.goToTeamTaskById(this.teamTaskId);
          teamTaskDetailsPage.getTeamTaskTeamAssignedTo().should('eq', this.assignableTeamName);
          teamTaskDetailsPage.getTeamTaskStatusElement().contains('Completed').should('be.visible');
          teamTaskDetailsPage.getHistoryButton().should('be.visible');
          const tasksHistoryPage = teamTaskDetailsPage.goToTaskHistory();
          if (roleName === UserRoles.level6) {
            assertTaskHistorySteps({
              roleName,
              actionTaken: `${getUserName(roleName)} completed Team Task`,
              rationale: 'Test team task assigning',
              index: 3,
            });
          } else {
            assertTaskHistorySteps({
              roleName,
              actionTaken: `${getUserName(roleName)} from ${this.assignableTeamName} completed Team Task`,
              rationale: 'Test team task assigning',
              index: 3,
            });
          }
          tasksHistoryPage.getCloseButton().click();
          cy.goTo(`casefile/${this.caseFileId}`);
          const caseFileDetailsPage = new CaseFileDetailsPage();
          caseFileDetailsPage.waitAndRefreshUntilCaseFileActivityVisibleWithBody('EMIS has been completed');
          caseFileDetailsPage.getUserName().should('eq', getUserName(roleName));
          caseFileDetailsPage.getRoleName().should('string', `${getUserRoleDescription(roleName)}`);
          caseFileDetailsPage.getCaseFileActivityLogDate().should('string', formatDateToMmmDdYyyy(format(Date.now(), 'PPp')));
          caseFileDetailsPage.getCaseFileActivityTitles().should('string', 'Task completed');
          caseFileDetailsPage.getCaseFileActivityBodies().should('string', 'EMIS has been completed');
        });
      });
    }
  });
  describe('Cannot Roles', () => {
    before(() => {
      cy.getToken().then(async (tokenResponse) => {
        accessTokenL6 = tokenResponse.access_token;
        const { provider, event, team } = await createEventWithAssignableTeam(accessTokenL6, assignableRoles);
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

        cy.getToken().then(async (tokenResponse) => {
          const provider = useProvider(tokenResponse.access_token);
          const resultTeamTaskCreated = await createTeamTask(provider, caseFileId, escalationTeam.id);
          await assignTeamTask(provider, resultTeamTaskCreated.id, caseFileId, team.id);
          await cy.callSearchUntilMeetCondition({
            provider: useProvider(accessTokenL6),
            searchCallBack: (provider: IProvider) => (provider.task.search({
              filter: { Entity: { Id: { value: resultTeamTaskCreated.id, type: 'guid' } } },
              top: 1,
            })),
            conditionCallBack: (value: ITaskCombined[]) => (value.find((el) => el.metadata.assignedTeamName === team.name)),
          });
          cy.wrap(resultTeamTaskCreated.id).as('teamTaskId');
        });
        cy.wrap(provider).as('provider');
        cy.wrap(team).as('assignableTeamCreated');
        cy.wrap(team.name).as('assignableTeamName');
        cy.wrap(escalationTeam).as('escalationTeamCreated');
        cy.wrap(caseFileId).as('caseFileId');
      });
    });

    after(function () {
      if (this.provider && this.assignableTeamCreated?.id && this.escalationTeamCreated?.id) {
        removeTeamMembersFromTeam(this.assignableTeamCreated.id, this.provider);
        removeTeamMembersFromTeam(this.escalationTeamCreated.id, this.provider);
      }
    });

    for (const roleName of filteredCannotRoles) {
      describe(`${roleName}`, () => {
        beforeEach(function () {
          cy.login(roleName);
          cy.goTo(`casefile/${this.caseFileId}/task`);
        });
        it('should not be able to complete any team tasks', function () {
          const tasksHomePage = new TasksHomePage();
          tasksHomePage.getTableTitleElement().contains('Tasks').should('be.visible');
          cy.contains('Refresh').should('be.visible');
          tasksHomePage.getTaskById(this.teamTaskId).should('be.visible');
          tasksHomePage.getCreatedTaskCategory().should('eq', 'EMIS');
          tasksHomePage.getCreatedTaskSubCategory().should('eq', 'File correction');
          tasksHomePage.verifyCreatedTaskAssignedTeamName(this.assignableTeamName);
          tasksHomePage.getCreatedTaskUserWorkingOn().should('eq', 'N/A');
          tasksHomePage.getCreatedTaskDateAdded().should('eq', formatDateToMmmDdYyyy(format(Date.now(), 'PPp')));
          tasksHomePage.getCreatedTaskStatusElement().contains('In progress').should('be.visible');
          tasksHomePage.getTaskActionButtonById(this.teamTaskId).should('not.exist');
        });
      });
    }
  });
},
);
