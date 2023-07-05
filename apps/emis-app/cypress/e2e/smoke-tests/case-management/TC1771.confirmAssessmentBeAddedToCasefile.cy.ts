  import { UserRoles } from '@libs/cypress-lib/support/msal';
  import { IEventEntity } from '@libs/entities-lib/event';
  import { ICaseFileEntity } from '@libs/entities-lib/case-file';
  import { IProgramEntity } from '@libs/entities-lib/program';
  import { IAssessmentFormEntity } from '@libs/entities-lib/assessment-template';
  import { formatCurrentDate } from '@libs/cypress-lib/helpers';
  import { prepareStateHousehold, createAssessment, prepareStateEventAndProgram } from '../../helpers/prepareState';
  import { removeTeamMembersFromTeam } from '../../helpers/teams';
  import { AssessmentsListPage } from '../../../pages/assessmentsCasefile/assessmentsList.page';

  const canRoles = {
    Level6: UserRoles.level6,
    Level5: UserRoles.level5,
    Level4: UserRoles.level4,
    Level3: UserRoles.level3,
    Level2: UserRoles.level2,
    Level1: UserRoles.level1,
    Level0: UserRoles.level0,
  };

  const cannotRoles = {
    Contributor1: UserRoles.contributor1,
    Contributor2: UserRoles.contributor2,
    Contributor3: UserRoles.contributor3,
    ReadOnly: UserRoles.readonly,
  };

  const allRolesValues = [...Object.values(canRoles), ...Object.values(cannotRoles)];

  let event = null as IEventEntity;
  let accessTokenL6 = '';
  let caseFileCreated = null as ICaseFileEntity;
  let program = null as IProgramEntity;
  let assessment = null as IAssessmentFormEntity;

  describe('#TC1771# - Confirm that an Assessment can be added to a Case File', { tags: ['@case-file', '@assessments'] }, () => {
    before(() => {
      cy.getToken().then(async (accessToken) => {
        accessTokenL6 = accessToken.access_token;
        const resultEventProgram = await prepareStateEventAndProgram(accessTokenL6, allRolesValues);
        const { provider, team } = resultEventProgram;
        event = resultEventProgram.event;
        program = resultEventProgram.program;
        const resultAssessment = await createAssessment(provider, event.id, program.id);
        assessment = resultAssessment.assessment;
        cy.wrap(provider).as('provider');
        cy.wrap(team).as('teamCreated');
      });
    });
    after(function () {
      if (this.teamCreated?.id && this.provider) {
        removeTeamMembersFromTeam(this.teamCreated.id, this.provider);
      }
    });
    describe('Can Roles', () => {
      for (const [roleName, roleValue] of Object.entries(canRoles)) {
        describe(`${roleName}`, () => {
          beforeEach(() => {
            cy.then(async () => {
              const result = await prepareStateHousehold(accessTokenL6, event);
              caseFileCreated = result.registrationResponse.caseFile;
              cy.login(roleValue);
              cy.goTo(`casefile/${caseFileCreated.id}/assessments`);
            });
          });
          it('should successfully add assessment to a casefile', () => {
            const assessmentsListPage = new AssessmentsListPage();

            const addAssessmentsPage = assessmentsListPage.addAssessment();
            addAssessmentsPage.getSearchAssessmentsField().should('be.visible');
            addAssessmentsPage.getAssessmentsTable().contains('Assessment name').should('be.visible');
            addAssessmentsPage.getAssessmentsTable().contains('Program').should('be.visible');
            addAssessmentsPage.getAssessmentsTable().contains(`${program.name.translation.en}`).should('be.visible');
            addAssessmentsPage.getAssessmentsTable().contains(`${assessment.name.translation.en}`).should('be.visible');
            addAssessmentsPage.getAddAssessmentButton().should('be.visible');
            addAssessmentsPage.getAddAssessmentButton().click();

            cy.contains('The assessment was assigned').should('be.visible');

            assessmentsListPage.getPendingAssessmentTable().contains(`${assessment.name.translation.en}`).should('be.visible');
            assessmentsListPage.getPendingAssessmentTable().contains(formatCurrentDate()).should('be.visible');
            assessmentsListPage.getAssessmentStatusTag().should('eq', 'Pending');
            assessmentsListPage.getAssessmentStartButton().should('be.visible');

            if (roleValue === canRoles.Level0) {
              assessmentsListPage.getCopyLinkButton().should('not.exist');
              assessmentsListPage.getDeleteAssessmentButton().should('not.exist');
            } else {
              assessmentsListPage.getCopyLinkButton().should('be.visible');
              assessmentsListPage.getDeleteAssessmentButton().should('be.visible');
            }
          });
        });
      }
    });
    describe('Cannot Roles', () => {
      for (const [roleName, roleValue] of Object.entries(cannotRoles)) {
        describe(`${roleName}`, () => {
          beforeEach(() => {
            cy.then(async () => {
              const result = await prepareStateHousehold(accessTokenL6, event);
              caseFileCreated = result.registrationResponse.caseFile;
              cy.login(roleValue);
              cy.goTo(`casefile/${caseFileCreated.id}/assessments`);
            });
          });
          it('should not be able to add assessment to a casefile', () => {
            const assessmentsListPage = new AssessmentsListPage();

            cy.contains('Pending assessments').should('be.visible');
            assessmentsListPage.getAddAssessmentButton().should('not.exist');
          });
        });
      }
    });
  });
