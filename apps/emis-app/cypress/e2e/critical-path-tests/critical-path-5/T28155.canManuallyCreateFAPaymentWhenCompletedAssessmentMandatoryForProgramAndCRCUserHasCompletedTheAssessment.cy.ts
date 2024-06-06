import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { EFinancialAmountModes } from '@libs/entities-lib/financial-assistance';
import { IEligibilityCriteria, ProgramEntity } from '@libs/entities-lib/program';
import { IProvider } from '@/services/provider';
import { ICaseFileCombined } from '@libs/entities-lib/case-file';
import { useProvider } from 'cypress/provider/provider';
import { verifyAndReturnAddFaPaymentPage } from 'cypress/e2e/helpers/page';
import {
  addAssessmentToCasefile, CasefileAssessmentParams,
  completeAndSubmitCasefileAssessmentByCrcUser,
  createAndUpdateAssessment,
  createEventAndTeam,
  createProgramWithTableWithItemAndSubItem,
  prepareStateHousehold, updateProgram,
} from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { FinancialAssistanceHomePage } from '../../../pages/financial-assistance-payment/financialAssistanceHome.page';
import { fixturePrepaidCardPaymentLine } from '../../../fixtures/financial-assistance';
import { manuallyCreatePrepaidCardFaPaymentCanSteps } from './canStep';

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

const { filteredCanRoles, filteredCannotRoles, allRoles } = getRoles(canRoles, cannotRoles);

let accessTokenL6 = '';

describe(
'[T28155] Can manually create FA payment when completed Assessment mandatory for Program and CRC User has completed the Assessment',
  { tags: ['@financial-assistance'] },
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
        cy.wrap(resultCreatedEvent.event.id).as('eventId');
        cy.wrap(resultCreatedEvent.team).as('teamCreated');
        cy.wrap(resultCreateProgram.table).as('faTable');
        cy.wrap(resultCreateProgram.program).as('program');
        cy.wrap(resultCreateProgram.program.id).as('programId');
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
              const resultCreateAssessmentResponse = await addAssessmentToCasefile(resultHousehold.provider, resultHousehold.registrationResponse.caseFile.id, resultAssessment.id);
              const completeAndSubmitCasefileAssessmentParamData: CasefileAssessmentParams = {
                provider: resultHousehold.provider,
                assessmentResponseId: resultCreateAssessmentResponse.id,
                casefileId: resultHousehold.registrationResponse.caseFile.id,
                assessmentFormId: resultAssessment.id,
              };
              cy.intercept('PATCH', `**/assessment/assessment-responses/${resultCreateAssessmentResponse.id}/submit`).as('submitAssessment');
              cy.then(async () => {
                await completeAndSubmitCasefileAssessmentByCrcUser(completeAndSubmitCasefileAssessmentParamData);
              });
              cy.wait('@submitAssessment', { timeout: 60000 }).then(async (interception) => {
                if (interception.response.statusCode === 200) {
                  await cy.callSearchUntilMeetCondition({
                    provider: useProvider(accessTokenL6),
                    searchCallBack: (provider: IProvider) => (provider.caseFiles.search({
                      filter: { Entity: { Id: { value: caseFileId, type: 'guid' } } },
                      top: 1,
                    })),
                    conditionCallBack: (value: ICaseFileCombined[]) => (value.find((el) => el.entity.id === caseFileId).metadata.assessments.length > 0),
                  });
                  cy.login(roleName);
                  cy.goTo(`casefile/${resultHousehold.registrationResponse.caseFile.id}/financialAssistance/create`);
                }
              });
            });
          });
          it('should be able to manually create financial assistance payment when required assessment is completed', function () {
            const addFinancialAssistancePage = verifyAndReturnAddFaPaymentPage();

            manuallyCreatePrepaidCardFaPaymentCanSteps({
              faTableName: this.faTable.name.translation.en,
              paymentLineData: fixturePrepaidCardPaymentLine(),
              eventId: this.eventId,
              programId: this.programId,
              addFinancialAssistancePage,
            });
          });
        });
      }
    });

    describe('Cannot Roles', () => {
      before(() => {
        cy.then(async function () {
          const resultHouseholdCreated = await prepareStateHousehold(accessTokenL6, this.event);
          cy.wrap(resultHouseholdCreated.registrationResponse.caseFile.id).as('caseFileId');
        });
      });
      for (const roleName of filteredCannotRoles) {
        describe(`${roleName}`, () => {
          beforeEach(function () {
            cy.login(roleName);
            cy.goTo(`casefile/${this.caseFileId}/financialAssistance`);
          });
          it('should not be able to access add fa payment button', () => {
            const financialAssistanceHomePage = new FinancialAssistanceHomePage();
            financialAssistanceHomePage.getSearchField().should('be.visible');
            financialAssistanceHomePage.getAddFaPaymentButton().should('not.exist');
          });
        });
      }
    });
  },
);
