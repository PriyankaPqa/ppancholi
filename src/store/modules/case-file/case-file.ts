import {
  Store, Module, ActionContext, ActionTree,
} from 'vuex';
import _findIndex from 'lodash/findIndex';
import _sortBy from 'lodash/sortBy';

import { IRootState } from '@/store/store.types';
import {
  CaseFile, ICaseFile, ICaseFileActivity, ICaseFileLabel, ICaseFileSearchData, ECaseFileTriage, ECaseFileStatus,
} from '@/entities/case-file';
import { IAzureSearchParams, IAzureSearchResult, IListOption } from '@/types';
import {
  EOptionListItemStatus, EOptionLists, IOptionItem, IOptionItemData, OptionItem,
} from '@/entities/optionItem';
import { ICaseNote, CaseNote, ICaseNoteSearchData } from '@/entities/case-file/case-note';
import { IState } from './case-file.types';
import { mapCaseFileDataToSearchData } from './case-file-utils';

const getDefaultState = (): IState => ({
  caseFiles: [],
  tagsOptions: [],
  searchLoading: false,
  getLoading: false,
  duplicateLoading: false,
  caseNoteCategories: [],
  inactiveReasons: [],
  closeReasons: [],
  triageLoading: false,
  isSavingCaseNote: false,
  isLoadingCaseNotes: false,
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

  tagsOptions: (state: IState) => _sortBy(
    state.tagsOptions.map((e) => new OptionItem(e)),
    'orderRank',
  ),

  caseNoteCategories: (state: IState) => _sortBy(
    state.caseNoteCategories.map((e) => new OptionItem(e)),
    'orderRank',
  ),

  inactiveReasons: (state: IState) => _sortBy(
    state.inactiveReasons.map((e) => new OptionItem(e)),
    'orderRank',
  ).filter((i) => i.status === EOptionListItemStatus.Active),

  closeReasons: (state: IState) => _sortBy(
    state.closeReasons.map((e) => new OptionItem(e)),
    'orderRank',
  ).filter((i) => i.status === EOptionListItemStatus.Active),
};

const mutations = {
  addOrUpdateCaseFile(state: IState, payload: ICaseFile) {
    const index = _findIndex(state.caseFiles, { id: payload.id });

    if (index > -1) {
      state.caseFiles = [...state.caseFiles.slice(0, index), payload, ...state.caseFiles.slice(index + 1)];
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

  setTriageLoading(state: IState, payload: boolean) {
    state.triageLoading = payload;
  },

  setTagsOptions(state: IState, payload: Array<IOptionItemData>) {
    state.tagsOptions = payload;
  },

  setCaseNoteCategories(state: IState, payload: Array<IOptionItemData>) {
    state.caseNoteCategories = payload;
  },

  setInactiveReasons(state: IState, payload: Array<IOptionItemData>) {
    state.inactiveReasons = payload;
  },

  setCloseReasons(state: IState, payload: Array<IOptionItemData>) {
    state.closeReasons = payload;
  },

  setIsSavingCaseNote(state: IState, payload: boolean) {
    state.isSavingCaseNote = payload;
  },

  setIsLoadingCaseNotes(state: IState, payload: boolean) {
    state.isLoadingCaseNotes = payload;
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

  async fetchInactiveReasons(this: Store<IState>, context: ActionContext<IState, IState>): Promise<IOptionItem[]> {
    // if (!context.state.tagsOptionsFetched) { disable caching until signalR events are implemented
    const data = await this.$services.optionItems.getOptionList(EOptionLists.CaseFileInactiveReasons);
    context.commit('setInactiveReasons', data);
    // context.commit('setInactiveReasons', true);

    return context.getters.inactiveReasons;
  },

  async fetchCloseReasons(this: Store<IState>, context: ActionContext<IState, IState>): Promise<IOptionItem[]> {
    // if (!context.state.tagsOptionsFetched) { disable caching until signalR events are implemented
    const data = await this.$services.optionItems.getOptionList(EOptionLists.CaseFileCloseReasons);
    context.commit('setCloseReasons', data);
    // context.commit('setCloseReasons', true);

    return context.getters.closeReasons;
  },

  async fetchCaseFileActivities(this: Store<IState>, context: ActionContext<IState, IState>, id: uuid): Promise<ICaseFileActivity[]> {
    return this.$services.caseFiles.fetchCaseFileActivities(id);
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
    payload: { tags: IListOption[]; id: uuid },
  ): Promise<ICaseFile> {
    const data = await this.$services.caseFiles.setCaseFileTags(payload.id, payload.tags);
    if (data) {
      const caseFile = new CaseFile(mapCaseFileDataToSearchData(data, context, payload.id));
      context.commit('addOrUpdateCaseFile', caseFile);
      return caseFile;
    }
    return null;
  },

  async setCaseFileStatus(
    this: Store<IState>,
    context: ActionContext<IState, IRootState>,
    payload: { id: uuid; status: ECaseFileStatus; rationale: string; reason: IListOption },
  ): Promise<ICaseFile> {
    const data = await this.$services.caseFiles.setCaseFileStatus(payload.id, payload.status, payload.rationale, payload.reason);
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
    payload: { id: uuid; labels: ICaseFileLabel[] },
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
    payload: { id: uuid; isDuplicate: boolean },
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

  async fetchActiveCaseNoteCategories(this: Store<IState>, context: ActionContext<IState, IState>): Promise<IOptionItem[]> {
    context.commit('setIsLoadingCaseNotes', true);
    const results = await this.$services.caseFiles.fetchActiveCaseNoteCategories();
    context.commit('setIsLoadingCaseNotes', false);
    const categories = results ?? [];

    context.commit('setCaseNoteCategories', categories);
    return categories;
  },

  async addCaseNote(this: Store<IState>, context: ActionContext<IState, IState>, payload: { id: uuid; caseNote: ICaseNote }): Promise<ICaseNote> {
    context.commit('setIsSavingCaseNote', true);
    const result = await this.$services.caseFiles.addCaseNote(payload.id, payload.caseNote);
    context.commit('setIsSavingCaseNote', false);
    return result ? payload.caseNote : null;
  },

  async pinCaseNote(
    this: Store<IState>,
    context: ActionContext<IState, IState>,
    payload: { caseFileId: uuid; caseNoteId: uuid, isPinned: boolean },
  ): Promise<ICaseNote> {
    context.commit('setIsLoadingCaseNotes', true);
    await this.$services.caseFiles.pinCaseNote(payload.caseFileId, payload.caseNoteId, payload.isPinned);
    context.commit('setIsLoadingCaseNotes', false);
    return null;
  },

  async editCaseNote(
    this: Store<IState>,
    context: ActionContext<IState, IState>,
    payload: { caseFileId: uuid; caseNoteId: uuid, caseNote: ICaseNote },
  ): Promise<ICaseNote> {
    context.commit('setIsSavingCaseNote', true);
    const result = await this.$services.caseFiles.editCaseNote(payload.caseFileId, payload.caseNoteId, payload.caseNote);
    context.commit('setIsSavingCaseNote', false);
    return result ? payload.caseNote : null;
  },

  async searchCaseNotes(
    this: Store<IState>,
    context: ActionContext<IState, IState>,
    params: IAzureSearchParams,
  ): Promise<IAzureSearchResult<ICaseNote>> {
    context.commit('setIsLoadingCaseNotes', true);
    const res = await this.$services.caseFiles.searchCaseNotes(params);
    context.commit('setIsLoadingCaseNotes', false);
    const data = res?.value;

    const value = data.map((cn: ICaseNoteSearchData) => new CaseNote(cn));

    return {
      ...res,
      value,
    };
  },

  async setCaseFileTriage(
    this: Store<IState>,
    context: ActionContext<IState, IRootState>,
    payload: { id: uuid; triage: ECaseFileTriage },
  ): Promise<ICaseFile> {
    try {
      context.commit('setTriageLoading', true);
      const data = await this.$services.caseFiles.setCaseFileTriage(payload.id, payload.triage);

      if (data) {
        const caseFile = new CaseFile(mapCaseFileDataToSearchData(data, context, payload.id));
        context.commit('addOrUpdateCaseFile', caseFile);
        return caseFile;
      }
    } finally {
      context.commit('setTriageLoading', false);
    }

    return null;
  },

  async setCaseFileAssign(
    this: Store<IState>,
    context: ActionContext<IState, IRootState>,
    payload: { id: uuid, individuals: uuid[]; teams: uuid[] },
  ): Promise<ICaseFile> {
    const data = await this.$services.caseFiles.setCaseFileAssign(payload.id, payload.individuals, payload.teams);

    if (data) {
      const caseFile = new CaseFile(mapCaseFileDataToSearchData(data, context, payload.id));

      context.commit('addOrUpdateCaseFile', caseFile);
      return caseFile;
    }
    return null;
  },
};

export const caseFile: Module<IState, IRootState> = {
  namespaced: true,
  state: moduleState as IState,
  getters,
  mutations,
  actions: (actions as unknown) as ActionTree<IState, IRootState>,
};
