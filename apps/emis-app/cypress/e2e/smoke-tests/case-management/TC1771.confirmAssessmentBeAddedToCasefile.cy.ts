  import { UserRoles } from '@libs/cypress-lib/support/msal';
  import { IEventEntity } from '@libs/entities-lib/event';
  import { ICaseFileEntity } from '@libs/entities-lib/case-file';
  import { IProgramEntity } from '@libs/entities-lib/program';
  import { IAssessmentFormEntity } from '@libs/entities-lib/assessment-template';
  import { getToday } from '@libs/cypress-lib/helpers';
  import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
  import { prepareStateHousehold, createAssessment, prepareStateEventAndProgram } from '../../helpers/prepareState';
  import { removeTeamMembersFromTeam } from '../../helpers/teams';
  import { AssessmentsListPage } from '../../../pages/assessmentsCasefile/assessmentsList.page';

  const canRoles = [
    UserRoles.level6,
    UserRoles.level5,
    UserRoles.level4,
    UserRoles.level3,
    UserRoles.level2,
    UserRoles.level1,
    UserRoles.level0,
  ];

  const cannotRoles = [
    UserRoles.contributor1,
    UserRoles.contributor2,
    UserRoles.contributor3,
    UserRoles.readonly,
  ];

  const { filteredCanRoles, filteredCannotRoles, allRoles } = getRoles(canRoles, cannotRoles);

  let event = null as IEventEntity;
  let accessTokenL6 = '';
  let caseFileCreated = null as ICaseFileEntity;
  let program = null as IProgramEntity;
  let assessment = null as IAssessmentFormEntity;

  describe('#TC1771# - Confirm that an Assessment can be added to a Case File', { tags: ['@case-file', '@assessments'] }, () => {
    before(() => {
      cy.getToken().then(async (accessToken) => {
        accessTokenL6 = accessToken.access_token;
        const resultEventProgram = await prepareStateEventAndProgram(accessTokenL6, allRoles);
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
      for (const roleName of filteredCanRoles) {
        describe(`${roleName}`, () => {
          beforeEach(() => {
            cy.then(async () => {
              const result = await prepareStateHousehold(accessTokenL6, event);
              caseFileCreated = result.registrationResponse.caseFile;
              cy.login(roleName);
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
            assessmentsListPage.getPendingAssessmentTable().contains(getToday()).should('be.visible');
            assessmentsListPage.getAssessmentStatusTag().should('eq', 'Pending');
            assessmentsListPage.getAssessmentStartButton().should('be.visible');

            if (roleName === UserRoles.level0) {
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
       for (const roleName of filteredCannotRoles) {
        describe(`${roleName}`, () => {
          beforeEach(() => {
            cy.then(async () => {
              const result = await prepareStateHousehold(accessTokenL6, event);
              caseFileCreated = result.registrationResponse.caseFile;
              cy.login(roleName);
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
