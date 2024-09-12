import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { getUserName } from '@libs/cypress-lib/helpers/users';
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
  '[T28442] Case File: Can set Team task to \'Working on it\' when user belongs to the assigned Team',
  { tags: ['@case-file', '@team-task', '@tasks'] },
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
            cy.getToken(roleName).then(async (tokenResponse) => {
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

        // eslint-disable-next-line max-statements
        it('should be able to set working on it', function () {
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
          tasksHomePage.getCreatedTaskEditButton().should('be.visible');

          const teamTaskDetailsPage = tasksHomePage.goToTeamTaskById(this.teamTaskId);
          teamTaskDetailsPage.getTeamTaskActionWorkingOnItElement().contains('N/A').should('be.visible');
          teamTaskDetailsPage.getTeamTaskActionWorkingOnItToggle().should('be.enabled');
          teamTaskDetailsPage.getTeamTaskActionWorkingOnItToggle().should('not.be.checked');
          teamTaskDetailsPage.getTeamTaskActionWorkingOnItToggle().click({ force: true });
          teamTaskDetailsPage.getTeamTaskActionWorkingOnItToggle().should('be.checked');
          teamTaskDetailsPage.getTeamTaskActionWorkingOnItElement().contains(getUserName(roleName)).should('be.visible');

          const tasksHistoryPage = teamTaskDetailsPage.goToTaskHistory();
          if (roleName === UserRoles.level6) {
            assertTaskHistorySteps({ roleName, actionTaken: `${getUserName(roleName)} is working on it`, rationale: '-', index: 2 });
          } else {
            assertTaskHistorySteps({ roleName, actionTaken: `${getUserName(roleName)} from ${this.assignableTeamName} is working on it`, rationale: '-', index: 2 });
          }
          tasksHistoryPage.getHistoryTableRationaleByIndex(2).should('eq', '-');
          tasksHistoryPage.getCloseButton().should('be.visible');
          tasksHistoryPage.goToTaskDetailsPage();
          teamTaskDetailsPage.getBackToTasksButton().click();
          tasksHomePage.getCreatedTaskUserWorkingOn().should('string', getUserName(roleName));
          tasksHomePage.goToTeamTaskById(this.teamTaskId);
          teamTaskDetailsPage.getTeamTaskActionWorkingOnItElement().contains(getUserName(roleName)).should('be.visible');
          teamTaskDetailsPage.getTeamTaskActionWorkingOnItToggle().should('be.enabled');
          teamTaskDetailsPage.getTeamTaskActionWorkingOnItToggle().should('be.checked');
          teamTaskDetailsPage.getTeamTaskActionWorkingOnItToggle().click({ force: true });
          teamTaskDetailsPage.confirmRemoveWorkingOnIt();
          teamTaskDetailsPage.getTeamTaskActionWorkingOnItToggle().should('not.be.checked');
          teamTaskDetailsPage.getTeamTaskActionWorkingOnItElement().contains('N/A').should('be.visible');

          teamTaskDetailsPage.goToTaskHistory();
          if (roleName === UserRoles.level6) {
            assertTaskHistorySteps({ roleName, actionTaken: `${getUserName(roleName)} removed working on it`, rationale: '-', index: 3 });
          } else {
            assertTaskHistorySteps({ roleName, actionTaken: `${getUserName(roleName)} from ${this.assignableTeamName} removed working on it`, rationale: '-', index: 3 });
          }
          tasksHistoryPage.getHistoryTableRationaleByIndex(3).should('eq', '-');
          tasksHistoryPage.getCloseButton().should('be.visible');
          tasksHistoryPage.goToTaskDetailsPage();
          teamTaskDetailsPage.getBackToTasksButton().click();
          tasksHomePage.getCreatedTaskUserWorkingOn().should('eq', 'N/A');
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
        it('should not be able to set working on it', function () {
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

          const teamTaskDetailsPage = tasksHomePage.goToTeamTaskById(this.teamTaskId);
          teamTaskDetailsPage.getTeamTaskActionWorkingOnItElement().contains('N/A').should('be.visible');
          teamTaskDetailsPage.getTeamTaskActionWorkingOnItToggle().should('be.disabled');
        });
      });
    }
  });
},
);
