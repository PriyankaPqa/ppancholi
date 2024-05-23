import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { EFinancialAmountModes } from '@libs/entities-lib/financial-assistance';
import { IEligibilityCriteria, ProgramEntity } from '@libs/entities-lib/program';
import {
  addAssessmentToCasefile, CasefileAssessmentParams,
  createAndUpdateAssessment,
  createEventAndTeam,
  createProgramWithTableWithItemAndSubItem, partiallyCompleteCasefileAssessment,
  prepareStateHousehold, updateProgram,
} from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { CaseFileDetailsPage } from '../../../pages/casefiles/caseFileDetails.page';
import { FinancialAssistanceHomePage } from '../../../pages/financial-assistance-payment/financialAssistanceHome.page';

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
let caseFileId = '';

describe(
  '[T28157] Cannot manually create FA payment when completed Assessment mandatory for Program and CRC User has only partially completed the Assessment',
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
          caseFileId = resultHousehold.registrationResponse.caseFile.id;
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
            casefileId: caseFileId,
            assessmentFormId: resultAssessment.id,
          };
          await partiallyCompleteCasefileAssessment(completeAndSubmitCasefileAssessmentParamData);
          cy.login(roleName);
          cy.goTo(`casefile/${caseFileId}`);
          });
        });

        it('should not be able to manually create financial assistance payment when required assessment is not completed', function () {
          const caseFileDetailsPage = new CaseFileDetailsPage();
          caseFileDetailsPage.goToFinancialAssistanceHomePage();
          cy.waitForStatusCode('**/household/potential-duplicates/*/duplicates', 200); // addFaPayment Button activates after this GET request has status code 200, an improvement over using static wait
          const financialAssistanceHomePage = new FinancialAssistanceHomePage(); // creates new object here to avoid dependency cycle

          const addFinancialAssistancePage = financialAssistanceHomePage.addNewFaPayment();
          addFinancialAssistancePage.getCreateButton().should('be.disabled');
          addFinancialAssistancePage.getCancelButton().should('be.enabled');
          addFinancialAssistancePage.selectTable(this.faTable.name.translation.en);
          cy.contains('The household does not meet one or more eligibility criteria for the selected program. '
            + 'Please review the eligibility criteria for this program and try again.').should('be.visible');
          addFinancialAssistancePage.getAddPaymentLineButton().should('be.disabled');
        });
      });
    }
  });

  describe('Cannot Roles', () => {
    for (const roleName of filteredCannotRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.login(roleName);
          cy.goTo(`casefile/${caseFileId}/financialAssistance`);
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
