import { UserRoles } from '@libs/cypress-lib/support/msal';
import { IEventEntity } from '@libs/entities-lib/event';
import { IFinancialAssistanceTableEntity } from '@libs/entities-lib/financial-assistance';
import { IProgramEntity } from '@libs/entities-lib/program';
import { format } from 'date-fns';
import { FinancialAssistanceHomePage } from '../../../pages/financial-assistance-payment/financialAssistanceHome.page';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import {
  createProgramWithTableWithItemAndSubItem,
  createEventAndTeam,
  prepareStateHouseholdMassFinancialAssistance,
} from '../../helpers/prepareState';
import { MassFinancialAssistanceDetailsPage } from '../../../pages/mass-action/mass-financial-assistance/massFinancialAssistanceDetails.page';
import { CaseFileDetailsPage } from '../../../pages/casefiles/caseFileDetails.page';

const canRoles = {
  Level6: UserRoles.level6,
};

const cannotRoles = {
  Level5: UserRoles.level5,
  Level4: UserRoles.level4,
  Level3: UserRoles.level3,
  Level2: UserRoles.level2,
  Level1: UserRoles.level1,
  Level0: UserRoles.level0,
  Contributor1: UserRoles.contributor1,
  Contributor2: UserRoles.contributor2,
  Contributor3: UserRoles.contributor3,
  ReadOnly: UserRoles.readonly,
};

const allRolesValues = [...Object.values(canRoles), ...Object.values(cannotRoles)];

let event = null as IEventEntity;
let accessTokenL6 = '';
let table = null as IFinancialAssistanceTableEntity;
let program = null as IProgramEntity;
let casefileId = '';
let massFinancialAssistanceName = '';

// There is a chance for this test to be flaky because of indexes and search. If that's the case, it's better to use test it with a CSV instead of filtered list
describe(
  '#TC1033# - Process a Financial Assistance filtered list',
  {
    tags: ['@financial-assistance', '@mass-actions'],
    retries: {
      runMode: 3,
    },
  },
() => {
  describe('Can Roles', () => {
    for (const [roleName, roleValue] of Object.entries(canRoles)) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.getToken().then(async (tokenResponse) => {
            accessTokenL6 = tokenResponse.access_token;
            const resultPrepareStateEvent = await createEventAndTeam(accessTokenL6, allRolesValues);
            const { provider, team } = resultPrepareStateEvent;
            event = resultPrepareStateEvent.event;
            const resultCreateProgram = await createProgramWithTableWithItemAndSubItem(provider, event.id);
            table = resultCreateProgram.table;
            program = resultCreateProgram.program;
            const resultMassFinancialAssistance = await prepareStateHouseholdMassFinancialAssistance(accessTokenL6, event, table.id, program.id);
            massFinancialAssistanceName = resultMassFinancialAssistance.responseMassFinancialAssistance.name;
            casefileId = resultMassFinancialAssistance.responseCreateHousehold.registrationResponse.caseFile.id;
            cy.login(roleValue);
            cy.goTo(`mass-actions/financial-assistance/details/${resultMassFinancialAssistance.responseMassFinancialAssistance.id}`);
            cy.wrap(provider).as('provider');
            cy.wrap(team).as('teamCreated');
          });
        });
        afterEach(function () {
          if (this.teamCreated?.id && this.provider) {
            removeTeamMembersFromTeam(this.teamCreated.id, this.provider, allRolesValues);
          }
        });
        it('should successfully process a financial assistance filtered list', () => {
          const massFinancialAssistanceDetailsPage = new MassFinancialAssistanceDetailsPage();
          massFinancialAssistanceDetailsPage.getMassActionProcessButton().should('be.visible');
          massFinancialAssistanceDetailsPage.getMassActionProcessButton().click();
          massFinancialAssistanceDetailsPage.getDialogSubmitButton().should('be.visible');
          massFinancialAssistanceDetailsPage.getDialogCancelButton().should('be.visible');
          massFinancialAssistanceDetailsPage.getDialogText().should('eq', 'Are you sure you want to start processing this mass action?');
          massFinancialAssistanceDetailsPage.confirmProcessing();
          massFinancialAssistanceDetailsPage.refreshUntilCurrentProcessCompleteWithLabelString(event.name.translation.en, ' Processed '); // waiting for processing to be done
          massFinancialAssistanceDetailsPage.getMassActionStatus().contains('Processed').should('be.visible');
          massFinancialAssistanceDetailsPage.getNumberFailedRecords().then((quantity) => {
            if (quantity === '0') {
              massFinancialAssistanceDetailsPage.getInvalidCasefilesDownloadButton().should('be.disabled');
            }
          cy.goTo(`casefile/${casefileId}`);

          const caseFileDetailsPage = new CaseFileDetailsPage();
          caseFileDetailsPage.getCaseFileActivityTitles().should('string', 'Financial assistance payment - Approved - Final');
          caseFileDetailsPage.getCaseFileActivityBodies().should('string', massFinancialAssistanceName).and('string', '$80.00');
          caseFileDetailsPage.goToFinancialAssistanceHomePage();

          const financialAssistanceHomePage = new FinancialAssistanceHomePage(); // initialising to avoid dependency cycle
          financialAssistanceHomePage.getFAPaymentName().should('eq', massFinancialAssistanceName);
          financialAssistanceHomePage.getFAPaymentCreatedDate().should('eq', format(Date.now(), 'yyyy-MM-dd'));
          financialAssistanceHomePage.getFAPaymentAmount().should('eq', '$80.00');
          financialAssistanceHomePage.getApprovalStatus().should('eq', 'Approved');
          financialAssistanceHomePage.expandFAPayment();
          financialAssistanceHomePage.getFAPaymentGroupTitle().should('string', 'Cheque');
          financialAssistanceHomePage.getFAPaymentGroupTotal().should('eq', '$80.00');
          financialAssistanceHomePage.getFAPaymentPaymentStatus().should('eq', 'Status: New');

          const financialAssistanceDetailsPage = financialAssistanceHomePage.getFAPayment();
          financialAssistanceDetailsPage.getPaymentLineStatus().should('eq', 'New');
          financialAssistanceDetailsPage.getPaymentAmount().should('string', '$80.00');
          financialAssistanceDetailsPage.getPaymentModalityGroup().should('string', 'Clothing > Winter Clothing');
          });
        });
      });
    }
  });
  describe('Cannot Roles', () => {
    for (const [roleName, roleValue] of Object.entries(cannotRoles)) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.login(roleValue);
          cy.goTo('mass-actions/financial-assistance');
        });
        it('should not be able to process a financial assistance filtered list', () => {
          cy.contains('You do not have permission to access this page').should('be.visible');
        });
      });
    }
  });
},
);
