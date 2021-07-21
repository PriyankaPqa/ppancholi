import { CaseFileReferralsService } from '@/services/case-file-referrals/entity';
import { ActionContext, ActionTree } from 'vuex';
import _cloneDeep from 'lodash/cloneDeep';
import {
  EOptionLists,
  IOptionItem,
} from '@/entities/optionItem';
import { IOptionItemsService } from '@/services/optionItems';
import { ICaseFileReferralEntity } from '@/entities/case-file-referral';
import { BaseModule, filterAndSortActiveItems } from '../base';
import { IRootState } from '../../store.types';
import { IState } from '../base/base.types';
import { ICaseFileReferralEntityState } from './caseFileReferralEntity.types';

export class CaseFileReferralEntityModule extends BaseModule <ICaseFileReferralEntity, { id: uuid, caseFileId: uuid }> {
  constructor(readonly service: CaseFileReferralsService, readonly optionItemService: IOptionItemsService) {
    super(service);
  }

  public getModule = () => ({
    namespaced: true,
    state: this.state,
    getters: this.getters,
    mutations: this.mutations,
    actions: this.actions as unknown as ActionTree<IState<ICaseFileReferralEntity>, IRootState>,
  })

  public state = {
    ...this.baseState,
    types: []as IOptionItem[],
    outcomeStatuses: []as IOptionItem[],
    typesFetched: false,
    outcomeStatusesFetched: false,
  }

  public getters = {
    ...this.baseGetters,

    // eslint-disable-next-line
    types: (state:ICaseFileReferralEntityState) => (filterOutInactive = true, actualValue?: string[] | string) => filterAndSortActiveItems(state.types, filterOutInactive, actualValue),

    // eslint-disable-next-line
    outcomeStatuses: (state:ICaseFileReferralEntityState) => (filterOutInactive = true, actualValue?: string[] | string) => filterAndSortActiveItems(state.outcomeStatuses, filterOutInactive, actualValue),

    getByCaseFile: (state: ICaseFileReferralEntityState) => (caseFileId: uuid) => _cloneDeep(state.items.filter((x) => x.caseFileId === caseFileId)),
  }

  public mutations = {
    ...this.baseMutations,

    setTypes(state: ICaseFileReferralEntityState, payload: Array<IOptionItem>) {
      state.types = payload;
    },

    setTypesFetched(state: ICaseFileReferralEntityState, payload: boolean) {
      state.typesFetched = payload;
    },

    setOutcomeStatuses(state: ICaseFileReferralEntityState, payload: Array<IOptionItem>) {
      state.outcomeStatuses = payload;
    },

    setOutcomeStatusesFetched(state: ICaseFileReferralEntityState, payload: boolean) {
      state.outcomeStatusesFetched = payload;
    },
  }

  public actions = {
    ...this.baseActions,

    fetchTypes: async (context: ActionContext<ICaseFileReferralEntityState, ICaseFileReferralEntityState>): Promise<IOptionItem[]> => {
      if (!context.state.typesFetched) {
        const data = await this.optionItemService.getOptionList(EOptionLists.ReferralTypes);
        context.commit('setTypes', data);
        context.commit('setTypesFetched', true);
      }
      return context.getters.types();
    },

    fetchOutcomeStatuses: async (context: ActionContext<ICaseFileReferralEntityState, ICaseFileReferralEntityState>): Promise<IOptionItem[]> => {
      if (!context.state.outcomeStatusesFetched) {
        const data = await this.optionItemService.getOptionList(EOptionLists.ReferralOutcomeStatus);
        context.commit('setOutcomeStatuses', data);
        context.commit('setOutcomeStatusesFetched', true);
      }
      return context.getters.outcomeStatuses();
    },

    createReferral: async (context: ActionContext<ICaseFileReferralEntityState, ICaseFileReferralEntityState>,
      payload: ICaseFileReferralEntity): Promise<ICaseFileReferralEntity> => {
      const result = await this.service.createReferral(payload);
      if (result) {
        context.commit('set', result);
      }
      return result;
    },

    updateReferral: async (context: ActionContext<ICaseFileReferralEntityState, ICaseFileReferralEntityState>,
      payload: ICaseFileReferralEntity): Promise<ICaseFileReferralEntity> => {
      const result = await this.service.updateReferral(payload);
      if (result) {
        context.commit('set', result);
      }
      return result;
    },
  }
}
