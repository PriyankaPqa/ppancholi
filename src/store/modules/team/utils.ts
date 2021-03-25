import {
  ITeamSearchData, ITeamData, ITeamMember,
} from '@/entities/team';
import { ActionContext } from 'vuex';
import { IEvent } from '@/entities/event';
import { IState } from './team.types';
import { IRootState } from '../../store.types';

// Retrieve app users from cache to map with team members ids from the payload
export const retrieveTeamMembers = (
  members: Array<{ id: uuid; isPrimaryContact: boolean }>,
  context: ActionContext<IState, IRootState>,
): ITeamMember[] => members.map((m) => {
  const member = context.rootGetters['appUser/appUserWhere']('id', m.id);
  return { ...member, isPrimaryContact: m.isPrimaryContact };
});

// map cached events with team events ids from the payload
export const retrieveTeamEvents = (
  eventsIds: Array<uuid>,
  context: ActionContext<IState, IRootState>,
): IEvent[] => eventsIds.map((id) => {
  const openEvents = context.rootGetters['event/openEvents'];
  return openEvents.find((e: IEvent) => e.id === id);
});

export const buildTeamSearchDataPayload = (payload: ITeamData, context: ActionContext<IState, IRootState>) : ITeamSearchData => ({
  teamId: payload.id,
  tenantId: context.state.team.tenantId,
  teamName: payload.name,
  teamType: payload.teamType,
  teamTypeName: context.state.team.teamTypeName,
  eventCount: context.state.team.eventCount,
  primaryContactDisplayName: context.state.team.primaryContactDisplayName,
  teamMemberCount: context.state.team.teamMemberCount,
  events: retrieveTeamEvents(payload.eventIds, context),
  teamStatus: payload.status,
  teamMembers: retrieveTeamMembers(payload.teamMembers, context),
});
