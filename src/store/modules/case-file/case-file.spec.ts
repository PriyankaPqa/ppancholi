import {
  CaseFile,
  ICaseFile,
  ICaseFileLabel,
  mockCaseFilesSearchData,
  mockSearchCaseFiles,
  ECaseFileTriage,
  mockTagsOptions,
  ECaseFileStatus,
} from '@/entities/case-file';
import _sortBy from 'lodash/sortBy';
import { Store } from 'vuex';
import { mockSearchParams } from '@/test/helpers';
import { mockStore, IRootState } from '@/store';
import { IListOption } from '@/types';
import { OptionItem } from '@/entities/optionItem';
import { mockCaseNote, mockCaseNoteCategories } from '@/entities/case-file/case-note';

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
            caseNoteCategories: mockCaseNoteCategories(),
            tagsOptions: mockTagsOptions(),
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

    describe('tagsOptions', () => {
      test('the getter returns the sorted tagsOptions', () => {
        expect(store.getters['caseFile/tagsOptions']).toEqual(
          _sortBy(
            mockTagsOptions().map((e) => new OptionItem(e)),
            'orderRank',
          ),
        );
      });
    });

    describe('caseNoteCategories', () => {
      test('the getter returns the sorted case note categories', () => {
        expect(store.getters['caseFile/caseNoteCategories']).toEqual(
          _sortBy(
            mockCaseNoteCategories().map((e) => new OptionItem(e)),
            'orderRank',
          ),
        );
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

    describe('setDuplicateLoading', () => {
      it('sets the value of duplicateLoading', () => {
        store = mockStore();

        expect(store.state.caseFile.duplicateLoading).toBe(false);

        store.commit('caseFile/setDuplicateLoading', true);

        expect(store.state.caseFile.duplicateLoading).toBe(true);
      });
    });

    describe('setCaseNoteCategories', () => {
      test('the setCaseNoteCategories mutation sets the caseNoteCategories state', () => {
        store = mockStore();
        const category = mockCaseNoteCategories()[0];

        store.commit('caseFile/setCaseNoteCategories', category);

        expect(store.state.caseFile.caseNoteCategories).toBe(category);
      });
    });

    describe('setTriageLoading', () => {
      it('sets the value of triageLoading', () => {
        store = mockStore();

        expect(store.state.caseFile.triageLoading).toBe(false);

        store.commit('caseFile/setTriageLoading', true);

        expect(store.state.caseFile.triageLoading).toBe(true);
      });
    });
  });

  describe('>> Actions', () => {
    describe('fetchCaseFileActivities', () => {
      it('calls the service with the passed params', async () => {
        expect(store.$services.caseFiles.fetchCaseFileActivities).toHaveBeenCalledTimes(0);

        const id = 'MOCK_ID';
        await store.dispatch('caseFile/fetchCaseFileActivities', id);

        expect(store.$services.caseFiles.fetchCaseFileActivities).toHaveBeenCalledWith(id);
      });
    });

    describe('fetchCaseFile', () => {
      it('calls the searchCaseFile service and returns the caseFile', async () => {
        const store = mockStore();
        const caseFile = mockCaseFiles()[0];

        jest.spyOn(store.$services.caseFiles, 'searchCaseFiles').mockImplementation(() => mockSearchCaseFiles(0));

        expect(store.$services.caseFiles.searchCaseFiles).toHaveBeenCalledTimes(0);

        const res = await store.dispatch('caseFile/fetchCaseFile', caseFile.id);

        expect(store.$services.caseFiles.searchCaseFiles).toHaveBeenCalledWith({ filter: { CaseFileId: caseFile.id } });

        expect(store.state.caseFile.caseFiles).toEqual([caseFile]);

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

    describe('setCaseFileStatus', () => {
      it('calls the setCaseFileStatus service and returns the new case file entity', async () => {
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
        const status: ECaseFileStatus = ECaseFileStatus.Inactive;
        const rationale = 'Some rationale';
        const reason: IListOption = { optionItemId: 'foo', specifiedOther: null };
        expect(store.$services.caseFiles.setCaseFileStatus).toHaveBeenCalledTimes(0);

        const res = await store.dispatch('caseFile/setCaseFileStatus', {
          id,
          status,
          rationale,
          reason,
        });

        expect(store.$services.caseFiles.setCaseFileStatus).toHaveBeenCalledTimes(1);
        expect(store.$services.caseFiles.setCaseFileStatus).toHaveBeenCalledWith(id, status, rationale, reason);

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
      const labels: ICaseFileLabel[] = [
        {
          name: 'Label One',
          order: 1,
        },
        {
          name: 'Label Two',
          order: 2,
        },
      ];

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
  it('calls the setCaseFileTriage service and returns the case file entity', async () => {
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
    const triage = ECaseFileTriage.Tier1;

    expect(store.$services.caseFiles.setCaseFileTriage).toHaveBeenCalledTimes(0);

    const res = await store.dispatch('caseFile/setCaseFileTriage', {
      id,
      triage,
    });

    expect(store.$services.caseFiles.setCaseFileTriage).toHaveBeenCalledTimes(1);
    expect(store.$services.caseFiles.setCaseFileTriage).toHaveBeenCalledWith(id, triage);

    expect(res).toEqual(caseFile);

    expect(store.state.caseFile.caseFiles[0]).toEqual(caseFile);
  });

  describe('fetchActiveCaseNoteCategories', () => {
    it('calls the service', async () => {
      expect(store.$services.caseFiles.fetchActiveCaseNoteCategories).toHaveBeenCalledTimes(0);

      await store.dispatch('caseFile/fetchActiveCaseNoteCategories');

      expect(store.$services.caseFiles.fetchActiveCaseNoteCategories).toHaveBeenCalledTimes(1);
    });
  });

  describe('addCaseNote', () => {
    it('calls the service', async () => {
      expect(store.$services.caseFiles.addCaseNote).toHaveBeenCalledTimes(0);

      const id = 'id';
      const caseNote = mockCaseNote();

      await store.dispatch('caseFile/addCaseNote', { id, caseNote });

      expect(store.$services.caseFiles.addCaseNote).toHaveBeenCalledTimes(1);
      expect(store.$services.caseFiles.addCaseNote).toHaveBeenCalledWith(id, caseNote);
    });
  });

  describe('fetchActiveCaseNoteCategories', () => {
    it('calls the service', async () => {
      expect(store.$services.caseFiles.fetchActiveCaseNoteCategories).toHaveBeenCalledTimes(0);

      await store.dispatch('caseFile/fetchActiveCaseNoteCategories');

      expect(store.$services.caseFiles.fetchActiveCaseNoteCategories).toHaveBeenCalledTimes(1);
    });
  });

  describe('addCaseNote', () => {
    it('calls the service', async () => {
      expect(store.$services.caseFiles.addCaseNote).toHaveBeenCalledTimes(0);

      const id = 'id';
      const caseNote = mockCaseNote();

      await store.dispatch('caseFile/addCaseNote', { id, caseNote });

      expect(store.$services.caseFiles.addCaseNote).toHaveBeenCalledTimes(1);
      expect(store.$services.caseFiles.addCaseNote).toHaveBeenCalledWith(id, caseNote);
    });
  });

  describe('searchCaseNotes', () => {
    it('calls the service with the passed params', async () => {
      expect(store.$services.caseFiles.searchCaseNotes).toHaveBeenCalledTimes(0);

      const params = mockSearchParams;
      await store.dispatch('caseFile/searchCaseNotes', params);

      expect(store.$services.caseFiles.searchCaseNotes).toHaveBeenCalledWith(params);
    });
  });

  describe('setCaseFileIsDuplicate', () => {
    it('calls the setCaseFileIsDuplicate service and returns the case file entity', async () => {
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
      const isDuplicate = true;

      expect(store.$services.caseFiles.setCaseFileIsDuplicate).toHaveBeenCalledTimes(0);

      const res = await store.dispatch('caseFile/setCaseFileIsDuplicate', {
        id,
        isDuplicate,
      });

      expect(store.$services.caseFiles.setCaseFileIsDuplicate).toHaveBeenCalledTimes(1);
      expect(store.$services.caseFiles.setCaseFileIsDuplicate).toHaveBeenCalledWith(id, isDuplicate);

      expect(res).toEqual(caseFile);

      expect(store.state.caseFile.caseFiles[0]).toEqual(caseFile);
    });
  });
});
