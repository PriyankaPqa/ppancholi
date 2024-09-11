import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { getUserName } from '@libs/cypress-lib/helpers/users';
import { TeamType } from '@libs/entities-lib/team';
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
import { assertTaskHistorySteps } from './canSteps';
import { TasksHomePage } from '../../../pages/tasks/tasksHome.page';

const escalationRole = [
  UserRoles.level6,
];

const assignableRoles = [
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

describe('[T28437] A member can edit a Team task that they have created', { tags: ['@teams', '@tasks'] }, () => {
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

            cy.getToken(roleName).then(async (tokenResponse) => {
              const provider = useProvider(tokenResponse.access_token);
              const resultTeamTaskCreated = await createTeamTask(provider, caseFileId, escalationTeam.id);
              cy.wrap(resultTeamTaskCreated.id).as('teamTaskId');

              cy.callSearchUntilMeetCondition({
                provider: useProvider(accessTokenL6),
                searchCallBack: (provider: IProvider) => (provider.teams.search({
                  filter: { Entity: { Events: { any: { Id: { value: event.id, type: 'guid' } } }, isEscalation: true } },
                })),
                conditionCallBack: (value: []) => value.length > 0,
              });
            });
            cy.login(roleName);
            cy.goTo(`casefile/${caseFileId}/task`);
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

        // eslint-disable-next-line
        it('should be able to edit a team task that they create', function () {
          const tasksHomePage = new TasksHomePage();
          tasksHomePage.getTableTitleElement().contains('Tasks').should('be.visible');
          cy.contains('Refresh').should('be.visible');
          tasksHomePage.getTaskById(this.teamTaskId).should('be.visible');
          tasksHomePage.getTaskActionButtonById(this.teamTaskId).should('be.visible');
          tasksHomePage.getEditTeamTaskButtonById(this.teamTaskId).should('be.visible');

          const editTeamTaskPage = tasksHomePage.goToEditTeamTaskPageById(this.teamTaskId);
          editTeamTaskPage.getPageTitleElement().contains('Edit team task').should('be.visible');
          editTeamTaskPage.getTaskCategoryElement().should('be.visible');
          editTeamTaskPage.getTaskSubCategoryElement().should('be.visible');
          editTeamTaskPage.selectTaskCategory('Feedback');
          editTeamTaskPage.selectTaskSubCategory('Complaint');
          editTeamTaskPage.editTaskDescription('Edited team task Description attempt1');

          const teamTaskDetailsPage = editTeamTaskPage.saveEditedTeamTask();
          cy.contains('The task has been successfully edited.').should('be.visible');
          teamTaskDetailsPage.getPageTitleElement().contains('Team task details').should('be.visible');
          cy.contains('Feedback').should('be.visible');
          teamTaskDetailsPage.getTeamTaskSubCategoryElement().contains('Complaint').should('be.visible');
          teamTaskDetailsPage.getTeamTaskDescriptionElement().contains('Edited team task Description attempt1').should('be.visible');
          teamTaskDetailsPage.getTeamTaskStatusElement().contains('New').should('be.visible');

          const tasksHistoryPage = teamTaskDetailsPage.goToTaskHistory();

          if (roleName === UserRoles.level6) {
            assertTaskHistorySteps({
              roleName,
              actionTaken: `${getUserName(roleName)} updated task details`,
              index: 1,
            });
          } else {
            assertTaskHistorySteps({
              roleName,
              actionTaken: `${getUserName(roleName)} from ${this.assignableTeamName} updated task details`,
              index: 1,
            });
          }
          tasksHistoryPage.getCloseButton().click();

          teamTaskDetailsPage.getPageTitleElement().contains('Team task details').should('be.visible');
          teamTaskDetailsPage.getEditButton().click();

          editTeamTaskPage.getPageTitleElement().contains('Edit team task').should('be.visible');
          editTeamTaskPage.getTaskSubCategoryElement().should('be.visible');
          editTeamTaskPage.selectTaskSubCategory('Compliment');
          editTeamTaskPage.saveEditedTeamTask();

          cy.contains('The task has been successfully edited.').should('be.visible');
          teamTaskDetailsPage.getPageTitleElement().contains('Team task details').should('be.visible');
          teamTaskDetailsPage.getTeamTaskSubCategoryElement().contains('Compliment').should('be.visible');
          teamTaskDetailsPage.getTeamTaskStatusElement().contains('New').should('be.visible');
          teamTaskDetailsPage.goToTaskHistory();

          if (roleName === UserRoles.level6) {
            assertTaskHistorySteps({
              roleName,
              actionTaken: `${getUserName(roleName)} updated task details`,
              index: 2,
            });
          } else {
            assertTaskHistorySteps({
              roleName,
              actionTaken: `${getUserName(roleName)} from ${this.assignableTeamName} updated task details`,
              index: 2,
            });
          }
          tasksHistoryPage.getCloseButton().click();

          teamTaskDetailsPage.getPageTitleElement().contains('Team task details').should('be.visible');
          teamTaskDetailsPage.getEditButton().click();

          editTeamTaskPage.getPageTitleElement().contains('Edit team task').should('be.visible');
          editTeamTaskPage.getEditTaskDescriptionElement().should('be.visible');
          editTeamTaskPage.editTaskDescription('Edited team task Description attempt2');
          editTeamTaskPage.saveEditedTeamTask();

          cy.contains('The task has been successfully edited.').should('be.visible');
          teamTaskDetailsPage.getPageTitleElement().contains('Team task details').should('be.visible');
          teamTaskDetailsPage.getTeamTaskDescriptionElement().contains('Edited team task Description attempt2').should('be.visible');
          teamTaskDetailsPage.getTeamTaskStatusElement().contains('New').should('be.visible');
          teamTaskDetailsPage.goToTaskHistory();

          if (roleName === UserRoles.level6) {
            assertTaskHistorySteps({
              roleName,
              actionTaken: `${getUserName(roleName)} updated task details`,
              index: 3,
            });
          } else {
            assertTaskHistorySteps({
              roleName,
              actionTaken: `${getUserName(roleName)} from ${this.assignableTeamName} updated task details`,
              index: 3,
            });
          }
          tasksHistoryPage.getCloseButton().click();
        });
      });
    }
  });
});
