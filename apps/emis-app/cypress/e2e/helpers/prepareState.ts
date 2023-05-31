import { IProvider } from '@/services/provider';
import { mockCreateEvent } from '@libs/cypress-lib/mocks/events/event';
import { mockCreateAssessmentRequest } from '@libs/cypress-lib/mocks/events/assessment';
import { UserRoles } from '@libs/cypress-lib/support/msal';
import { mockProgram } from '@libs/cypress-lib/mocks/programs/program';
import { mockCreateFinancialAssistanceTableRequest } from '@libs/cypress-lib/mocks/financialAssistance/financialAssistanceTables';
import { useProvider } from 'cypress/provider/provider';
import { IEventEntity } from '@libs/entities-lib/event';
import { mockCreateHouseholdRequest } from '@libs/cypress-lib/mocks/household/household';
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
 * Creates a household
 * @param accessToken
 * @param event
 */
export const prepareStateHousehold = async (accessToken: string, event: IEventEntity) => {
  const provider = useProvider(accessToken);
  const mockCreateHousehold = mockCreateHouseholdRequest({ eventId: event.id });
  const registrationResponse = await provider.households.postCrcRegistration(mockCreateHousehold);
  return { provider, registrationResponse, mockCreateHousehold };
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
