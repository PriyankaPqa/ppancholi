import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { EFinancialAmountModes } from '@libs/entities-lib/financial-assistance';
import { IEligibilityCriteria } from '@libs/entities-lib/program';
import { IImpactStatusValidation, ImpactValidationMethod, ValidationOfImpactStatus } from '@libs/entities-lib/case-file';
import {
  createEventAndTeam,
  createProgramWithTableWithItemAndSubItem,
  prepareStateHousehold, updateValidationOfImpactStatus,
} from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { cannotPreProcessFaMassActionSteps } from './steps';

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

// eslint-disable-next-line
describe('#TC1506# - Record in Mass Action FA upload file fails pre-processing when Validation of Impact status check fails (Failed)', { tags: ['@financial-assistance', '@mass-actions'] }, () => {
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
            const resultHouseholdCreated = await prepareStateHousehold(accessTokenL6, this.event);
            cy.wrap(resultHouseholdCreated.registrationResponse.caseFile).as('caseFile');
            const params: IImpactStatusValidation = {
              method: ImpactValidationMethod.Manual,
              status: ValidationOfImpactStatus.NotImpacted,
            };
            await updateValidationOfImpactStatus(this.provider, resultHouseholdCreated.registrationResponse.caseFile.id, params);
            cy.login(roleName);
            cy.goTo('mass-actions/financial-assistance');
          });
        });

        it('should fail to pre-process financial assistance mass action for Case file does not meet program impacted criteria', function () {
          cannotPreProcessFaMassActionSteps({
            programName: this.programName,
            eventName: this.event.name.translation.en,
            filePath: 'cypress/downloads/TC1506FaFile.csv',
            retries: this.test.retries.length,
            errorMessage: 'Case file does not meet program impacted criteria',
            financialAssistanceTable: this.faTable,
            caseFile: this.caseFile,
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
        it('should not be able to pre-process a financial assistance Mass Action', () => {
          cy.contains('You do not have permission to access this page').should('be.visible');
        });
      });
    }
  });
});
