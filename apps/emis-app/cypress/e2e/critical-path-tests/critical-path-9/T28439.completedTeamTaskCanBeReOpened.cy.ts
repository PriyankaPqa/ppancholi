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
describe('[T28439] A completed Team task can be re-opened', { tags: ['@teams', '@tasks'] }, () => {
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
            let teamTaskId = '';

            cy.getToken(UserRoles.level1).then(async (tokenResponse) => {
              const provider = useProvider(tokenResponse.access_token);
              const resultTeamTaskCreated = await createTeamTask(provider, caseFileId, escalationTeam.id);
              await cy.callSearchUntilMeetCondition({
                provider: useProvider(accessTokenL6),
                searchCallBack: (provider: IProvider) => (provider.teams.search({
                  filter: { Entity: { Events: { any: { Id: { value: event.id, type: 'guid' } } }, isEscalation: true } },
                })),
                conditionCallBack: (value: []) => value.length > 0,
              });
              teamTaskId = resultTeamTaskCreated.id;
              cy.wrap(teamTaskId).as('teamTaskId');
            });
            cy.getToken(UserRoles.level6).then(async (tokenResponse) => {
              const assignTeamData: SetTeamTaskActionParams = {
                provider: useProvider(tokenResponse.access_token),
                caseFileId,
                teamId: team.id,
                actionTaken: ActionTaken.Assign,
                taskId: teamTaskId,
              };
              await setTeamTaskAction(assignTeamData);
            });
            cy.getToken(UserRoles.level1).then(async (tokenResponse) => {
              const provider = useProvider(tokenResponse.access_token);
              await provider.task.completeTask(teamTaskId, caseFileId, 'complete task');
            });
            cy.login(roleName);
            cy.goTo(`casefile/${caseFileId}/task`);
            cy.wrap(provider).as('provider');
            cy.wrap(team).as('assignableTeamCreated');
            cy.wrap(team.name).as('assignableTeamName');
            cy.wrap(escalationTeam).as('escalationTeamCreated');
          });
        });

        afterEach(function () {
          if (this.provider && this.assignableTeamCreated?.id && this.escalationTeamCreated?.id) {
            removeTeamMembersFromTeam(this.assignableTeamCreated.id, this.provider);
            removeTeamMembersFromTeam(this.escalationTeamCreated.id, this.provider);
          }
        });

        // eslint-disable-next-line
        it('should be able to re-open completed team task', function () {
          const tasksHomePage = new TasksHomePage();
          tasksHomePage.getTableTitleElement().contains('Tasks').should('be.visible');
          cy.contains('Refresh').should('be.visible');
          tasksHomePage.getTaskById(this.teamTaskId).should('be.visible');
          tasksHomePage.getCreatedTaskStatusElement().contains('Completed').should('be.visible');
          tasksHomePage.getTaskActionButtonById(this.teamTaskId).should('be.visible');
          tasksHomePage.getCreatedTaskAssignedToElement().contains(this.assignableTeamName).should('be.visible');
          tasksHomePage.goToTaskActionById(this.teamTaskId);
          tasksHomePage.getDialogTitleElement().contains('Task action').should('be.visible');
          tasksHomePage.getDialogTeamTaskInfoElement().contains('EMIS').should('be.visible');
          tasksHomePage.getDialogTeamTaskInfoElement().contains(getUserName(UserRoles.level1)).should('be.visible');
          tasksHomePage.getDialogTeamTaskInfoElement().contains(getUserRoleDescription(UserRoles.level1)).should('be.visible');
          tasksHomePage.getDialogTeamTaskSubCategoryElement().contains('File correction').should('be.visible');
          tasksHomePage.getDialogTeamTaskDescriptionElement().contains('Test Team Task Description').should('be.visible');
          tasksHomePage.getDialogReOpenCheckbox().should('not.be.checked');
          tasksHomePage.getDialogRationaleInput().should('be.visible');
          tasksHomePage.getDialogCancelButton().should('be.visible');
          tasksHomePage.getDialogApplyButton().should('be.visible');
          tasksHomePage.getDialogReOpenCheckbox().check({ force: true });
          tasksHomePage.getDialogSelectTeamToAssignElement().should('be.visible');
          tasksHomePage.selectTeamToAssign(this.assignableTeamName);
          tasksHomePage.enterRationale('Test team task re-open');
          tasksHomePage.getDialogApplyButton().click();
          tasksHomePage.getDialogApplyButton().should('not.exist');
          tasksHomePage.getCreatedTaskStatusElement().contains('In progress').should('be.visible'); tasksHomePage.getTaskActionButtonById(this.teamTaskId).should('be.visible');
          tasksHomePage.getTaskActionButtonById(this.teamTaskId).should('be.visible');
          if (
            roleName === UserRoles.contributor1
            || roleName === UserRoles.contributor2
            || roleName === UserRoles.contributor3
            || roleName === UserRoles.readonly
          ) {
            tasksHomePage.getEditTeamTaskButtonById(this.teamTaskId).should('not.exist');
          }

          const teamTaskDetailsPage = tasksHomePage.goToTeamTaskById(this.teamTaskId);
          teamTaskDetailsPage.getPageTitleElement().contains('Team task details').should('be.visible');
          teamTaskDetailsPage.getHistoryButton().should('be.visible');
          const taskHistoryPage = teamTaskDetailsPage.goToTaskHistory();

          assertTaskHistorySteps({
            roleName,
            rationale: 'Test team task re-open',
            actionTaken: `Task reopened and assigned to ${this.assignableTeamName}`,
            index: 3,
          });

          taskHistoryPage.getCloseButton().click();
          taskHistoryPage.getCloseButton().should('not.exist');
          teamTaskDetailsPage.getPageTitleElement().contains('Team task details').should('be.visible');
        });
      });
    }
  });
  describe('Cannot Roles', () => {
    before(() => {
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
        let teamTaskId = '';

        cy.getToken(UserRoles.level1).then(async (tokenResponse) => {
          const provider = useProvider(tokenResponse.access_token);
          const resultTeamTaskCreated = await createTeamTask(provider, caseFileId, escalationTeam.id);
          await cy.callSearchUntilMeetCondition({
            provider: useProvider(accessTokenL6),
            searchCallBack: (provider: IProvider) => (provider.teams.search({
              filter: { Entity: { Events: { any: { Id: { value: event.id, type: 'guid' } } }, isEscalation: true } },
            })),
            conditionCallBack: (value: []) => value.length > 0,
          });
          teamTaskId = resultTeamTaskCreated.id;
          cy.wrap(teamTaskId).as('teamTaskId');
        });
        cy.getToken(UserRoles.level6).then(async (tokenResponse) => {
          const assignTeamData: SetTeamTaskActionParams = {
            provider: useProvider(tokenResponse.access_token),
            caseFileId,
            teamId: team.id,
            actionTaken: ActionTaken.Assign,
            taskId: teamTaskId,
          };
          await setTeamTaskAction(assignTeamData);
        });
        cy.getToken(UserRoles.level1).then(async (tokenResponse) => {
          const provider = useProvider(tokenResponse.access_token);
          await provider.task.completeTask(teamTaskId, caseFileId, 'complete task');
        });
        cy.wrap(provider).as('provider');
        cy.wrap(team).as('assignableTeamCreated');
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
        it('should not be able to re-open completed team tas', function () {
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
