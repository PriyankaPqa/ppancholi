import {
  CaseFile, ICaseFile, ICaseFileLabel, mockCaseFilesSearchData, mockSearchCaseFiles,
} from '@/entities/case-file';
import { Store } from 'vuex';
import { mockSearchParams } from '@/test/helpers';
import { mockStore, IRootState } from '@/store';
import { IListOption } from '@/types';

jest.mock('@/store/modules/case-file/case-file-utils');

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
        const caseFile = mockCaseFiles()[0];

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

    describe('setCaseFileTags', () => {
      it('calls the setCaseFileTags service and returns the new case file entity', async () => {
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

        const caseFile = mockCaseFiles()[0];
        const { id } = caseFile;
        const tags: IListOption[] = [{ optionItemId: 'foo', specifiedOther: null }];

        expect(store.$services.caseFiles.setCaseFileTags).toHaveBeenCalledTimes(0);

        const res = await store.dispatch('caseFile/setCaseFileTags', {
          id,
          tags,
        });

        expect(store.$services.caseFiles.setCaseFileTags).toHaveBeenCalledTimes(1);
        expect(store.$services.caseFiles.setCaseFileTags).toHaveBeenCalledWith(id, tags);

        expect(res).toEqual(caseFile);

        expect(store.state.caseFile.caseFiles[0]).toEqual(caseFile);
      });
    });
  });

  describe('setCaseFileLabels', () => {
    it('calls the setCaseFileLabels service and returns the new case file entity', async () => {
      store = mockStore({
        modules: {
          caseFile: {
            state: {
              caseFiles: mockCaseFiles(),
            },
          },
        },
      });

      const caseFile = mockCaseFiles()[0];
      const { id } = caseFile;
      const labels: ICaseFileLabel[] = [{
        name: 'Label One',
        order: 1,
      }, {
        name: 'Label Two',
        order: 2,
      }];

      expect(store.$services.caseFiles.setCaseFileLabels).toHaveBeenCalledTimes(0);

      const res = await store.dispatch('caseFile/setCaseFileLabels', {
        id,
        labels,
      });

      expect(store.$services.caseFiles.setCaseFileLabels).toHaveBeenCalledTimes(1);
      expect(store.$services.caseFiles.setCaseFileLabels).toHaveBeenCalledWith(id, labels);

      expect(res).toEqual(caseFile);

      expect(store.state.caseFile.caseFiles[0]).toEqual(caseFile);
    });
  });
});
