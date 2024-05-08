import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { EFinancialAmountModes } from '@libs/entities-lib/financial-assistance';
import { IEligibilityCriteria } from '@libs/entities-lib/program';
import { IImpactStatusValidation, ImpactValidationMethod, ValidationOfImpactStatus } from '@libs/entities-lib/case-file';
import { createEventAndTeam, createProgramWithTableWithItemAndSubItem, prepareStateHousehold, updateValidationOfImpactStatus } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { CaseFileDetailsPage } from '../../../pages/casefiles/caseFileDetails.page';
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

describe('#TC1854# - Can create manual FA payment when Validation of Impact status is Impacted', { tags: ['@financial-assistance'] }, () => {
  before(() => {
    cy.getToken().then(async (tokenResponse) => {
      accessTokenL6 = tokenResponse.access_token;
      const resultCreatedEvent = await createEventAndTeam(accessTokenL6, allRoles);
      const eligibilityCriteria: IEligibilityCriteria = {
        authenticated: false,
        impacted: true,
        completedAssessments: false,
        completedAssessmentIds: [],
      };
      const resultCreateProgram = await createProgramWithTableWithItemAndSubItem(
        resultCreatedEvent.provider,
        resultCreatedEvent.event.id,
        EFinancialAmountModes.Fixed,
        { eligibilityCriteria },
      );
      cy.wrap(resultCreatedEvent.provider).as('provider');
      cy.wrap(resultCreatedEvent.event).as('event');
      cy.wrap(resultCreatedEvent.team).as('teamCreated');
      cy.wrap(resultCreateProgram.table).as('faTable');
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
            const resultCreateHousehold = await prepareStateHousehold(accessTokenL6, this.event);
            const params: IImpactStatusValidation = {
              method: ImpactValidationMethod.Manual,
              status: ValidationOfImpactStatus.Impacted,
            };
            await updateValidationOfImpactStatus(resultCreateHousehold.provider, resultCreateHousehold.registrationResponse.caseFile.id, params);
            cy.login(roleName);
            cy.goTo(`casefile/${resultCreateHousehold.registrationResponse.caseFile.id}`);
          });
        });

        it('should be able to manually create financial assistance payment when case file validation of impact status is Impacted', function () {
          const caseFileDetailsPage = new CaseFileDetailsPage();
          caseFileDetailsPage.getImpactIconColorValidationElement().should('have.attr', 'class').and('contains', 'validation-button-success');
          caseFileDetailsPage.goToFinancialAssistanceHomePage();

          const financialAssistanceHomePage = new FinancialAssistanceHomePage(); // creates new object here to avoid dependency cycle
          financialAssistanceHomePage.addNewFaPayment();

          manuallyCreatePrepaidCardFaPaymentCanSteps({
            faTableName: this.faTable.name.translation.en,
            paymentLineData: fixturePrepaidCardPaymentLine(),
          });
        });
      });
    }
  });

  describe('Cannot Roles', () => {
    before(() => {
      cy.then(async function () {
        const resultCreateHousehold = await prepareStateHousehold(accessTokenL6, this.event);
        const params: IImpactStatusValidation = {
          method: ImpactValidationMethod.Manual,
          status: ValidationOfImpactStatus.Impacted,
        };
        await updateValidationOfImpactStatus(resultCreateHousehold.provider, resultCreateHousehold.registrationResponse.caseFile.id, params);
        cy.wrap(resultCreateHousehold.registrationResponse.caseFile.id).as('caseFileId');
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
});
