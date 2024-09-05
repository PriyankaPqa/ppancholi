import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { getUserName, getUserRoleDescription } from '@libs/cypress-lib/helpers/users';
import { formatDateToMmmDdYyyy } from '@libs/cypress-lib/helpers';
import { TeamType } from '@libs/entities-lib/team';
import { format } from 'date-fns';
import { IProvider } from '@/services/provider';
import { createEventWithAssignableTeam, createHousehold } from '../../helpers/prepareState';
import { TasksHomePage } from '../../../pages/tasks/tasksHome.page';
import { linkEventToTeamForManyRoles, LinkEventToTeamParams, removeTeamMembersFromTeam } from '../../helpers/teams';
import { assertTaskHistorySteps } from './canSteps';
import { useProvider } from '../../../provider/provider';

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

describe('[T28444] Create a Team Task', { tags: ['@teams', '@tasks'] }, () => {
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
            const escalationTeam = await linkEventToTeamForManyRoles(escalationTeamParamData); // creates escalation team
            const resultCreateHousehold = await createHousehold(provider, event);
            cy.login(roleName);
            cy.goTo(`casefile/${resultCreateHousehold.registrationResponse.caseFile.id}/task`);
            cy.wrap(provider).as('provider');
            cy.wrap(event).as('event');
            cy.wrap(team).as('assignableTeamCreated');
            cy.wrap(team.name).as('assignableTeamName');
            cy.wrap(escalationTeam.name).as('escalationTeamName');
          });
        });

        after(function () {
          if (this.provider && this.assignableTeamCreated?.id) {
            removeTeamMembersFromTeam(this.assignableTeamCreated.id, this.provider);
          }
        });
        // eslint-disable-next-line
        it('should create a team task successfully.', function () {
          const tasksHomePage = new TasksHomePage();
          tasksHomePage.getTableTitleElement().contains('Tasks').should('be.visible');
          tasksHomePage.getCreateTaskButton().should('be.visible');
          // searches for escalation team before creating a team task
          cy.callSearchUntilMeetCondition({
            provider: useProvider(this.accessTokenL6),
            searchCallBack: (provider: IProvider) => (provider.teams.search({
              filter: { Entity: { Events: { any: { Id: { value: this.event.id, type: 'guid' } } }, isEscalation: true } },
            })),
            conditionCallBack: (value: []) => value.length > 0,
          });

          tasksHomePage.getCreateTaskButton().click();
          tasksHomePage.getCreateNewTeamTaskOption().should('be.visible');
          tasksHomePage.getCreateNewPersonalTaskOption().should('be.visible');

          const createTeamTaskPage = tasksHomePage.addNewTeamTask();
          createTeamTaskPage.getPageTitleElement().contains('Create team task').should('be.visible');
          createTeamTaskPage.getIsUrgentCheckbox().should('not.be.checked');
          createTeamTaskPage.getEscalationTeamAssigned().contains(this.escalationTeamName).should('be.visible');
          createTeamTaskPage.getTaskCategoryDropdown().should('be.visible');
          createTeamTaskPage.getTaskDescriptionElement().should('be.visible');
          createTeamTaskPage.getCreateButton().should('be.enabled');
          createTeamTaskPage.getCancelButton().should('be.enabled');
          createTeamTaskPage.getIsUrgentCheckbox().check({ force: true });
          createTeamTaskPage.selectTaskCategory('EMIS');
          createTeamTaskPage.getTaskSubCategoryDropdown().should('be.visible');
          createTeamTaskPage.selectTaskSubCategory('File correction');
          createTeamTaskPage.enterTaskDescription('team task test description');

          const teamTaskDetailsPage = createTeamTaskPage.createTeamTask();
          cy.contains('The team task has been successfully created.').should('be.visible');
          teamTaskDetailsPage.getPageTitleElement().contains('Team task details').should('be.visible');
          teamTaskDetailsPage.getTeamTaskCreatorInfo().should('string', getUserName(roleName)).and('string', getUserRoleDescription(roleName));
          teamTaskDetailsPage.getIsUrgentElement().contains('Urgent').should('be.visible');
          teamTaskDetailsPage.getIsUrgentElement().should('have.attr', 'class').and('contains', 'rc-red-text');
          teamTaskDetailsPage.getHistoryButton().should('be.visible');
          teamTaskDetailsPage.getStatusTag().should('eq', 'New');
          teamTaskDetailsPage.getEditButton().should('be.visible');
          teamTaskDetailsPage.getTeamTaskTeamAssignedTo().should('eq', this.escalationTeamName);
          teamTaskDetailsPage.getTeamTaskActionButton().should('not.be.disabled');
          if (roleName === UserRoles.level6) {
            teamTaskDetailsPage.getTeamTaskActionWorkingOnItToggle().should('not.be.disabled');
          } else {
            teamTaskDetailsPage.getTeamTaskActionWorkingOnItToggle().should('be.disabled');
          }
          teamTaskDetailsPage.getTeamTaskActionWorkingOnItElement().contains('N/A').should('be.visible');
          teamTaskDetailsPage.getTeamTaskActionWorkingOnItToggle().should('have.attr', 'aria-checked').and('contains', 'false');
          teamTaskDetailsPage.getTeamTaskDateAdded().should('eq', formatDateToMmmDdYyyy(format(Date.now(), 'PPp')));
          teamTaskDetailsPage.getBackToTasksButton().should('be.visible');

          const tasksHistoryPage = teamTaskDetailsPage.goToTaskHistory();
          assertTaskHistorySteps(roleName, 'Task created');
          tasksHistoryPage.getCloseButton().click();

          teamTaskDetailsPage.getBackToTasksButton().should('be.visible');
          teamTaskDetailsPage.getBackToTasksButton().click();

          tasksHomePage.getTableTitleElement().contains('Tasks').should('be.visible');
          cy.contains('Refresh').should('be.visible');
          tasksHomePage.getCreatedTaskCategory().should('eq', 'EMIS');
          tasksHomePage.getCreatedTaskAssignedTo().should('eq', this.escalationTeamName);
          tasksHomePage.getCreatedTaskStatusElement().contains('New').should('be.visible');
          tasksHomePage.getCreatedTaskActionButton().should('be.visible');
          tasksHomePage.getCreatedTaskEditButton().should('be.visible');

          const caseFileDetailsPage = tasksHomePage.goToCaseFileDetailsPage();
          caseFileDetailsPage.waitAndRefreshUntilCaseFileActivityVisibleWithBody('EMIS has been created');
          caseFileDetailsPage.getUserName().should('string', getUserName(roleName));
          caseFileDetailsPage.getRoleName().should('string', getUserRoleDescription(roleName));
          caseFileDetailsPage.getCaseFileActivityTitle().should('string', 'Task created');
          caseFileDetailsPage.getCaseFileActivityBody().should('string', 'EMIS has been created');
        });
      });
    }
  });
});
