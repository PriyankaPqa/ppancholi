import { UserRoles } from '@libs/cypress-lib/support/msal';
import { ICaseFileEntity } from '@libs/entities-lib/case-file';
import { EFinancialAmountModes } from '@libs/entities-lib/financial-assistance';
import { ICreateHouseholdRequest } from '@libs/entities-lib/household-create';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { fixtureChequePaymentLine } from '../../../fixtures/financial-assistance';
import { prepareStateHousehold, prepareStateEventTeamProgramTableWithItemSubItem } from '../../helpers/prepareState';
import { AddFinancialAssistancePage } from '../../../pages/financial-assistance-payment/addFinancialAssistance.page';
import { paymentLineChequeCanSteps } from './canSteps';

let caseFileCreated = null as ICaseFileEntity;
let accessTokenL6 = '';
let householdCreated = null as ICreateHouseholdRequest;

const canRoles = {
  Level6: UserRoles.level6,
  Level5: UserRoles.level5,
  Level4: UserRoles.level4,
  Level3: UserRoles.level3,
  Level2: UserRoles.level2,
  Level1: UserRoles.level1,
};

// dummy

const cannotRoles = {
  Level0: UserRoles.level0,
  Contributor1: UserRoles.contributor1,
  Contributor2: UserRoles.contributor2,
  Contributor3: UserRoles.contributor3,
  ReadOnly: UserRoles.readonly,
};

const allRolesValues = [...Object.values(canRoles), ...Object.values(cannotRoles)];

describe('#TC205# - Create Cheque Payment Line', { tags: ['@financial-assistance', '@mass-actions'] }, () => {
  before(() => {
    cy.getToken().then(async (tokenResponse) => {
      accessTokenL6 = tokenResponse.access_token;
      const resultPrepareStateEventTeamProgramTable = await prepareStateEventTeamProgramTableWithItemSubItem(accessTokenL6, allRolesValues, EFinancialAmountModes.Fixed);
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
    for (const [roleName, roleValue] of Object.entries(canRoles)) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.then(async function () {
            const result = await prepareStateHousehold(accessTokenL6, this.event);
            caseFileCreated = result.registrationResponse.caseFile;
            householdCreated = result.mockCreateHousehold;
            cy.login(roleValue);
            cy.goTo(`casefile/${caseFileCreated.id}/financialAssistance/create`);
          });
        });
        it('should successfully create Cheque Payment Line', function () {
          paymentLineChequeCanSteps({
            faTable: this.table,
            retries: this.test.retries.length,
            paymentLineData: fixtureChequePaymentLine(),
            groupTitle: 'Cheque',
            household: householdCreated,
          });
        });
      });
    }
  });
  describe('Cannot Roles', () => {
    for (const [roleName, roleValue] of Object.entries(cannotRoles)) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.then(async function () {
            const result = await prepareStateHousehold(accessTokenL6, this.event);
            caseFileCreated = result.registrationResponse.caseFile;
            cy.login(roleValue);
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
