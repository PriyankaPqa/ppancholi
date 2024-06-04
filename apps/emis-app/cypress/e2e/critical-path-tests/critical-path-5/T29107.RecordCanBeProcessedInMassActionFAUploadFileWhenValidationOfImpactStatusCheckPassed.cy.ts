import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { EFinancialAmountModes } from '@libs/entities-lib/financial-assistance';
import { IMassActionEntity } from '@libs/entities-lib/mass-action';
import { IEligibilityCriteria, ProgramEntity } from '@libs/entities-lib/program';
import {
  IImpactStatusValidation,
  ImpactValidationMethod, ValidationOfImpactStatus,
} from '@libs/entities-lib/case-file';
import {
  createEventAndTeam,
  createProgramWithTableWithItemAndSubItem, MassActionFinancialAssistanceUploadFileParams,
  prepareStateMassActionFinancialAssistanceUploadFile, updateProgram, updateValidationOfImpactStatus,
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
  '[T29107] Record can be processed Mass Action FA upload file when Validation of Impact status check passed (Impacted)',
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
            const massActionFaUploadFileParamData: MassActionFinancialAssistanceUploadFileParams = {
              accessToken: accessTokenL6,
              event: this.event,
              tableId: this.faTable.id,
              programId: this.program.id,
              householdQuantity,
              filePath: 'cypress/downloads/TC1966FaFile.csv',
            };
            const resultMassFinancialAssistance = await prepareStateMassActionFinancialAssistanceUploadFile(massActionFaUploadFileParamData);
            const { responseMassFinancialAssistance, responseCreateHouseholds } = resultMassFinancialAssistance;
            massFinancialAssistance = responseMassFinancialAssistance;
            const caseFileId = responseCreateHouseholds.householdsCreated[0].registrationResponse.caseFile.id;
            const eligibilityCriteria: IEligibilityCriteria = {
              authenticated: false,
              impacted: true,
              completedAssessments: false,
              completedAssessmentIds: [],
            };
            const updateProgramEntity = new ProgramEntity({ ...this.program, eligibilityCriteria });
            await updateProgram(this.provider, updateProgramEntity);
            const params: IImpactStatusValidation = {
              method: ImpactValidationMethod.Manual,
              status: ValidationOfImpactStatus.Impacted,
            };
            await updateValidationOfImpactStatus(this.provider, caseFileId, params);
            cy.login(roleName);
            cy.goTo(`mass-actions/financial-assistance/details/${resultMassFinancialAssistance.responseMassFinancialAssistance.id}`);
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
