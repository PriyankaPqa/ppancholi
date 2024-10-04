import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { TeamType } from '@libs/entities-lib/team';
import { EFinancialAmountModes } from '@libs/entities-lib/financial-assistance';
import { EPaymentModalities } from '@libs/entities-lib/program';
import { getUserName, getUserRoleDescription } from '@libs/cypress-lib/helpers/users';
import { IProvider } from '@/services/provider';
import { TasksHomePage } from 'cypress/pages/tasks/tasksHome.page';
import {
  addAndSubmitFaPayment,
  createEventWithAssignableTeam,
  createHousehold,
  createProgramWithTableWithItemAndSubItem,
} from '../../helpers/prepareState';
import { linkEventToTeamForManyRoles, LinkEventToTeamParams, removeTeamMembersFromTeam } from '../../helpers/teams';
import { useProvider } from '../../../provider/provider';
import { CreateTeamTaskPage } from '../../../pages/tasks/createTeamTask.page';
import { assertTaskHistorySteps, caseFileDetailsSteps } from './canSteps';

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
  UserRoles.level0,
  UserRoles.contributor1,
  UserRoles.contributor2,
  UserRoles.contributor3,
  UserRoles.readonly,
];

const { filteredCanRoles } = getRoles(canRoles, []);

let accessTokenL6 = '';

describe('[T29663] When Payment Issue Team Task created, user can select a specific Payment', { tags: ['@team-task', '@tasks'] }, () => {
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
            cy.callSearchUntilMeetCondition({
              provider: useProvider(accessTokenL6),
              searchCallBack: (provider: IProvider) => (provider.teams.search({
                filter: { Entity: { Events: { any: { Id: { value: event.id, type: 'guid' } } }, isEscalation: true } },
              })),
              conditionCallBack: (value: []) => value.length > 0,
            });
            const resultCreateProgram = await createProgramWithTableWithItemAndSubItem(provider, event.id, EFinancialAmountModes.Fixed);
            const resultCreateHousehold = await createHousehold(provider, event);
            const caseFileId = resultCreateHousehold.registrationResponse.caseFile.id;

            const faPaymentCreated1 = await addAndSubmitFaPayment(provider, caseFileId, resultCreateProgram.table.id, EPaymentModalities.Cheque);
            const faPaymentCreated2 = await addAndSubmitFaPayment(provider, caseFileId, resultCreateProgram.table.id, EPaymentModalities.Voucher);

            cy.login(roleName);
            cy.goTo(`casefile/${caseFileId}/task/create/team`);
            cy.wrap(provider).as('provider');
            cy.wrap(team).as('assignableTeamCreated');
            cy.wrap(escalationTeam).as('escalationTeamCreated');
            cy.wrap(escalationTeam.name).as('escalationTeamName');
            cy.wrap(faPaymentCreated1.name).as('faPayment1Name');
            cy.wrap(faPaymentCreated2.name).as('faPayment2Name');
          });
        });

        after(function () {
          if (this.provider && this.assignableTeamCreated?.id && this.escalationTeamCreated?.id) {
            removeTeamMembersFromTeam(this.assignableTeamCreated.id, this.provider);
            removeTeamMembersFromTeam(this.escalationTeamCreated.id, this.provider);
          }
        });

        // eslint-disable-next-line
        it('should be able to select a specific Payment when payment issue team task created', function () {
          const createTeamTaskPage = new CreateTeamTaskPage();
          createTeamTaskPage.getPageTitleElement().contains('Create team task').should('be.visible');
          createTeamTaskPage.getIsUrgentCheckbox().should('not.be.checked');
          createTeamTaskPage.getEscalationTeamAssigned().contains(this.escalationTeamName).should('be.visible');
          createTeamTaskPage.getTaskCategoryDropdown().should('be.visible');
          createTeamTaskPage.getTaskDescriptionElement().should('be.visible');
          createTeamTaskPage.getCreateButton().should('be.enabled');
          createTeamTaskPage.getCancelButton().should('be.enabled');
          createTeamTaskPage.getIsUrgentCheckbox().check({ force: true });
          createTeamTaskPage.selectTaskCategory('Payment Issue');
          createTeamTaskPage.getFaPaymentDropdown().should('be.visible');
          createTeamTaskPage.getFaPaymentDropdownElement(this.faPayment1Name).should('be.visible');
          createTeamTaskPage.getFaPaymentDropdownElement(this.faPayment2Name).should('be.visible');
          createTeamTaskPage.selectFaPayment(this.faPayment1Name);
          createTeamTaskPage.selectTaskSubCategory('Did not receive funds');
          createTeamTaskPage.getTaskSubCategoryDropdown().should('be.visible');
          createTeamTaskPage.enterTaskDescription('team task description payment issue');

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

          const tasksHistoryPage = teamTaskDetailsPage.goToTaskHistory();
          assertTaskHistorySteps({
            roleName,
            actionTaken: 'Task created',
          });
          tasksHistoryPage.goToTaskDetailsPage();

          teamTaskDetailsPage.goToTasksHomePage();

          const tasksHomePage = new TasksHomePage();
          tasksHomePage.getTableTitleElement().contains('Tasks').should('be.visible');
          cy.contains('Refresh').should('be.visible');
          tasksHomePage.getCreatedTaskCategory().should('eq', 'Payment Issue');
          tasksHomePage.getCreatedTaskAssignedTo().should('eq', this.escalationTeamName);
          tasksHomePage.getCreatedTaskStatusElement().contains('New').should('be.visible');
          tasksHomePage.getCreatedTaskActionButton().should('be.visible');
          tasksHomePage.getCreatedTaskEditButton().should('be.visible');

          tasksHomePage.goToCaseFileDetailsPage();

          caseFileDetailsSteps('Payment Issue', roleName, 'created');
        });
      });
    }
  });
});
