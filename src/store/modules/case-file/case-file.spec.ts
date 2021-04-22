import {
  CaseFile, ICaseFile, mockCaseFilesSearchData, mockSearchCaseFiles,
} from '@/entities/case-file';
import { Store } from 'vuex';
import { mockSearchParams } from '@/test/helpers';

import { mockStore, IRootState } from '@/store';

describe('>>> Case File Module', () => {
  let store: Store<IRootState>;

  const mockCaseFiles = (): ICaseFile[] => mockCaseFilesSearchData().map((cf) => new CaseFile(cf));

  beforeEach(() => {
    jest.clearAllMocks();
    store = mockStore({
      modules: {
        caseFile: {
          state: {
            caseFiles: mockCaseFiles(),
            searchLoading: false,
            getLoading: false,
            caseFilesFetched: false,
          },
        },
      },
    });
  });

  describe('>> Getters', () => {
    describe('caseFileById', () => {
      test('the getter returns the case file with the id passed in the argument', () => {
        const mockId = mockCaseFiles()[0].id;
        expect(store.getters['caseFile/caseFileById'](mockId)).toEqual(mockCaseFiles()[0]);
      });

      test('the getter return null if the id passed in argument does not correspond to a case file', () => {
        const mockId = 'foo';
        expect(store.getters['caseFile/caseFileById'](mockId)).toEqual(null);
      });
    });
  });

  describe('>> Mutations', () => {
    describe('addOrUpdateCaseFile', () => {
      it('adds a new case file  to the state', () => {
        store = mockStore();
        const caseFile = mockCaseFiles()[0];

        expect(store.state.caseFile.caseFiles).toEqual([]);

        store.commit('caseFile/addOrUpdateCaseFile', caseFile);

        expect(store.state.caseFile.caseFiles).toEqual([caseFile]);
      });

      it('updates an existing case file', () => {
        store = mockStore({
          modules: {
            caseFile: {
              state: {
                caseFiles: mockCaseFiles(),
              },
            },
          },
        });

        const caseFiles = mockCaseFiles();

        expect(store.state.caseFile.caseFiles).toEqual(caseFiles);

        const updatedCaseFile = caseFiles[0];

        updatedCaseFile.triageName = {
          translation: {
            en: 'UPDATED EN',
            fr: 'UPDATED FR',
          },
        };

        store.commit('caseFile/addOrUpdateCaseFile', updatedCaseFile);

        expect(store.state.caseFile.caseFiles).toEqual([
          {
            ...caseFiles[0],
            triageName: {
              translation: {
                en: 'UPDATED EN',
                fr: 'UPDATED FR',
              },
            },
          },
          caseFiles[1],
        ]);
      });
    });

    describe('setSearchLoading', () => {
      test('the setSearchLoading mutation sets the searchLoading state', () => {
        store = mockStore();

        store.commit('caseFile/setSearchLoading', true);

        expect(store.state.caseFile.searchLoading).toBeTruthy();
      });
    });

    describe('setGetLoading', () => {
      test('the setSearchLoading mutation sets the getLoading state', () => {
        store = mockStore();

        store.commit('caseFile/setGetLoading', true);

        expect(store.state.caseFile.getLoading).toBeTruthy();
      });
    });
  });

  describe('>> Actions', () => {
    describe('fetchCaseFile', () => {
      it('calls the searchCaseFile service and returns the caseFile', async () => {
        const store = mockStore();
        const caseFile = new CaseFile(mockCaseFilesSearchData()[0]);

        jest.spyOn(store.$services.caseFiles, 'searchCaseFiles').mockImplementation(() => mockSearchCaseFiles(0));

        expect(store.$services.caseFiles.searchCaseFiles).toHaveBeenCalledTimes(0);

        const res = await store.dispatch('caseFile/fetchCaseFile', caseFile.id);

        expect(store.$services.caseFiles.searchCaseFiles).toHaveBeenCalledWith({ filter: { CaseFileId: caseFile.id } });

        expect(store.state.caseFile.caseFiles).toEqual([
          caseFile,
        ]);

        expect(res).toEqual(caseFile);
      });

      test('if the caseFile already exists in the store, do not call the API', async () => {
        const store = mockStore();
        const caseFile = new CaseFile(mockCaseFilesSearchData()[0]);
        jest.spyOn(store.$services.caseFiles, 'searchCaseFiles').mockReturnValueOnce(mockSearchCaseFiles(0));

        expect(store.$services.caseFiles.searchCaseFiles).toHaveBeenCalledTimes(0);

        await store.dispatch('caseFile/fetchCaseFile', caseFile.id);

        expect(store.$services.caseFiles.searchCaseFiles).toHaveBeenCalledTimes(1);

        await store.dispatch('caseFile/fetchCaseFile', caseFile.id);

        expect(store.$services.caseFiles.searchCaseFiles).toHaveBeenCalledTimes(1);
      });
    });

    describe('searchCaseFiles', () => {
      it('calls the service with the passed params', async () => {
        expect(store.$services.caseFiles.searchCaseFiles).toHaveBeenCalledTimes(0);

        const params = mockSearchParams;
        await store.dispatch('caseFile/searchCaseFiles', params);

        expect(store.$services.caseFiles.searchCaseFiles).toHaveBeenCalledWith(params);
      });
    });
  });
});
