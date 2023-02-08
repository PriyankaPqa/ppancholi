import { UserRoles } from '@libs/entities-lib/user';
import { IProvider } from '@/services/provider';
import { mockCreateEvent } from '@libs/cypress-lib/mocks/events/event';
import { linkEventToTeamForManyRoles } from './teams';

/**
 * Creates a event, add a team to it, and assign roles to this team
 * @param provider
 * @param roles
 */
export const createEventWithTeamWithUsers = async (provider: IProvider, roles = UserRoles) => {
  const assignedRoles = Object.values(roles);
  const event = await provider.events.createEvent(mockCreateEvent());
  await linkEventToTeamForManyRoles(event, provider, assignedRoles);
  return event;
};
