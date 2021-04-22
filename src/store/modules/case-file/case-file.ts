import {
  Store, Module, ActionContext, ActionTree,
} from 'vuex';
import _findIndex from 'lodash/findIndex';

import { IRootState } from '@/store/store.types';
import { CaseFile, ICaseFile } from '@/entities/case-file';
import { IAzureSearchParams, IAzureSearchResult } from '@/types';
import { IState } from './case-file.types';
import { ICaseFileSearchData } from '../../../entities/case-file/case-file.types';

const getDefaultState = (): IState => ({
  caseFiles: [],
  searchLoading: false,
  getLoading: false,
});

const moduleState: IState = getDefaultState();

const getters = {
  caseFileById: (state: IState) => (id: uuid) => {
    const caseFile = state.caseFiles.find((cf) => cf.id === id);
    if (caseFile) {
      return caseFile;
    }
    return null;
  },

};

const mutations = {
  addOrUpdateCaseFile(state: IState, payload: ICaseFile) {
    const index = _findIndex(state.caseFiles, { id: payload.id });

    if (index > -1) {
      state.caseFiles = [
        ...state.caseFiles.slice(0, index),
        payload,
        ...state.caseFiles.slice(index + 1),
      ];
    } else {
      state.caseFiles.push(payload);
    }
  },

  setGetLoading(state: IState, payload: boolean) {
    state.getLoading = payload;
  },

  setSearchLoading(state: IState, payload: boolean) {
    state.searchLoading = payload;
  },
};

const actions = {

  async fetchCaseFile(this: Store<IState>, context: ActionContext<IState, IState>, id: uuid): Promise<ICaseFile> {
    const caseFile = context.state.caseFiles.find((cf) => cf.id === id);

    if (caseFile) {
      return caseFile;
    }

    try {
      context.commit('setGetLoading', true);

      const params = { filter: { CaseFileId: id } };
      const res = await this.$services.caseFiles.searchCaseFiles(params);

      if (res?.value.length === 1) {
        const data = res.value[0];
        context.commit('addOrUpdateCaseFile', new CaseFile(data));
        return new CaseFile(data);
      }
      return null;
    } finally {
      context.commit('setGetLoading', false);
    }
  },

  async searchCaseFiles(
    this: Store<IState>,
    context: ActionContext<IState, IState>,
    params: IAzureSearchParams,
  ): Promise<IAzureSearchResult<ICaseFile>> {
    try {
      context.commit('setSearchLoading', true);
      const res = await this.$services.caseFiles.searchCaseFiles(params);
      const data = res?.value;

      const value = data.map((cf: ICaseFileSearchData) => new CaseFile(cf));

      value.forEach((cf) => context.commit('addOrUpdateCaseFile', cf));

      return {
        ...res,
        value,
      };
    } finally {
      context.commit('setSearchLoading', false);
    }
  },
};

export const caseFile: Module<IState, IRootState> = {
  namespaced: true,
  state: moduleState as IState,
  getters,
  mutations,
  actions: actions as unknown as ActionTree<IState, IRootState>,
};
