import { UserRoles } from '@libs/cypress-lib/support/msal';
import { format } from 'date-fns';
import { formatCurrentDate } from '@libs/cypress-lib/helpers';
import {
  prepareStateEventAndProgram,
  prepareStateHousehold,
  createAndUpdateAssessment,
  addAssessmentToCasefile,
  completeAndSubmitCasefileAssessment } from '../../helpers/prepareState';
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
  Contributor3: UserRoles.contributor3,
  Contributor2: UserRoles.contributor2,
  Contributor1: UserRoles.contributor1,
  ReadOnly: UserRoles.readonly,
};

const canRolesValues = [...Object.values(canRoles)];

let accessTokenL6 = '';

describe('#TC1773# - Confirm that Beneficiary can complete a Case File Assessment', { tags: ['@assessments'] }, () => {
  before(() => {
    cy.getToken().then(async (tokenResponse) => {
      accessTokenL6 = tokenResponse.access_token;
      const { provider, event, team, program } = await prepareStateEventAndProgram(accessTokenL6, canRolesValues);
      const resultAssessment = await createAndUpdateAssessment(provider, event.id, program.id);
      cy.wrap(provider).as('provider');
      cy.wrap(event).as('eventCreated');
      cy.wrap(team).as('teamCreated');
      cy.wrap(resultAssessment.id).as('assessmentFormId');
      cy.wrap(resultAssessment.name.translation.en).as('assessmentName');
    });
  });
  after(function () {
    if (this.provider && this.teamCreated?.id) {
      removeTeamMembersFromTeam(this.teamCreated.id, this.provider);
    }
  });

  describe('Can Roles', () => {
    for (const [roleName, roleValue] of Object.entries(canRoles)) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.then(async function () {
            const resultHousehold = await prepareStateHousehold(accessTokenL6, this.eventCreated);
            const resultCreateAssessmentResponse = await addAssessmentToCasefile(resultHousehold.provider, resultHousehold.registrationResponse.caseFile.id, this.assessmentFormId);
            cy.wrap(resultHousehold).as('householdCreated');
            cy.wrap(resultCreateAssessmentResponse).as('casefileAssessment');
            cy.login(roleValue);
            cy.goTo(`casefile/${resultHousehold.registrationResponse.caseFile.id}/assessments`);
          });
        });
        it('should successfully complete a Case File Assessment', function () {
          // eslint-disable-next-line
          completeAndSubmitCasefileAssessment(this.householdCreated.provider, this.casefileAssessment.id, this.householdCreated.registrationResponse.caseFile.id, this.assessmentFormId); //completely respond to assessment as a beneficiary and click on submit

          const assessmentsListPage = new AssessmentsListPage();
          assessmentsListPage.getCompletedAssessmentTable().contains(`${this.assessmentName}`).should('be.visible');
          assessmentsListPage.getAssessmentDateAssigned().should('eq', format(Date.now(), 'yyyy-MM-dd'));
          assessmentsListPage.getAssessmentDateModified().should('eq', format(Date.now(), 'yyyy-MM-dd'));
          assessmentsListPage.getAssessmentDateCompletedElement().contains(`${formatCurrentDate()}`).should('be.visible');
          assessmentsListPage.getAssessmentStatusTag().should('eq', 'Completed');
          if (roleName === 'Level6' || roleName === 'Level5' || roleName === 'Level4' || roleName === 'Level3') {
            assessmentsListPage.getEditCompletedAssessmentButton().should('be.visible');
          } else {
            assessmentsListPage.getEditCompletedAssessmentButton().should('not.exist');
          }
        });
      });
    }
  });
});
