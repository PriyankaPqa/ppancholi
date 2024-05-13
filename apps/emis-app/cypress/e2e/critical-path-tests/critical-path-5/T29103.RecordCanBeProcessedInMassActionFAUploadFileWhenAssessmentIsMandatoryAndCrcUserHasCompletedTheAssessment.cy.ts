import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { EFinancialAmountModes } from '@libs/entities-lib/financial-assistance';
import { IMassActionEntity } from '@libs/entities-lib/mass-action';
import { IEligibilityCriteria, ProgramEntity } from '@libs/entities-lib/program';
import {
  addAssessmentToCasefile, callSearchUntilMeetCondition,
  CasefileAssessmentParams,
  completeAndSubmitCasefileAssessmentByCrcUser,
  createAndUpdateAssessment,
  createEventAndTeam,
  createProgramWithTableWithItemAndSubItem,
  MassActionFinancialAssistanceUploadFileWithoutCreatingHouseholdParams,
  prepareStateHousehold,
  prepareStateMassActionFinancialAssistanceUploadFileWithoutCreatingHousehold,
  updateProgram,
} from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { massActionFinancialAssistanceUploadFilePassesProcessCanSteps } from './canStep';

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
const householdQuantity = 1;
let massFinancialAssistance = {} as IMassActionEntity;

describe(
  '[T29103] Record can be processed in Mass Action FA upload file when Assessment is mandatory and CRC User has completed the Assessment',
  { tags: ['@financial-assistance', '@mass-action'] },
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
            const { registrationResponse } = resultHousehold;
            const caseFileId = resultHousehold.registrationResponse.caseFile.id;
            const resultAssessment = await createAndUpdateAssessment(this.provider, this.event.id, this.program.id);
            const eligibilityCriteria: IEligibilityCriteria = {
              authenticated: false,
              impacted: false,
              completedAssessments: true,
              completedAssessmentIds: [resultAssessment.id],
            };
            const updateProgramEntity = new ProgramEntity({ ...this.program, eligibilityCriteria });
            await updateProgram(this.provider, updateProgramEntity);
            const resultCreateAssessmentResponse = await addAssessmentToCasefile(
              this.provider,
              caseFileId,
              resultAssessment.id,
              );
            const completeAndSubmitCasefileAssessmentParamData: CasefileAssessmentParams = {
              provider: this.provider,
              assessmentResponseId: resultCreateAssessmentResponse.id,
              casefileId: caseFileId,
              assessmentFormId: resultAssessment.id,
            };
            cy.intercept('PATCH', `**/assessment/assessment-responses/${resultCreateAssessmentResponse.id}/submit`).as('submitAssessment');
            cy.then(async () => {
              await completeAndSubmitCasefileAssessmentByCrcUser(completeAndSubmitCasefileAssessmentParamData);
            });
            cy.wait('@submitAssessment', { timeout: 60000 }).then(async (interception) => {
              if (interception.response.statusCode === 200) {
                await callSearchUntilMeetCondition({
                  accessToken: accessTokenL6,
                  caseFileId,
                  maxAttempt: 20,
                  waitTime: 2000,
                  searchCallBack: (provider: any) => (provider.caseFiles.search({
                  filter: { Entity: { Id: caseFileId } },
                  top: 1,
                })),
                  conditionCallBack: (value: any) => (value.metadata.assessments.length > 0),
              });
                const massActionFaUploadFileParamData: MassActionFinancialAssistanceUploadFileWithoutCreatingHouseholdParams = {
                  event: this.event,
                  tableId: this.faTable.id,
                  programId: this.program.id,
                  filePath: 'cypress/downloads/TC1965FaFile.csv',
                  provider: this.provider,
                  caseFilesList: [registrationResponse.caseFile],
                };
                const resultMassFinancialAssistance = await prepareStateMassActionFinancialAssistanceUploadFileWithoutCreatingHousehold(massActionFaUploadFileParamData);
                const { responseMassFinancialAssistance } = resultMassFinancialAssistance;
                massFinancialAssistance = responseMassFinancialAssistance;
                cy.login(roleName);
                cy.goTo(`mass-actions/financial-assistance/details/${resultMassFinancialAssistance.responseMassFinancialAssistance.id}`);
              }
            });
          });
        });

        it('should successfully upload file and passes processing', function () {
          massActionFinancialAssistanceUploadFilePassesProcessCanSteps({
            event: this.event,
            faTable: this.faTable,
            householdQuantity,
            programName: this.programName,
            retries: this.test.retries.length,
            massFinancialAssistance,
            roleName,
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
