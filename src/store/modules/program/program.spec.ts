import { Store } from 'vuex';
import { mockProgramsSearchData, Program } from '@/entities/program';
import { IRootState } from '@/store/store.types';
import { mockStore } from '@/store';

jest.mock('@/store/modules/program/programUtils');

describe('>>> Program Module', () => {
  let store: Store<IRootState>;

  const mockPrograms = mockProgramsSearchData();

  beforeEach(() => {
    store = mockStore({
      modules: {
        program: {
          state: {
            programs: mockPrograms,
          },
        },
      },
    });
  });

  describe('>> Getters', () => {
    // f
  });

  describe('>> Mutations', () => {
    describe('addOrUpdateProgram', () => {
      it('adds a new program to the store', () => {
        store = mockStore();

        const program = mockPrograms[0];

        expect(store.state.program.programs).toEqual([]);

        store.commit('program/addOrUpdateProgram', program);

        expect(store.state.program.programs).toEqual([
          program,
        ]);
      });

      it('updates an existing program', () => {
        const program = mockProgramsSearchData()[0];
        program.approvalRequired = false;

        expect(store.state.program.programs).toEqual(mockPrograms);

        store.commit('program/addOrUpdateProgram', program);

        expect(store.state.program.programs).toEqual([
          program,
        ]);
      });
    });
  });

  describe('>> Actions', () => {
    describe('createProgram', () => {
      it('calls the createProgram service and returns the new Program entity', async () => {
        const store = mockStore();

        const newProgram = new Program(mockPrograms[0]);

        expect(store.$services.programs.createProgram).toHaveBeenCalledTimes(0);

        const res = await store.dispatch('program/createProgram', newProgram);

        expect(store.$services.programs.createProgram).toHaveBeenCalledTimes(1);

        expect(res).toEqual(newProgram);

        expect(store.state.program.programs.length).toBe(1);

        expect(store.state.program.programs[0]).toEqual(mockPrograms[0]);
      });
    });
  });
});
