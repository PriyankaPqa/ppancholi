import { createLocalVue, shallowMount } from '@/test/testSetup';
import { CaseFile, mockCaseFilesSearchData, mockCaseFileActivities } from '@/entities/case-file';
import routes from '@/constants/routes';
import { mockStorage } from '@/store/storage';
import moment from '@/ui/plugins/moment';

import Component from '../case-file-activity/CaseFileActivity.vue';

const localVue = createLocalVue();
const storage = mockStorage();
const mockCaseFile = new CaseFile(mockCaseFilesSearchData()[0]);
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
            return mockCaseFile.id;
          },
          caseFile() {
            return mockCaseFile;
          },
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
        expect(element.props('tags')).toEqual(mockCaseFile.tags);
      });

      it('passes the case file id as props', () => {
        expect(element.props('caseFileId')).toEqual(mockCaseFile.id);
      });

      it('calls fetchCaseFileActivities when updateActivities is emitted', async () => {
        jest.spyOn(wrapper.vm, 'fetchCaseFileActivities').mockImplementation(() => {});
        expect(wrapper.vm.fetchCaseFileActivities).toHaveBeenCalledTimes(0);
        await element.vm.$emit('updateActivities');

        expect(wrapper.vm.fetchCaseFileActivities).toHaveBeenCalledTimes(1);
      });
    });

    describe('status select', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('event-detail-status-select');
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
        element = wrapper.findDataTest('case-file-assigned-info');
      });
      it('is renders', () => {
        expect(element.exists()).toBeTruthy();
      });
    });

    describe('case file assign button', () => {
      let element;
      beforeEach(() => {
        element = wrapper.findDataTest('case-file-assign-btn');
      });
      it('is renders', () => {
        expect(element.exists()).toBeTruthy();
      });
    });
  });

  describe('Computed', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        mocks: {
          $route: {
            name: routes.caseFile.activity.name,
            params: {
              id: mockCaseFile.id,
            },
          },
          $storage: storage,
        },
      });

      storage.caseFile.getters.caseFileById.mockReturnValueOnce(mockCaseFile);
    });

    describe('id', () => {
      it('returns the right value', () => {
        expect(wrapper.vm.id).toEqual(mockCaseFile.id);
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
                id: mockCaseFile.id,
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
  });

  describe('lifecycle', () => {
    beforeEach(() => {
      storage.caseFile.actions.fetchCaseFile = jest.fn(() => {});

      wrapper = shallowMount(Component, {
        localVue,
        mocks: {
          $route: {
            name: routes.caseFile.activity.name,
            params: {
              id: mockCaseFile.id,
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

    it('should call fetchCaseFile', () => {
      expect(wrapper.vm.$storage.caseFile.actions.fetchCaseFile).toHaveBeenCalledWith(mockCaseFile.id);
    });

    // it('should call setLastAction', async () => {
    //   wrapper.vm.setLastAction = jest.fn();

    //   expect(wrapper.vm.setLastAction).toHaveBeenCalledTimes(0);

    //   await wrapper.vm.$options.created.forEach((hook) => {
    //     hook.call(wrapper.vm);
    //   });

    //   expect(wrapper.vm.setLastAction).toHaveBeenCalledTimes(1);
    // });

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
      storage.caseFile.actions.fetchCaseFileActivities = jest.fn(() => mockCaseFileActivities());
      wrapper = shallowMount(Component, {
        localVue,
        mocks: {
          $storage: storage,
        },
        computed: {
          id() {
            return mockCaseFile.id;
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
          mockCaseFile.id,
          !mockCaseFile.isDuplicate,
        );
      });
    });

    describe('setLastAction', () => {
      it('sets the right value into lastActionAgo', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          mocks: {
            $storage: storage,
          },
          computed: {
            id() {
              return mockCaseFile.id;
            },
            caseFile() {
              const altCaseFile = { ...mockCaseFile };
              altCaseFile.timestamp = moment().subtract(2, 'days');
              return altCaseFile;
            },
          },
        });

        await wrapper.vm.setLastAction();
        expect(wrapper.vm.lastActionAgo).toEqual('2 days ago');
      });
    });
  });
});
