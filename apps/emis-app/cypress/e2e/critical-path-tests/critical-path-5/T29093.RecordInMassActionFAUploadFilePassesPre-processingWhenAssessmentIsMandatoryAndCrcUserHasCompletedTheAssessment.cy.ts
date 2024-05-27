import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { EFinancialAmountModes } from '@libs/entities-lib/financial-assistance';
import { IEligibilityCriteria, ProgramEntity } from '@libs/entities-lib/program';
import {
  addAssessmentToCasefile, CasefileAssessmentParams, completeAndSubmitCasefileAssessmentByCrcUser,
  createAndUpdateAssessment,
  createEventAndTeam,
  createProgramWithTableWithItemAndSubItem,
  prepareStateHousehold, updateProgram,
} from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { massActionFinancialAssistanceUploadFilePassesPreProcessCanSteps } from './canStep';

const canRoles = [
  UserRoles.level6,
];

const cannotRoles = [
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

const { filteredCanRoles, filteredCannotRoles, allRoles } = getRoles(canRoles, cannotRoles);

let accessTokenL6 = '';

describe(
  '[T29093] Mass Action FA upload file passes pre-processing when Assessment is mandatory and CRC user has completed the assessment',
  { tags: ['@financial-assistance', '@mass-actions'] },
  () => {
  before(() => {
    cy.getToken().then(async (tokenResponse) => {
      accessTokenL6 = tokenResponse.access_token;
      const resultCreatedEvent = await createEventAndTeam(accessTokenL6, allRoles);
      const resultCreateProgram = await createProgramWithTableWithItemAndSubItem(
        resultCreatedEvent.provider,
        resultCreatedEvent.event.id,
        EFinancialAmountModes.Fixed,
      );
      cy.wrap(resultCreatedEvent.provider).as('provider');
      cy.wrap(resultCreatedEvent.event).as('event');
      cy.wrap(resultCreatedEvent.team).as('teamCreated');
      cy.wrap(resultCreateProgram.table).as('faTable');
      cy.wrap(resultCreateProgram.program).as('program');
      cy.wrap(resultCreateProgram.program.name.translation.en).as('programName');
    });
  });

  after(function () {
    if (this.provider && this.teamCreated?.id) {
      removeTeamMembersFromTeam(this.teamCreated.id, this.provider);
    }
  });

  describe('Can Roles', () => {
    for (const roleName of filteredCanRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.then(async function () {
            const resultHousehold = await prepareStateHousehold(accessTokenL6, this.event);
            cy.wrap(resultHousehold.registrationResponse.caseFile).as('caseFile');
            cy.wrap(resultHousehold.registrationResponse.caseFile.id).as('caseFileId');
            cy.wrap(resultHousehold.registrationResponse.caseFile.caseFileNumber).as('caseFileNumber');
            const resultAssessment = await createAndUpdateAssessment(this.provider, this.event.id, this.program.id);
            const eligibilityCriteria: IEligibilityCriteria = {
              authenticated: false,
              impacted: false,
              completedAssessments: true,
              completedAssessmentIds: [resultAssessment.id],
            };
            const updateProgramEntity = new ProgramEntity({ ...this.program, eligibilityCriteria });
            await updateProgram(this.provider, updateProgramEntity);
            const resultCreateAssessmentResponse = await addAssessmentToCasefile(resultHousehold.provider, resultHousehold.registrationResponse.caseFile.id, resultAssessment.id);
            const completeAndSubmitCasefileAssessmentParamData: CasefileAssessmentParams = {
              provider: resultHousehold.provider,
              assessmentResponseId: resultCreateAssessmentResponse.id,
              casefileId: resultHousehold.registrationResponse.caseFile.id,
              assessmentFormId: resultAssessment.id,
            };
            cy.interceptAndValidateCondition({
              httpMethod: 'PATCH',
              url: `**/assessment/assessment-responses/${resultCreateAssessmentResponse.id}/submit`,
              actionsCallback: () => {
                cy.then(async () => {
                  await completeAndSubmitCasefileAssessmentByCrcUser(completeAndSubmitCasefileAssessmentParamData);
                });
              },
              conditionCallBack: (interception) => (interception.response.statusCode === 200),
              actionsWhenValidationPassed: () => {
                cy.login(roleName);
                cy.goTo('mass-actions/financial-assistance');
              },
              actionsWhenValidationFailed: () => {
                throw Error(`Failed to submit Assessment ${resultCreateAssessmentResponse.id}`);
              },
              timeout: 6000,
              alias: 'submitAssessment',
            });
          });
        });

        it('should successfully upload file and passes pre-processing', function () {
          massActionFinancialAssistanceUploadFilePassesPreProcessCanSteps({
            caseFile: this.caseFile,
            event: this.event,
            faTable: this.faTable,
            filePath: 'cypress/downloads/TC1860FaFile.csv',
            programName: this.programName,
            retries: this.test.retries.length,
          });
        });
      });
    }
  });

  describe('Cannot Roles', () => {
    for (const roleName of filteredCannotRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.login(roleName);
          cy.goTo('mass-actions/financial-assistance');
        });
        it('should not be able to do the mass action FA', () => {
          cy.contains('You do not have permission to access this page').should('be.visible');
        });
      });
    }
  });
},
);
