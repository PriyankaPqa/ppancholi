import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { getUserName, getUserRoleDescription } from '@libs/cypress-lib/helpers/users';
import { TeamType } from '@libs/entities-lib/team';
import { IProvider } from '@/services/provider';
import { useProvider } from '../../../provider/provider';
import { createEventWithAssignableTeam, createHousehold, createTeamTask } from '../../helpers/prepareState';
import { linkEventToTeamForManyRoles, LinkEventToTeamParams, removeTeamMembersFromTeam } from '../../helpers/teams';
import { assertTaskHistorySteps } from './canSteps';
import { TasksHomePage } from '../../../pages/tasks/tasksHome.page';

const escalationRole = [
  UserRoles.level5,
];

const assignableRoles = [
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
];

const cannotRoles = [
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

const { filteredCanRoles, filteredCannotRoles } = getRoles(canRoles, cannotRoles);

let accessTokenL6 = '';

describe('[T28436] Confirm that only an Escalation Team member and L6 can assign a Team Task that is in New status', { tags: ['@teams', '@tasks'] }, () => {
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
            });
            await cy.callSearchUntilMeetCondition({
              provider: useProvider(accessTokenL6),
              searchCallBack: (provider: IProvider) => (provider.teams.search({
                filter: { Entity: { Id: { value: team.id, type: 'guid' } } },
                top: 1,
              })),
              conditionCallBack: (value: []) => (value.length > 0),
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
        it('should be able to assign a team task that is in New status', function () {
          const tasksHomePage = new TasksHomePage();
          tasksHomePage.getTableTitleElement().contains('Tasks').should('be.visible');
          cy.contains('Refresh').should('be.visible');
          tasksHomePage.getTaskById(this.teamTaskId).should('be.visible');
          tasksHomePage.getCreatedTaskStatusElement().contains('New').should('be.visible');
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
          tasksHomePage.getDialogCancelledCheckbox().should('not.be.checked');
          tasksHomePage.getDialogRationaleInput().should('be.visible');
          tasksHomePage.getDialogCancelButton().should('be.visible');
          tasksHomePage.getDialogApplyButton().should('be.visible');
          tasksHomePage.getDialogAssignCheckbox().check({ force: true });
          tasksHomePage.getDialogSelectTeamToAssignElement().should('be.visible');
          tasksHomePage.selectTeamToAssign(this.assignableTeamName);
          tasksHomePage.enterRationale('Test team task assigning');
          tasksHomePage.getDialogApplyButton().click();
          tasksHomePage.getDialogApplyButton().should('not.exist');
          if (roleName === UserRoles.level6) {
            tasksHomePage.getCreatedTaskActionButton().should('be.visible');
          } else if (roleName === escalationRole[0]) {
            tasksHomePage.getCreatedTaskActionButton().should('not.exist');
          }
          tasksHomePage.getCreatedTaskAssignedTo().should('eq', this.assignableTeamName);
          tasksHomePage.getCreatedTaskStatusElement().contains('In progress').should('be.visible');
          tasksHomePage.getCreatedTaskEditButton().should('be.visible');

          const teamTaskDetailsPage = tasksHomePage.goToTeamTaskById(this.teamTaskId);
          teamTaskDetailsPage.getTeamTaskTeamAssignedTo().should('eq', this.assignableTeamName);
          if (roleName === UserRoles.level6) {
            teamTaskDetailsPage.getTeamTaskActionButton().should('be.visible');
          } else if (roleName === escalationRole[0]) {
            teamTaskDetailsPage.getTeamTaskActionButton().should('be.disabled');
          }
          teamTaskDetailsPage.getStatusTag().should('eq', 'In progress');
          teamTaskDetailsPage.getEditButton().should('be.visible');
          teamTaskDetailsPage.getHistoryButton().should('be.visible');
          teamTaskDetailsPage.goToTaskHistory();

          assertTaskHistorySteps({
            roleName,
            rationale: 'Test team task assigning',
            actionTaken: `${this.escalationTeamName} assigned to ${this.assignableTeamName}`,
            index: 1,
          });
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
          cy.wrap(resultTeamTaskCreated.id).as('teamTaskId');
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
        it('should not be able to assign a team task that is in New status', function () {
          const tasksHomePage = new TasksHomePage();
          tasksHomePage.getTableTitleElement().contains('Tasks').should('be.visible');
          cy.contains('Refresh').should('be.visible');
          tasksHomePage.getTaskById(this.teamTaskId).should('be.visible');
          tasksHomePage.getCreatedTaskStatusElement().contains('New').should('be.visible');
          tasksHomePage.getTaskActionButtonById(this.teamTaskId).should('not.exist');
        });
      });
    }
  });
});
