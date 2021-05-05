import {
  Store, Module, ActionContext, ActionTree,
} from 'vuex';
import _findIndex from 'lodash/findIndex';
import _sortBy from 'lodash/sortBy';

import { IRootState } from '@/store/store.types';
import {
  CaseFile, ICaseFile, ICaseFileLabel, ICaseFileSearchData,
} from '@/entities/case-file';
import { IAzureSearchParams, IAzureSearchResult, IListOption } from '@/types';
import {
  EOptionLists, IOptionItem, IOptionItemData, OptionItem,
} from '@/entities/optionItem';
import { IState } from './case-file.types';
import { mapCaseFileDataToSearchData } from './case-file-utils';

const getDefaultState = (): IState => ({
  caseFiles: [],
  tagsOptions: [],
  searchLoading: false,
  getLoading: false,
  duplicateLoading: false,
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

  tagsOptions: (state: IState) => (
    _sortBy(state.tagsOptions.map((e) => new OptionItem(e)), 'orderRank')
  ),
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

  setDuplicateLoading(state: IState, payload: boolean) {
    state.duplicateLoading = payload;
  },

  setTagsOptions(state: IState, payload: Array<IOptionItemData>) {
    state.tagsOptions = payload;
  },
};

const actions = {
  async fetchTagsOptions(this: Store<IState>, context: ActionContext<IState, IState>): Promise<IOptionItem[]> {
    // if (!context.state.tagsOptionsFetched) { disable caching until signalR events are implemented
    const data = await this.$services.optionItems.getOptionList(EOptionLists.CaseFileTags);
    context.commit('setTagsOptions', data);
    // context.commit('setTagsOptionsFetched', true);

    return context.getters.tagsOptions;
  },

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

  async setCaseFileTags(
    this: Store<IState>,
    context: ActionContext<IState, IRootState>,
    payload: { tags: IListOption[], id: uuid },
  ): Promise<ICaseFile> {
    const data = await this.$services.caseFiles.setCaseFileTags(payload.id, payload.tags);
    if (data) {
      const caseFile = new CaseFile(mapCaseFileDataToSearchData(data, context, payload.id));
      context.commit('addOrUpdateCaseFile', caseFile);
      return caseFile;
    }
    return null;
  },

  async setCaseFileLabels(
    this: Store<IState>,
    context: ActionContext<IState, IRootState>,
    payload: { id: uuid, labels: ICaseFileLabel[] },
  ): Promise<ICaseFile> {
    const data = await this.$services.caseFiles.setCaseFileLabels(payload.id, payload.labels);

    if (data) {
      const caseFile = new CaseFile(mapCaseFileDataToSearchData(data, context, payload.id));
      context.commit('addOrUpdateCaseFile', caseFile);
      return caseFile;
    }

    return null;
  },

  async setCaseFileIsDuplicate(
    this: Store<IState>,
    context: ActionContext<IState, IRootState>,
    payload: { id: uuid, isDuplicate: boolean },
  ): Promise<ICaseFile> {
    try {
      context.commit('setDuplicateLoading', true);
      const data = await this.$services.caseFiles.setCaseFileIsDuplicate(payload.id, payload.isDuplicate);

      if (data) {
        const caseFile = new CaseFile(mapCaseFileDataToSearchData(data, context, payload.id));
        context.commit('addOrUpdateCaseFile', caseFile);
        return caseFile;
      }
    } finally {
      context.commit('setDuplicateLoading', false);
    }

    return null;
  },
};

export const caseFile: Module<IState, IRootState> = {
  namespaced: true,
  state: moduleState as IState,
  getters,
  mutations,
  actions: actions as unknown as ActionTree<IState, IRootState>,
};
