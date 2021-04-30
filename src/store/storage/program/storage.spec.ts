import { mockProgramsSearchData, Program } from '@/entities/program';
import { mockStore } from '@/store';
import { makeStorage } from './storage';

const store = mockStore({}, { commit: true, dispatch: true });
const storage = makeStorage(store);

describe('>>> Program Storage', () => {
  describe('>> Actions', () => {
    it('should proxy createProgram', () => {
      const program = new Program(mockProgramsSearchData()[0]);
      storage.actions.createProgram(program);
      expect(store.dispatch).toHaveBeenCalledWith('program/createProgram', program);
    });

    it('should proxy udpateProgram', () => {
      const program = new Program(mockProgramsSearchData()[0]);
      storage.actions.updateProgram(program);
      expect(store.dispatch).toHaveBeenCalledWith('program/updateProgram', program);
    });

    it('should proxy searchPrograms', () => {
      storage.actions.searchPrograms({});
      expect(store.dispatch).toHaveBeenCalledWith('program/searchPrograms', {});
    });

    it('should proxy fetchProgram', () => {
      storage.actions.fetchProgram('ID');
      expect(store.dispatch).toHaveBeenCalledWith('program/fetchProgram', 'ID');
    });
  });
});
