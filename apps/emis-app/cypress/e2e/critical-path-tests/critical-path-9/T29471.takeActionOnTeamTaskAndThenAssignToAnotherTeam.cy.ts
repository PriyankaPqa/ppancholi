import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { TeamType } from '@libs/entities-lib/team';
import { getUserName, getUserRoleDescription } from '@libs/cypress-lib/helpers/users';
import { IProvider } from '@/services/provider';
import { ActionTaken } from '@libs/entities-lib/task';
import { useProvider } from '../../../provider/provider';
import {
  createEventWithAssignableTeam,
  createHousehold,
  createTeamTask,
  setTeamTaskAction,
  SetTeamTaskActionParams,
} from '../../helpers/prepareState';
import {
  linkEventToTeamForManyRoles,
  linkEventToTeamForOneRole,
  LinkEventToTeamParams,
  removeTeamMembersFromTeam,
} from '../../helpers/teams';
import { TasksHomePage } from '../../../pages/tasks/tasksHome.page';
import { assertTaskHistorySteps } from './canSteps';

const escalationRole = [
  UserRoles.level6,
];

const assignableRolesTeam1 = [
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

const assignableRolesTeam2 = [
  UserRoles.level6,
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

// eslint-disable-next-line
describe('[T29471] Take action on team task and then assign to another team', { tags: ['@teams', '@tasks'] }, () => {
  describe('Can Roles', () => {
    for (const roleName of filteredCanRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.getToken().then(async (tokenResponse) => {
            accessTokenL6 = tokenResponse.access_token;
            const { provider, event, team } = await createEventWithAssignableTeam(accessTokenL6, assignableRolesTeam1);
            const assignableTeam2ParamData: LinkEventToTeamParams = {
              event,
              provider,
              teamType: TeamType.Standard,
              roles: assignableRolesTeam2,
              isAssignable: true,
              isEscalation: false,
            };
            const assignableTeam2 = await linkEventToTeamForOneRole(assignableTeam2ParamData);
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
              const resultTeamTaskCreated = await createTeamTask(provider, caseFileId, team.id);
              cy.wrap(resultTeamTaskCreated.id).as('teamTaskId');
              cy.callSearchUntilMeetCondition({
                provider: useProvider(accessTokenL6),
                searchCallBack: (provider: IProvider) => (provider.teams.search({
                  filter: { Entity: { Events: { any: { Id: { value: event.id, type: 'guid' } } }, isEscalation: true } },
                })),
                conditionCallBack: (value: []) => value.length > 0,
              }).then(() => {
                cy.getToken().then(async (tokenResponse) => {
                  const provider = useProvider(tokenResponse.access_token);
                  const assignTeamData: SetTeamTaskActionParams = {
                    provider,
                    caseFileId,
                    teamId: team.id,
                    actionTaken: ActionTaken.Assign,
                    taskId: resultTeamTaskCreated.id,
                  };
                  await setTeamTaskAction(assignTeamData);
                });
              });
            });
            cy.login(roleName);
            cy.goTo(`casefile/${caseFileId}/task`);
            cy.wrap(provider).as('provider');
            cy.wrap(team).as('assignableTeam1Created');
            cy.wrap(assignableTeam2.name).as('assignableTeam2Created');
            cy.wrap(team.name).as('assignableTeam1Name');
            cy.wrap(assignableTeam2.name).as('assignableTeam2Name');
            cy.wrap(escalationTeam).as('escalationTeamCreated');
          });
        });

        after(function () {
          if (this.provider && this.assignableTeam1Created?.id && this.assignableTeam2Created?.id && this.escalationTeamCreated?.id) {
            removeTeamMembersFromTeam(this.assignableTeam1Created.id, this.provider);
            removeTeamMembersFromTeam(this.assignableTeam2Created.id, this.provider);
            removeTeamMembersFromTeam(this.escalationTeamCreated.id, this.provider);
          }
        });

        // eslint-disable-next-line
        it('should be able to take action on team task and assign it to a different team', function () {
          const tasksHomePage = new TasksHomePage();
          tasksHomePage.getTableTitleElement().contains('Tasks').should('be.visible');
          cy.contains('Refresh').should('be.visible');
          tasksHomePage.getTaskById(this.teamTaskId).should('be.visible');
          tasksHomePage.getEditTeamTaskButtonById(this.teamTaskId).should('be.visible');

          const editTeamTaskPage = tasksHomePage.goToEditTeamTaskPageById(this.teamTaskId);
          editTeamTaskPage.getPageTitleElement().contains('Edit team task').should('be.visible');
          editTeamTaskPage.getTaskCategoryElement().should('be.visible');
          editTeamTaskPage.getTaskSubCategoryElement().should('be.visible');
          editTeamTaskPage.editTaskDescription('Edited team task Description');

          const teamTaskDetailsPage = editTeamTaskPage.saveEditedTeamTask();
          cy.contains('The task has been successfully edited.').should('be.visible');
          teamTaskDetailsPage.getPageTitleElement().contains('Team task details').should('be.visible');
          cy.contains('EMIS').should('be.visible');
          teamTaskDetailsPage.getTeamTaskSubCategoryElement().contains('File correction').should('be.visible');
          teamTaskDetailsPage.getTeamTaskDescriptionElement().contains('Edited team task Description').should('be.visible');
          teamTaskDetailsPage.getBackToTasksButton().click();

          tasksHomePage.getTaskById(this.teamTaskId).should('be.visible');
          tasksHomePage.getTaskActionButtonById(this.teamTaskId).should('be.visible');
          tasksHomePage.getEditTeamTaskButtonById(this.teamTaskId).should('be.visible');
          tasksHomePage.goToTaskActionById(this.teamTaskId);
          tasksHomePage.getDialogTitleElement().contains('Task action').should('be.visible');
          tasksHomePage.getDialogTeamTaskInfoElement().contains('EMIS').should('be.visible');
          tasksHomePage.getDialogTeamTaskInfoElement().contains(getUserName(roleName)).should('be.visible');
          tasksHomePage.getDialogTeamTaskInfoElement().contains(getUserRoleDescription(roleName)).should('be.visible');
          tasksHomePage.getDialogTeamTaskSubCategoryElement().contains('File correction').should('be.visible');
          tasksHomePage.getDialogTeamTaskDescriptionElement().contains('Edited team task Description').should('be.visible');
          tasksHomePage.getDialogAssignCheckbox().should('not.be.checked');
          tasksHomePage.getDialogActionCompletedCheckbox().should('not.be.checked');
          tasksHomePage.getDialogTaskCompletedCheckbox().should('not.be.checked');
          tasksHomePage.getDialogRationaleInput().should('be.visible');
          tasksHomePage.getDialogCancelButton().should('be.visible');
          tasksHomePage.getDialogApplyButton().should('be.visible');
          tasksHomePage.getDialogActionCompletedCheckbox().check({ force: true });
          tasksHomePage.getDialogSelectTeamToAssignElement().should('be.visible');
          tasksHomePage.getTeamFromSelectTeamToAssignDropdown(this.assignableTeam1Name).should('not.exist');
          tasksHomePage.selectTeamToAssign(this.assignableTeam2Name);
          tasksHomePage.enterRationale('Test team action completed');
          tasksHomePage.getDialogApplyButton().click();
          tasksHomePage.getDialogApplyButton().should('not.exist');
          tasksHomePage.getCreatedTaskStatusElement().contains('In progress').should('be.visible');
          tasksHomePage.getEditTeamTaskButtonById(this.teamTaskId).should('be.visible');
          if (roleName === UserRoles.level6) {
            tasksHomePage.getTaskActionButtonById(this.teamTaskId).should('be.visible');
          } else {
            tasksHomePage.getTaskActionButtonById(this.teamTaskId).should('not.exist');
          }
          tasksHomePage.goToTeamTaskById(this.teamTaskId);

          teamTaskDetailsPage.getPageTitleElement().contains('Team task details').should('be.visible');
          teamTaskDetailsPage.getTeamTaskTeamAssignedTo().should('eq', this.assignableTeam2Name);
          teamTaskDetailsPage.getTeamTaskActionWorkingOnItElement().contains('N/A').should('be.visible');
          teamTaskDetailsPage.getHistoryButton().should('be.visible');
          if (roleName === UserRoles.level6) {
            teamTaskDetailsPage.getTeamTaskActionButton().should('be.visible');
          } else {
            teamTaskDetailsPage.getTeamTaskActionButton().should('be.disabled');
          }
          teamTaskDetailsPage.goToTaskHistory();

          assertTaskHistorySteps({
            roleName,
            rationale: 'Test team action completed',
            actionTaken: `${this.assignableTeam1Name} action completed and assigned to ${this.assignableTeam2Name}`,
            index: 3,
          });
        });
      });
    }
  });
  describe('Cannot Roles', () => {
    for (const roleName of filteredCannotRoles) {
      describe(`${roleName}`, () => {
        before(() => {
          cy.getToken().then(async (tokenResponse) => {
            accessTokenL6 = tokenResponse.access_token;
            const { provider, event, team } = await createEventWithAssignableTeam(accessTokenL6, assignableRolesTeam1);
            const assignableTeam2ParamData: LinkEventToTeamParams = {
              event,
              provider,
              teamType: TeamType.Standard,
              roles: assignableRolesTeam2,
              isAssignable: true,
              isEscalation: false,
            };
            const assignableTeam2 = await linkEventToTeamForOneRole(assignableTeam2ParamData);
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
              const resultTeamTaskCreated = await createTeamTask(provider, caseFileId, team.id);
              cy.wrap(resultTeamTaskCreated.id).as('teamTaskId');
              cy.callSearchUntilMeetCondition({
                provider: useProvider(accessTokenL6),
                searchCallBack: (provider: IProvider) => (provider.teams.search({
                  filter: { Entity: { Events: { any: { Id: { value: event.id, type: 'guid' } } }, isEscalation: true } },
                })),
                conditionCallBack: (value: []) => value.length > 0,
              }).then(() => {
                cy.getToken().then(async (tokenResponse) => {
                  const provider = useProvider(tokenResponse.access_token);
                  const assignTeamData: SetTeamTaskActionParams = {
                    provider,
                    caseFileId,
                    teamId: team.id,
                    actionTaken: ActionTaken.Assign,
                    taskId: resultTeamTaskCreated.id,
                  };
                  await setTeamTaskAction(assignTeamData);
                });
              });
            });
            cy.login(roleName);
            cy.goTo(`casefile/${caseFileId}/task`);
            cy.wrap(provider).as('provider');
            cy.wrap(team).as('assignableTeam1Created');
            cy.wrap(assignableTeam2.name).as('assignableTeam2Created');
            cy.wrap(escalationTeam).as('escalationTeamCreated');
          });
        });

        after(function () {
          if (this.provider && this.assignableTeam1Created?.id && this.assignableTeam2Created?.id && this.escalationTeamCreated?.id) {
            removeTeamMembersFromTeam(this.assignableTeam1Created.id, this.provider);
            removeTeamMembersFromTeam(this.assignableTeam2Created.id, this.provider);
            removeTeamMembersFromTeam(this.escalationTeamCreated.id, this.provider);
          }
        });
        it('should not be able to take action on team task', function () {
          const tasksHomePage = new TasksHomePage();
          tasksHomePage.getTableTitleElement().contains('Tasks').should('be.visible');
          cy.contains('Refresh').should('be.visible');
          tasksHomePage.getTaskById(this.teamTaskId).should('be.visible');
          tasksHomePage.getTaskActionButtonById(this.teamTaskId).should('not.exist');
        });
      });
    }
  });
});
