import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { EFinancialAmountModes } from '@libs/entities-lib/financial-assistance';
import { IEligibilityCriteria } from '@libs/entities-lib/program';
import { IdentityAuthenticationMethod, IdentityAuthenticationStatus, IIdentityAuthentication } from '@libs/entities-lib/case-file';
import { createEventAndTeam, createProgramWithTableWithItemAndSubItem, prepareStateHousehold, updateAuthenticationOfIdentity } from '../../helpers/prepareState';
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

describe('#TC1857# - Mass Action FA upload file passes pre-processing when Authentication status check passes', { tags: ['@financial-assistance', '@mass-actions'] }, () => {
  before(() => {
    cy.getToken().then(async (tokenResponse) => {
      accessTokenL6 = tokenResponse.access_token;
      const resultCreatedEvent = await createEventAndTeam(accessTokenL6, allRoles);
      const eligibilityCriteria: IEligibilityCriteria = {
        authenticated: true,
        impacted: false,
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
            const resultHousehold = await prepareStateHousehold(accessTokenL6, this.event);
            cy.wrap(resultHousehold.registrationResponse.caseFile).as('caseFile');
            cy.wrap(resultHousehold.registrationResponse.caseFile.id).as('caseFileId');
            cy.wrap(resultHousehold.registrationResponse.caseFile.caseFileNumber).as('caseFileNumber');
            const params: IIdentityAuthentication = {
              identificationIds: [{
                optionItemId: '72b7957c-7091-402e-bf87-25047d10a9a5',
                specifiedOther: null,
               }],
              method: IdentityAuthenticationMethod.InPerson,
              status: IdentityAuthenticationStatus.Passed,
            };
            await updateAuthenticationOfIdentity(this.provider, resultHousehold.registrationResponse.caseFile.id, params);
            cy.login(roleName);
            cy.goTo('mass-actions/financial-assistance');
          });
        });

        it('should successfully upload file and passes pre-processing', function () {
          massActionFinancialAssistanceUploadFilePassesPreProcessCanSteps({
            caseFile: this.caseFile,
            event: this.event,
            faTable: this.faTable,
            filePath: 'cypress/downloads/TC1857FaFile.csv',
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
});
