import { IProvider } from '@/services/provider';
import { mockCreateEvent } from '@libs/cypress-lib/mocks/events/event';
import { UserRoles } from '@libs/cypress-lib/support/msal';
import { mockProgram } from '@libs/cypress-lib/mocks/programs/program';
import { mockCreateFinancialAssistanceTableRequest } from '@libs/cypress-lib/mocks/financialAssistanceTables/financialAssistanceTables';
import { useProvider } from 'cypress/provider/provider';
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

export const createProgramWithTableWithItemAndSubItem = async (provider: IProvider, eventId: string) => {
  const mockCreateProgram = mockProgram({ eventId });
  const program = await provider.programs.createProgram(mockCreateProgram);
  const mockCreateFinancialAssistanceTable = mockCreateFinancialAssistanceTableRequest({ eventId, programId: program.id });
  const table = await provider.financialAssistanceTables.createFinancialAssistanceTable(mockCreateFinancialAssistanceTable);
  return table;
};

export const prepareStateEventAndProgram = async (accessToken: string, allRolesValues: UserRoles[]) => {
  const provider = useProvider(accessToken);
  const { event, team } = await createEventWithTeamWithUsers(provider, allRolesValues);
  const mockCreateProgram = mockProgram({ eventId: event.id });
  await provider.programs.createProgram(mockCreateProgram);
  return { provider, event, team, mockCreateProgram };
};
