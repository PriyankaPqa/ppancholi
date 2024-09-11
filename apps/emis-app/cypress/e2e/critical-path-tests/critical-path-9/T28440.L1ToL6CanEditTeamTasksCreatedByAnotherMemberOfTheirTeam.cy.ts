import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { TeamType } from '@libs/entities-lib/team';
import { getUserName } from '@libs/cypress-lib/helpers/users';
import { useProvider } from '../../../provider/provider';
import { createEventWithAssignableTeam, createHousehold, createTeamTask } from '../../helpers/prepareState';
import { linkEventToTeamForManyRoles, LinkEventToTeamParams, removeTeamMembersFromTeam } from '../../helpers/teams';
import { TasksHomePage } from '../../../pages/tasks/tasksHome.page';
import { assertTaskHistorySteps } from './canSteps';

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
];

const cannotRoles = [
  UserRoles.level0,
  UserRoles.contributor1,
  UserRoles.contributor2,
  UserRoles.contributor3,
  UserRoles.readonly,
];

const { filteredCanRoles, filteredCannotRoles } = getRoles(canRoles, cannotRoles);

let accessTokenL6 = '';

describe('[T28440] L1-L6 can edit Team tasks created by another member of their Team', { tags: ['@teams', '@tasks'] }, () => {
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

            cy.getToken(UserRoles.level0).then(async (tokenResponse) => {
              const provider = useProvider(tokenResponse.access_token);
              const resultTeamTaskCreated = await createTeamTask(provider, caseFileId, escalationTeam.id);
              cy.wrap(resultTeamTaskCreated.id).as('teamTaskId');
            });
            cy.login(roleName);
            cy.goTo(`casefile/${caseFileId}/task`);
            cy.wrap(provider).as('provider');
            cy.wrap(team).as('assignableTeamCreated');
            cy.wrap(team.name).as('assignableTeamName');
            cy.wrap(escalationTeam).as('escalationTeamCreated');
          });
        });

        after(function () {
          if (this.provider && this.assignableTeamCreated?.id && this.escalationTeamCreated?.id) {
            removeTeamMembersFromTeam(this.assignableTeamCreated.id, this.provider);
            removeTeamMembersFromTeam(this.escalationTeamCreated.id, this.provider);
          }
        });

        // eslint-disable-next-line
        it('l1-l6 should be able to edit team tasks created by another member of their team', function () {
          const tasksHomePage = new TasksHomePage();
          tasksHomePage.getTableTitleElement().contains('Tasks').should('be.visible');
          cy.contains('Refresh').should('be.visible');
          tasksHomePage.getTaskById(this.teamTaskId).should('be.visible');
          if (roleName === UserRoles.level6) {
            tasksHomePage.getTaskActionButtonById(this.teamTaskId).should('be.visible');
          }
          tasksHomePage.getEditTeamTaskButtonById(this.teamTaskId).should('be.visible');

          const editTeamTaskPage = tasksHomePage.goToEditTeamTaskPageById(this.teamTaskId);
          editTeamTaskPage.getPageTitleElement().contains('Edit team task').should('be.visible');
          editTeamTaskPage.getTaskSubCategoryElement().should('be.visible');
          editTeamTaskPage.selectTaskSubCategory('Duplicate Management');

          const teamTaskDetailsPage = editTeamTaskPage.saveEditedTeamTask();
          cy.contains('The task has been successfully edited.').should('be.visible');
          teamTaskDetailsPage.getPageTitleElement().contains('Team task details').should('be.visible');
          teamTaskDetailsPage.getTeamTaskSubCategoryElement().contains('Duplicate Management').should('be.visible');
          teamTaskDetailsPage.getTeamTaskStatusElement().contains('New').should('be.visible');
          teamTaskDetailsPage.goToTaskHistory();

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

        cy.getToken(UserRoles.level0).then(async (tokenResponse) => {
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
        it('l1-l6 should not be able to edit team tasks created by another member of their team', function () {
          const tasksHomePage = new TasksHomePage();
          tasksHomePage.getTableTitleElement().contains('Tasks').should('be.visible');
          cy.contains('Refresh').should('be.visible');
          tasksHomePage.getTaskById(this.teamTaskId).should('be.visible');
          if (roleName === UserRoles.level0) {
            tasksHomePage.getEditTeamTaskButtonById(this.teamTaskId).should('be.visible'); // visible because team task was created by L0
          } else {
            tasksHomePage.getEditTeamTaskButtonById(this.teamTaskId).should('not.exist');
          }
        });
      });
    }
  });
});
