import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockCaseFileActivities, CaseFileTriage, mockCombinedCaseFile } from '@/entities/case-file';
import routes from '@/constants/routes';
import { mockStorage } from '@/store/storage';

import moment from '@/ui/plugins/moment';
import Component from '../case-file-activity/CaseFileActivity.vue';

const localVue = createLocalVue();
const storage = mockStorage();
const mockCaseFile = mockCombinedCaseFile();
const mockActivities = mockCaseFileActivities();

describe('CaseFileActivity.vue', () => {
  let wrapper;

  describe('Template', () => {
    beforeEach(async () => {
      jest.clearAllMocks();

      wrapper = shallowMount(Component, {
        localVue,
        data() {
          return {
            caseFileActivities: mockActivities,
          };
        },
        computed: {
          id() {
            return mockCaseFile.entity.id;
          },
          caseFile() {
            return mockCaseFile;
          },
        },
        mocks: {
          $storage: storage,
        },
      });

      await wrapper.setData({ loading: false });
    });

    describe('tags component', () => {
      let element;
      beforeEach(() => {
        element = wrapper.findDataTest('caseFileActivity-tags');
      });
      it('renders', () => {
        expect(element.exists()).toBeTruthy();
      });

      it('passes the tags as props', () => {
        expect(element.props('tags')).toEqual(mockCaseFile.metadata.tags);
      });

      it('passes the case file id as props', () => {
        expect(element.props('caseFileId')).toEqual(mockCaseFile.entity.id);
      });

      it('calls fetchCaseFileActivities when updateActivities is emitted', async () => {
        jest.spyOn(wrapper.vm, 'fetchCaseFileActivities').mockImplementation(() => {});
        expect(wrapper.vm.fetchCaseFileActivities).toHaveBeenCalledTimes(0);
        await element.vm.$emit('updateActivities');

        expect(wrapper.vm.fetchCaseFileActivities).toHaveBeenCalledTimes(1);
      });
    });

    describe('triage select', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('caseFileActivity-triage-select');
        expect(element.exists()).toBeTruthy();
      });

      it('calls setTriage when the value is changed', async () => {
        jest.spyOn(wrapper.vm, 'setCaseFileTriage').mockImplementation(() => {});

        const element = wrapper.findDataTest('caseFileActivity-triage-select');
        await element.vm.$emit('change');
        expect(wrapper.vm.setCaseFileTriage).toBeCalledTimes(1);
      });
    });

    describe('sort activity details select', () => {
      let element;
      beforeEach(() => {
        element = wrapper.findDataTest('caseFileActivity-case-file-activity-sort-select');
      });
      it('is renders', () => {
        expect(element.exists()).toBeTruthy();
      });
    });

    describe('Last action date info', () => {
      let element;
      beforeEach(() => {
        element = wrapper.findDataTest('caseFileActivity-last-action-date');
      });
      it('is renders', () => {
        expect(element.exists()).toBeTruthy();
      });
    });

    describe('duplicate button', () => {
      let element;
      beforeEach(() => {
        element = wrapper.findDataTest('caseFileActivity-duplicateBtn');
      });
      it('renders', () => {
        expect(element.exists()).toBeTruthy();
      });
    });

    describe('case file assignments info', () => {
      let element;
      beforeEach(() => {
        element = wrapper.findDataTest('case-file-assignments');
      });
      it('is renders', () => {
        expect(element.exists()).toBeTruthy();
      });
    });
  });

  describe('Computed', () => {
    beforeEach(() => {
      storage.caseFile.getters.get = jest.fn(() => mockCaseFile);
      storage.caseFile.actions.fetch = jest.fn(() => mockCaseFile);
      storage.caseFile.actions.fetchCaseFileActivities.mockReturnValueOnce(mockActivities);

      wrapper = shallowMount(Component, {
        localVue,
        mocks: {
          $route: {
            name: routes.caseFile.activity.name,
            params: {
              id: mockCaseFile.entity.id,
            },
          },
          $storage: storage,
        },
        store: {
          modules: {
            caseFileEntities: {
              triageLoading: false,
              duplicateLoading: false,
            },
          },
        },
      });
    });

    describe('id', () => {
      it('returns the right value', () => {
        expect(wrapper.vm.id).toEqual(mockCaseFile.entity.id);
      });
    });

    describe('caseFile', () => {
      it('return the case file by id from the storage', () => {
        expect(wrapper.vm.caseFile).toEqual(mockCaseFile);
      });
    });

    describe('canMarkDuplicate', () => {
      it('returns the true for level 1+ users', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          mocks: {
            $route: {
              name: routes.caseFile.activity.name,
              params: {
                id: mockCaseFile.entity.id,
              },
            },
          },
          computed: {
            caseFile() {
              return mockCaseFile;
            },
          },
        });

        expect(wrapper.vm.canMarkDuplicate).toBe(false);
        await wrapper.setRole('level1');
        expect(wrapper.vm.canMarkDuplicate).toBe(true);
      });
    });

    describe('duplicateLoading', () => {
      it('returns the right value', (() => {
        expect(wrapper.vm.duplicateLoading).toEqual(wrapper.vm.$store.state.caseFileEntities.duplicateLoading);
      }));
    });

    describe('triageLoading', () => {
      it('returns the right value', (() => {
        expect(wrapper.vm.triageLoading).toEqual(wrapper.vm.$store.state.caseFileEntities.triageLoading);
      }));
    });
  });

  describe('lifecycle', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        mocks: {
          $route: {
            name: routes.caseFile.activity.name,
            params: {
              id: mockCaseFile.entity.id,
            },
          },
          $storage: storage,
        },
        computed: {
          caseFile() {
            return mockCaseFile;
          },
        },
      });
    });

    it('should call fetch', () => {
      expect(wrapper.vm.$storage.caseFile.actions.fetch).toHaveBeenCalledWith(mockCaseFile.entity.id);
    });

    it('should call setLastAction', async () => {
      wrapper.vm.setLastAction = jest.fn();

      expect(wrapper.vm.setLastAction).toHaveBeenCalledTimes(0);

      await wrapper.vm.$options.created.forEach((hook) => {
        hook.call(wrapper.vm);
      });

      expect(wrapper.vm.setLastAction).toHaveBeenCalledTimes(1);
    });

    it('should call fetchCaseFileActivities', async () => {
      wrapper.vm.fetchCaseFileActivities = jest.fn();

      expect(wrapper.vm.fetchCaseFileActivities).toHaveBeenCalledTimes(0);

      await wrapper.vm.$options.created.forEach((hook) => {
        hook.call(wrapper.vm);
      });

      expect(wrapper.vm.fetchCaseFileActivities).toHaveBeenCalledTimes(1);
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        mocks: {
          $storage: storage,
        },
        computed: {
          id() {
            return mockCaseFile.entity.id;
          },
          caseFile() {
            return mockCaseFile;
          },
        },
      });
    });

    describe('fetchCaseFileActivities', () => {
      it('calls fetchCaseFileActivities action from storage', async () => {
        jest.clearAllMocks();
        expect(storage.caseFile.actions.fetchCaseFileActivities).toHaveBeenCalledTimes(0);

        await wrapper.vm.fetchCaseFileActivities(0);

        expect(storage.caseFile.actions.fetchCaseFileActivities).toHaveBeenCalled();
      });

      it('sets the response from the storage action into caseFileActivities', async () => {
        await wrapper.vm.fetchCaseFileActivities();
        expect(wrapper.vm.caseFileActivities).toEqual(mockCaseFileActivities());
      });
    });

    describe('setCaseFileIsDuplicate', () => {
      it('calls the setCaseFileIsDuplicate action with the correct params', async () => {
        expect(storage.caseFile.actions.setCaseFileIsDuplicate).toHaveBeenCalledTimes(0);

        await wrapper.vm.setCaseFileIsDuplicate();

        expect(storage.caseFile.actions.setCaseFileIsDuplicate).toHaveBeenCalledTimes(1);
        expect(storage.caseFile.actions.setCaseFileIsDuplicate).toHaveBeenCalledWith(
          mockCaseFile.entity.id,
          !mockCaseFile.entity.isDuplicate,
        );
      });

      it('calls fetchCaseFileActivities', async () => {
        jest.spyOn(wrapper.vm, 'fetchCaseFileActivities').mockImplementation(() => mockActivities);
        wrapper.vm.activityFetchDelay = 500;

        await wrapper.vm.setCaseFileIsDuplicate();
        expect(wrapper.vm.fetchCaseFileActivities).toHaveBeenCalledWith(wrapper.vm.activityFetchDelay);
      });
    });

    describe('setCaseFileTriage', () => {
      it('calls the setTriage action with the correct params', async () => {
        expect(storage.caseFile.actions.setCaseFileTriage).toHaveBeenCalledTimes(0);

        const triage = CaseFileTriage.Tier1;

        await wrapper.vm.setCaseFileTriage(triage);

        expect(storage.caseFile.actions.setCaseFileTriage).toHaveBeenCalledTimes(1);
        expect(storage.caseFile.actions.setCaseFileTriage).toHaveBeenCalledWith(
          mockCaseFile.entity.id,
          triage,
        );
      });

      it('calls fetchCaseFileActivities', async () => {
        jest.spyOn(wrapper.vm, 'fetchCaseFileActivities').mockImplementation(() => mockActivities);
        wrapper.vm.activityFetchDelay = 500;

        const triage = CaseFileTriage.Tier1;

        await wrapper.vm.setCaseFileTriage(triage);
        expect(wrapper.vm.fetchCaseFileActivities).toHaveBeenCalledWith(wrapper.vm.activityFetchDelay);
      });
    });

    describe('setLastAction', () => {
      it('sets the right value into daysAgo', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          mocks: {
            $storage: storage,
          },
          computed: {
            id() {
              return mockCaseFile.entity.id;
            },
            caseFile() {
              const altCaseFile = { ...mockCaseFile };
              altCaseFile.metadata.lastActionDate = moment().subtract(2, 'days');
              return altCaseFile;
            },
          },
        });

        await wrapper.vm.setLastAction();
        expect(wrapper.vm.daysAgo).toEqual('2 days ago');
      });
    });

    describe('sortCaseFileActivities', () => {
      beforeEach(async () => {
        wrapper.vm.caseFileActivities = [{
          id: 'mock-activity-id-1',
          caseFileId: 'mock-id-1',
          user: { id: '1', name: 'Jane Doe' },
          role: { id: '2', name: { translation: { en: 'sys admin', fr: 'admin de systeme' } } },
          created: '2021-01-01',

        },
        {
          id: 'mock-activity-id-2',
          caseFileId: 'mock-id-1',
          user: { id: '1', name: 'Jane Doe' },
          role: { id: '2', name: { translation: { en: 'sys admin', fr: 'admin de systeme' } } },
          created: '2021-01-10',
        }];
      });

      it('sort CaseFile activities asc', async () => {
        wrapper.vm.caseFileActivities = mockActivities;
        await wrapper.vm.sortCaseFileActivities('asc');
        expect(wrapper.vm.caseFileActivities[0].id).toEqual('mock-activity-id-1');
      });

      it('sort CaseFile activities desc', async () => {
        await wrapper.vm.sortCaseFileActivities('desc');
        expect(wrapper.vm.caseFileActivities[0].id).toEqual('mock-activity-id-2');
      });
    });
  });
});
