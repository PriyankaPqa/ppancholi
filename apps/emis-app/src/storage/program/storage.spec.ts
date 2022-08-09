import { mockStore } from '@/store';
import { PROGRAM_ENTITIES, PROGRAM_METADATA } from '@/constants/vuex-modules';
import { mockProgramEntity, mockProgramMetadata } from '@libs/entities-lib/program';
import { ProgramStorage } from './storage';

const entityModuleName = PROGRAM_ENTITIES;
const metadataModuleName = PROGRAM_METADATA;

const programEntity1 = mockProgramEntity({ id: '1', eventId: 'event-1' });
const programEntity2 = mockProgramEntity({ id: '2', eventId: 'event-2' });
const programMetadata1 = mockProgramMetadata({ id: '1' });
const programMetadata2 = mockProgramMetadata({ id: '2' });

const store = mockStore(
  {
    modules: {
      [entityModuleName]: {
        state: {
          items: [programEntity1, programEntity2],
        },
      },
      [metadataModuleName]: {
        state: {
          items: [programMetadata1, programMetadata2],
        },
      },
    },
  },
  { commit: true, dispatch: true },
);

const storage = new ProgramStorage(store, entityModuleName, metadataModuleName).make();

describe('>>> Program Storage', () => {
  describe('>> Actions', () => {
    it('should proxy createProgram', () => {
      const payload = mockProgramEntity();
      storage.actions.createProgram(payload);
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/createProgram`, payload);
    });

    it('should proxy updateProgram', () => {
      const payload = mockProgramEntity();
      storage.actions.updateProgram(payload);
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/updateProgram`, payload);
    });
  });
});
