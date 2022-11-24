import { ActionContext, ActionTree } from 'vuex';
import { IAddress } from '@libs/entities-lib/value-objects/address';
import { IHouseholdEntity } from '@libs/entities-lib/household';
import utils from '@libs/entities-lib/value-objects/versioned-entity/versionedEntityUtils';
import { IVersionedEntity, IVersionedEntityCombined } from '@libs/entities-lib/value-objects/versioned-entity/versionedEntity.types';
import { HouseholdsService } from '@libs/services-lib/households/entity';
import { BaseModule, IState } from '../base';

import { IRootState } from '../../store.types';
import { IHouseholdEntityState } from './householdEntity.types';

export class HouseholdEntityModule extends BaseModule <IHouseholdEntity, uuid> {
  constructor(readonly service: HouseholdsService) {
    super(service);
  }

  public getModule = () => ({
    namespaced: true,
    state: this.state,
    getters: this.getters,
    mutations: this.mutations,
    actions: this.actions as unknown as ActionTree<IState<IHouseholdEntity>, IRootState>,
  });

  public state = {
    ...this.baseState,
    searchResultsShown: false,
  };

  public getters = {
    ...this.baseGetters,
  };

  public mutations = {
    ...this.baseMutations,

    setSearchResultsShown(state: IHouseholdEntityState, payload: boolean) {
      state.searchResultsShown = payload;
    },
  };

  public actions = {
    ...this.baseActions,

    updateNoFixedHomeAddress: async (
      context: ActionContext<IHouseholdEntityState, IHouseholdEntityState>,
      { householdId, observation }: { householdId: string; observation: string },
    ): Promise<IHouseholdEntity> => {
      const res = await this.service.updateNoFixedHomeAddress(householdId, observation);
      if (res) {
        context.commit('set', res);
      }
      return res;
    },

    updateHomeAddress: async (
      context: ActionContext<IHouseholdEntityState, IHouseholdEntityState>,
      { householdId, address }: { householdId: string; address: IAddress },
    ): Promise<IHouseholdEntity> => {
      const res = await this.service.updateHomeAddress(householdId, address);
      if (res) {
        context.commit('set', res);
      }
      return res;
    },

    fetchHouseholdHistory: async (
      context: ActionContext<IHouseholdEntityState, IHouseholdEntityState>,
      household: IHouseholdEntity,
    ): Promise<IVersionedEntityCombined[]> => {
      const householdEntityRequest = this.service.getHouseholdHistory(household.id);
      const householdMetadataRequest = this.service.getHouseholdMetadataHistory(household.id);

      // Fetch  history from the entity and metadata endpoints for household
      const [householdEntityResponse, householdMetadataResponse] = await Promise.all([householdEntityRequest, householdMetadataRequest]);

      // Add the type of change 'household' to the household history items
      const hhEntityResponse = householdEntityResponse?.map((r) => {
        r.entityType = 'household';
        return r;
      });

      const allMemberIds = householdEntityResponse.reduce((acc, versionedEntity) => acc.concat((versionedEntity.entity as IHouseholdEntity).members), []);
      const uniqueMemberIds = [...new Set(allMemberIds)];

      const memberEntityRequests = [] as Promise<IVersionedEntity[]>[];
      const memberMetadataRequests = [] as Promise<IVersionedEntity[]>[];
      uniqueMemberIds.forEach((memberId) => {
        memberEntityRequests.push(this.service.getMemberHistory(memberId));
        memberMetadataRequests.push(this.service.getMemberMetadataHistory(memberId));
      });

      // Fetch all history from the entity and metadata endpoints for household and all members
      const [membersEntityResponses, membersMetadataResponses] = await Promise.all([
        Promise.all(memberEntityRequests),
        Promise.all(memberMetadataRequests),
      ]);

      // Add the type of change 'householdMember' to all the member history items
      const mEntityResponses = membersEntityResponses?.map((responses) => responses.map((r) => {
        r.entityType = 'householdMember';
        return r;
      }));

      // add the previous entity to each history item and order them chronologically
      const mappedEntityResponses: IVersionedEntity[] = utils.mapResponses([hhEntityResponse, ...mEntityResponses]);
      const mappedMetadataResponses = utils.mapResponses([householdMetadataResponse, ...membersMetadataResponses]);

      // Combine the entities and metadata history items into one object
      const combinedEntities: IVersionedEntityCombined[] = utils.combineEntities(mappedEntityResponses, mappedMetadataResponses);

      return combinedEntities;
    },
  };
}
