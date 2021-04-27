import {
  ActionContext, ActionTree, Module, Store,
} from 'vuex';
import _findIndex from 'lodash/findIndex';
import { IAzureSearchParams, IAzureSearchResult } from '@/types';
import { IProgram, IProgramSearchData, Program } from '@/entities/program';
import { IRootState } from '@/store/store.types';
import { IState } from './program.types';
import { mapProgramDataToSearchData } from './programUtils';

const getDefaultState = (): IState => ({
  programs: [],
});

const moduleState: IState = getDefaultState();

const getters = {
  getProgramById: (state: IState) => (id: uuid) => {
    const program = state.programs.find((p) => p.programId === id);
    if (program) {
      return new Program(program);
    }
    return null;
  },
};

const mutations = {
  addOrUpdateProgram(state: IState, payload: IProgramSearchData) {
    const index = _findIndex(state.programs, { programId: payload.programId });

    if (index > -1) {
      state.programs = [
        ...state.programs.slice(0, index),
        payload,
        ...state.programs.slice(index + 1),
      ];
    } else {
      state.programs.push(payload);
    }
  },
};

const actions = {
  async createProgram(this: Store<IState>, context: ActionContext<IState, IRootState>, payload: IProgram): Promise<IProgram> {
    const data = await this.$services.programs.createProgram(payload);

    if (data) {
      const program = mapProgramDataToSearchData(data);
      context.commit('addOrUpdateProgram', program);
      return new Program(program);
    }

    return null;
  },

  async searchPrograms(
    this: Store<IState>,
    context: ActionContext<IState, IState>,
    params: IAzureSearchParams,
  ): Promise<IAzureSearchResult<IProgram>> {
    const res = await this.$services.programs.searchPrograms(params);
    const data = res?.value;

    data.forEach((e: IProgramSearchData) => context.commit('addOrUpdateProgram', e));

    const value = data.map((e: IProgramSearchData) => new Program(e));

    return {
      ...res,
      value,
    };
  },

  async fetchProgram(
    this: Store<IState>,
    context: ActionContext<IState, IState>,
    id: uuid,
  ): Promise<IProgram> {
    const program = context.state.programs.find((p) => p.programId === id);

    if (program) {
      return new Program(program);
    }

    const params = { filter: { ProgramId: id } };
    const res = await this.$services.programs.searchPrograms(params);
    if (res?.value.length === 1) {
      const data = res.value[0];
      context.commit('addOrUpdateProgram', data);
      return new Program(data);
    }
    return null;
  },
};

export const program: Module<IState, IRootState> = {
  namespaced: true,
  state: moduleState as IState,
  getters,
  mutations,
  actions: actions as unknown as ActionTree<IState, IRootState>,
};
