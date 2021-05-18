import {
  ITeamData, ITeamSearchData, ITeamSearchDataAggregate,
} from '@/entities/team';
import { ActionContext } from 'vuex';
import { EEventStatus, IEvent } from '@/entities/event';
import utils from '@/entities/utils';
import { IProvider, IProviderMock } from '@/services/provider';
import { IState } from './team.types';
import { IRootState } from '../../store.types';

// map cached events with team events ids from the payload
export const retrieveTeamEvents = (eventsIds: Array<uuid>, context: ActionContext<IState, IRootState>): IEvent[] => {
  const events = context.rootGetters['event/eventsByStatus']([EEventStatus.Open, EEventStatus.OnHold]);
  return eventsIds.map((id) => events.find((e: IEvent) => e.id === id));
};

export const aggregateTeamSearchDataWithMembers = async (
  services: IProvider | IProviderMock,
  team: ITeamSearchData,
): Promise<ITeamSearchDataAggregate> => {
  const aggregate: ITeamSearchDataAggregate = {
    ...team,
    teamMembers: [],
  };

  const teamMemberIds = team.teamMembers.map((t) => t.id);

  if (teamMemberIds.length) {
    const filter = `search.in(UserAccountId, '${teamMemberIds.join('|')}', '|')`;

    const teamMembers = await services.userAccounts.searchUserAccounts({
      filter,
    });

    aggregate.teamMembers = teamMembers.value.map((t) => {
      const member = team.teamMembers.find((member) => member.id === t.userAccountId);

      return {
        ...t,
        isPrimaryContact: member.isPrimaryContact,
      };
    });
  }

  return aggregate;
};

export const buildTeamSearchDataPayload = async (
  payload: ITeamData,
  context: ActionContext<IState, IRootState>,
  services: IProvider | IProviderMock,
) : Promise<ITeamSearchDataAggregate> => {
  const team: ITeamSearchData = {
    teamId: payload.id,
    tenantId: context.state.team.tenantId,
    teamName: payload.name,
    teamType: payload.teamType,
    teamTypeName: utils.initMultilingualAttributes(context.state.team.teamTypeName),
    eventCount: context.state.team.eventCount,
    primaryContactDisplayName: context.state.team.primaryContactDisplayName,
    teamMemberCount: context.state.team.teamMemberCount,
    events: retrieveTeamEvents(payload.eventIds, context),
    teamStatus: payload.status,
    teamMembers: payload.teamMembers,
    teamStatusName: utils.initMultilingualAttributes(context.state.team.statusName),
  };

  const aggregate = await aggregateTeamSearchDataWithMembers(services, team);

  return aggregate;
};
