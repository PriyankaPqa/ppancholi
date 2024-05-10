import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { ICaseFileEntity } from '@libs/entities-lib/case-file';
import { EFinancialAmountModes } from '@libs/entities-lib/financial-assistance';
import { ICreateHouseholdRequest } from '@libs/entities-lib/household-create';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { fixtureChequePaymentLine } from '../../../fixtures/financial-assistance';
import { prepareStateHousehold, prepareStateEventTeamProgramTableWithItemSubItem } from '../../helpers/prepareState';
import { AddFinancialAssistancePage } from '../../../pages/financial-assistance-payment/addFinancialAssistance.page';
import { PaymentLineCanStepsParams, paymentLineChequeCanSteps } from './canSteps';

let caseFileCreated = null as ICaseFileEntity;
let accessTokenL6 = '';
let householdCreated = null as ICreateHouseholdRequest;

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

describe('[T28310] Create Cheque Payment Line.', { tags: ['@financial-assistance'] }, () => {
  before(() => {
    cy.getToken().then(async (tokenResponse) => {
      accessTokenL6 = tokenResponse.access_token;
      const resultPrepareStateEventTeamProgramTable = await prepareStateEventTeamProgramTableWithItemSubItem(accessTokenL6, allRoles, EFinancialAmountModes.Fixed);
      cy.wrap(resultPrepareStateEventTeamProgramTable.event).as('event');
      cy.wrap(resultPrepareStateEventTeamProgramTable.table).as('table');
      cy.wrap(resultPrepareStateEventTeamProgramTable.provider).as('provider');
      cy.wrap(resultPrepareStateEventTeamProgramTable.team).as('teamCreated');
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
          cy.then(async function () {
            const result = await prepareStateHousehold(accessTokenL6, this.event);
            caseFileCreated = result.registrationResponse.caseFile;
            householdCreated = result.mockCreateHousehold;
            cy.login(roleName);
            cy.goTo(`casefile/${caseFileCreated.id}/financialAssistance/create`);
          });
        });
        it('should successfully create Cheque Payment Line', function () {
          const canStepsParamData: Partial<PaymentLineCanStepsParams> = {
            faTable: this.table,
            retries: this.test.retries.length,
            paymentLineData: fixtureChequePaymentLine(),
            groupTitle: 'Cheque',
            household: householdCreated,
          };
          paymentLineChequeCanSteps(canStepsParamData);
        });
      });
    }
  });
  describe('Cannot Roles', () => {
     for (const roleName of filteredCannotRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.then(async function () {
            const result = await prepareStateHousehold(accessTokenL6, this.event);
            caseFileCreated = result.registrationResponse.caseFile;
            cy.login(roleName);
            cy.goTo(`casefile/${caseFileCreated.id}/financialAssistance/create`);
          });
        });
        it('should not be able to create Cheque Payment Line', () => {
          const addFinancialAssistancePage = new AddFinancialAssistancePage();

          cy.contains('You do not have permission to access this page').should('be.visible');
          addFinancialAssistancePage.getTableSelectField().should('not.exist');
        });
      });
    }
  });
});
