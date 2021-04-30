import { Store } from 'vuex';
import { mockProgramsSearchData, mockSearchPrograms, Program } from '@/entities/program';
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
    describe('getProgramById', () => {
      it('returns the program with the specified id', () => {
        const id = mockPrograms[0].programId;

        expect(store.getters['program/getProgramById'](id)).toEqual(new Program(mockPrograms[0]));
      });

      it('returns null if no program is found', () => {
        expect(store.getters['program/getProgramById']('NONE')).toEqual(null);
      });
    });
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

    describe('updateProgram', () => {
      it('calls the updateProgram service and returns the updated Program entity', async () => {
        const store = mockStore();

        const program = new Program(mockPrograms[0]);

        expect(store.$services.programs.updateProgram).toHaveBeenCalledTimes(0);

        const res = await store.dispatch('program/updateProgram', program);

        expect(store.$services.programs.updateProgram).toHaveBeenCalledTimes(1);

        expect(res).toEqual(program);

        expect(store.state.program.programs.length).toBe(1);

        expect(store.state.program.programs[0]).toEqual(mockPrograms[0]);
      });
    });

    describe('searchPrograms', () => {
      it('calls the searchPrograms service and caches the api results', async () => {
        const store = mockStore();

        expect(store.$services.programs.searchPrograms).toHaveBeenCalledTimes(0);

        const res = await store.dispatch('program/searchPrograms', {});

        expect(store.$services.programs.searchPrograms).toHaveBeenCalledTimes(1);

        const mockSearchData = mockSearchPrograms();

        expect(res).toEqual({
          value: mockSearchData.value.map((p) => new Program(p)),
          odataContext: 'context',
          odataCount: 1,
        });

        expect(store.state.program.programs.length).toBe(mockSearchData.value.length);

        expect(store.state.program.programs[0]).toEqual(mockSearchData.value[0]);
      });
    });

    describe('fetchProgram', () => {
      it('calls the searchPrograms service with the id and returns the program', async () => {
        const store = mockStore();
        const program = new Program(mockPrograms[0]);

        jest.spyOn(store.$services.programs, 'searchPrograms').mockReturnValueOnce(mockSearchPrograms(0));

        expect(store.$services.programs.searchPrograms).toHaveBeenCalledTimes(0);

        const res = await store.dispatch('program/fetchProgram', program.id);

        expect(store.$services.programs.searchPrograms).toHaveBeenCalledWith({
          filter: {
            ProgramId: program.id,
          },
        });

        expect(store.state.program.programs).toEqual([
          mockPrograms[0],
        ]);

        expect(res).toEqual(program);
      });

      test('if the program already exists in the store, do not call the API', async () => {
        const store = mockStore();
        const program = new Program(mockProgramsSearchData()[0]);
        jest.spyOn(store.$services.programs, 'searchPrograms').mockReturnValueOnce(mockSearchPrograms(0));

        expect(store.$services.programs.searchPrograms).toHaveBeenCalledTimes(0);

        await store.dispatch('program/fetchProgram', program.id);

        expect(store.$services.programs.searchPrograms).toHaveBeenCalledTimes(1);

        await store.dispatch('program/fetchProgram', program.id);

        expect(store.$services.programs.searchPrograms).toHaveBeenCalledTimes(1);
      });
    });
  });
});
