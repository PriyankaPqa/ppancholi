import { CaseFile, ICaseFile, mockCaseFilesSearchData } from '@/entities/case-file';
import { Store } from 'vuex';
import { mockSearchParams } from '@/test/helpers';

import { mockStore, IRootState } from '@/store';

describe('>>> Case File Module', () => {
  let store: Store<IRootState>;

  const mockCaseFiles = (): ICaseFile[] => mockCaseFilesSearchData().map((cf) => new CaseFile(cf));

  beforeEach(() => {
    jest.clearAllMocks();
    store = mockStore();
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
  });

  describe('>> Actions', () => {
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
