import { IProvider } from '@/services/provider';
import { mockCreateEvent } from '@libs/cypress-lib/mocks/events/event';
import { mockCreateAssessmentRequest } from '@libs/cypress-lib/mocks/events/assessment';
import { UserRoles } from '@libs/cypress-lib/support/msal';
import { mockProgram } from '@libs/cypress-lib/mocks/programs/program';
import { mockCreateFinancialAssistanceTableRequest } from '@libs/cypress-lib/mocks/financialAssistance/financialAssistanceTables';
import { useProvider } from 'cypress/provider/provider';
import { IEventEntity } from '@libs/entities-lib/event';
import { mockCreateHouseholdRequest } from '@libs/cypress-lib/mocks/household/household';
import { mockCreateMassFinancialAssistanceRequest } from '@libs/cypress-lib/mocks/mass-actions/massFinancialAssistance';
import { linkEventToTeamForManyRoles } from './teams';

/**
 * Creates a event, add a team to it, and assign roles to this team
 * @param provider
 * @param roles
 */
export const createEventWithTeamWithUsers = async (provider: IProvider, roles = Object.values(UserRoles)) => {
  const event = await provider.events.createEvent(mockCreateEvent());
  const team = await linkEventToTeamForManyRoles(event, provider, roles);
  return { event, team };
};

/**
 * Creates a program
 * @param provider
 * @param eventId
 */
export const createProgram = async (provider: IProvider, eventId: string) => {
  const mockCreateProgram = mockProgram({ eventId });
  const program = await provider.programs.createProgram(mockCreateProgram);
  return { program, mockCreateProgram };
};

/**
 * Creates a household
 * @param accessToken
 * @param event
 */
export const createHousehold = async (provider: IProvider, event: IEventEntity) => {
  const mockCreateHousehold = mockCreateHouseholdRequest({ eventId: event.id });
  const registrationResponse = await provider.households.postCrcRegistration(mockCreateHousehold);
  return { registrationResponse, mockCreateHousehold };
};

/**
 * Creates a program, adds financial assistance table to it with an Item and Sub-item
 * @param provider
 * @param eventId
 */
export const createProgramWithTableWithItemAndSubItem = async (provider: IProvider, eventId: string) => {
  const { program, mockCreateProgram } = await createProgram(provider, eventId);
  const mockCreateFinancialAssistanceTable = mockCreateFinancialAssistanceTableRequest({ eventId, programId: program.id });
  const table = await provider.financialAssistanceTables.createFinancialAssistanceTable(mockCreateFinancialAssistanceTable);
  return { program, mockCreateProgram, table };
};

/**
 * Creates one household
 * @param accessToken
 * @param event
 */
export const prepareStateHousehold = async (accessToken: string, event: IEventEntity) => {
  const provider = useProvider(accessToken);
  const { registrationResponse, mockCreateHousehold } = await createHousehold(provider, event);
  return { provider, registrationResponse, mockCreateHousehold };
};

/**
 * Creates multiple households
 * @param accessToken
 * @param event
 * @param caseFilesNeeded
 */
export const prepareStateMultipleHouseholds = async (accessToken: string, event: IEventEntity, householdQuantity: number) => {
  const provider = useProvider(accessToken);
  const householdArray = Array.from({ length: householdQuantity }, async () => {
    const { registrationResponse, mockCreateHousehold } = await createHousehold(provider, event);
    return { registrationResponse, mockCreateHousehold };
  });
  const householdsCreated = await Promise.all(householdArray);
  const extractedResults = householdsCreated.map(({ registrationResponse, mockCreateHousehold }) => ({ registrationResponse, mockCreateHousehold }));
  return { provider, householdsCreated: extractedResults, householdQuantity };
};

/**
 * Creates a event, add a team to it, assign roles to this team and creates a program for that event
 * @param accessToken
 * @param allRolesValues
 */
export const prepareStateEventAndProgram = async (accessToken: string, allRolesValues: UserRoles[]) => {
  const provider = useProvider(accessToken);
  const { event, team } = await createEventWithTeamWithUsers(provider, allRolesValues);
  const { program, mockCreateProgram } = await createProgram(provider, event.id);
  return { provider, event, team, mockCreateProgram, program };
};

/**
 * Creates a event, add a team to it, and assign roles to this team using inbuilt provider
 * @param accessToken
 * @param allRolesValues
 */
export const createEventAndTeam = async (accessToken: string, allRolesValues: UserRoles[]) => {
  const provider = useProvider(accessToken);
  const { event, team } = await createEventWithTeamWithUsers(provider, allRolesValues);
  return { provider, event, team };
};

/**
 * Creates an assessment
 * @param provider
 * @param eventId
 * @param programId
 */
export const createAssessment = async (provider: IProvider, eventId: string, programId: string) => {
  const mockCreateAssessment = mockCreateAssessmentRequest({ eventId, programId });
  const assessment = await provider.assessmentForms.create(mockCreateAssessment);
  return { assessment };
};

// verifies if casefile created is indexed through search and wait
const searchCasefileAndWait = async (provider: IProvider, caseFileId: string, maxAttempt = 10): Promise<number> => {
  let searchResult = 0;
  let attempt = 0;
  const waitForCaseFileIndexToBeUpdated = async (): Promise<number> => {
    if (searchResult === 1) {
      cy.log('Casefile index successfully updated');
    } else if (attempt < maxAttempt) {
        const search = await provider.caseFiles.search({
          filter: { Entity: { Id: caseFileId } },
          top: 999,
        });
        searchResult = search.odataCount;
        attempt += 1;
        if (searchResult === 0) {
          // eslint-disable-next-line
          cy.wait(500)
          cy.log(`casefile index search attempt ${attempt}`);
          return waitForCaseFileIndexToBeUpdated();
        }
      } else {
        throw new Error(`Failed to search for index after ${maxAttempt} retries.`);
      } return searchResult;
  };
  return waitForCaseFileIndexToBeUpdated();
};

/**
 * Creates a Mass Financial Assistance
 * @param provider
 * @param event
 * @param eventId
 * @param tableId
 * @param programId
 */
// eslint-disable-next-line
export const prepareStateHouseholdMassFinancialAssistance = async (accessToken: string, event:IEventEntity, eventId: string, tableId: string, programId: string) => {
  const provider = useProvider(accessToken);
  const responseCreateHousehold = await createHousehold(provider, event);
  const caseFileId = responseCreateHousehold.registrationResponse.caseFile.id;
  const searchResult = await searchCasefileAndWait(provider, caseFileId);
  if (searchResult === 1) {
    const mockCreateMassFinancialAssistance = mockCreateMassFinancialAssistanceRequest(event, { eventId, tableId, programId });
    const responseMassFinancialAssistance = await provider.massActions.create('financial-assistance-from-list', mockCreateMassFinancialAssistance);
    return { responseMassFinancialAssistance, responseCreateHousehold };
  }
    throw new Error('Casefile index not yet updated');
};
