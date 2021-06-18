import {
  ITeamData, ITeamMemberSearchData, ITeamSearchData, ITeamSearchDataAggregate,
} from '@/entities/team';
import { ActionContext } from 'vuex';
import { EEventStatus, IEvent } from '@/entities/event';
import utils from '@/entities/utils';
import { USER_ACCOUNT_ENTITIES, USER_ACCOUNT_METADATA } from '@/constants/vuex-modules';
import { IUserAccountCombined, IUserAccountEntity, IUserAccountMetadata } from '@/entities/user-account';
import { IState } from './team.types';
import { IRootState } from '../../store.types';

// map cached events with team events ids from the payload
export const retrieveTeamEvents = (eventsIds: Array<uuid>, context: ActionContext<IState, IRootState>): IEvent[] => {
  const events = context.rootGetters['event/eventsByStatus']([EEventStatus.Open, EEventStatus.OnHold]);
  return eventsIds.map((id) => events.find((e: IEvent) => e.id === id));
};

export const aggregateTeamSearchDataWithMembers = async (
  context: ActionContext<IState, IRootState>,
  team: ITeamSearchData,
): Promise<ITeamSearchDataAggregate> => {
  const teamMemberIds = team.teamMembers.map((t) => t.id);
  const aggregate: ITeamSearchDataAggregate = {
    ...team,
    teamMembers: [],
  };

  if (teamMemberIds.length === 0) {
    return aggregate;
  }

  const userAccountEntities = await context.dispatch(`${USER_ACCOUNT_ENTITIES}/fetchAll`, {}, { root: true });
  const userAccountMetadata = await context.dispatch(`${USER_ACCOUNT_METADATA}/fetchAll`, {}, { root: true });

  const combinedUserAccounts = userAccountEntities.map((e: IUserAccountEntity) => {
    const match = userAccountMetadata.find((m: IUserAccountMetadata) => m.id === e.id);
    return {
      entity: e,
      metadata: match,
    };
  });

  aggregate.teamMembers = team.teamMembers.map((t: ITeamMemberSearchData) => {
    const userAccount = combinedUserAccounts.find((userAccount: IUserAccountCombined) => userAccount.entity.id === t.id);
    let entity = null;
    if (userAccount?.entity) {
      entity = {
        ...userAccount.entity,
        ...userAccount.metadata,
        isPrimaryContact: t.isPrimaryContact,
      };
    }
    return entity;
  }).filter((e) => e != null);

  return aggregate;
};

export const buildTeamSearchDataPayload = async (
  payload: ITeamData,
  context: ActionContext<IState, IRootState>,
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

  const aggregate = await aggregateTeamSearchDataWithMembers(context, team);

  return aggregate;
};
