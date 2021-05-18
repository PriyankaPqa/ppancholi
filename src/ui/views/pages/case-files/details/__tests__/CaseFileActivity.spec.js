import { createLocalVue, shallowMount } from '@/test/testSetup';
import {
  CaseFile, mockCaseFilesSearchData, mockCaseFileActivities, ECaseFileTriage,
} from '@/entities/case-file';
import routes from '@/constants/routes';
import { mockStorage } from '@/store/storage';

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
        store: {
          modules: {
            caseFile: {
              triageLoading: false,
              duplicateLoading: false,
            },
          },
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

    describe('duplicateLoading', () => {
      it('returns the right value', (() => {
        expect(wrapper.vm.duplicateLoading).toEqual(wrapper.vm.$store.state.caseFile.duplicateLoading);
      }));
    });

    describe('triageLoading', () => {
      it('returns the right value', (() => {
        expect(wrapper.vm.triageLoading).toEqual(wrapper.vm.$store.state.caseFile.triageLoading);
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

        const triage = ECaseFileTriage.Tier1;

        await wrapper.vm.setCaseFileTriage(triage);

        expect(storage.caseFile.actions.setCaseFileTriage).toHaveBeenCalledTimes(1);
        expect(storage.caseFile.actions.setCaseFileTriage).toHaveBeenCalledWith(
          mockCaseFile.id,
          triage,
        );
      });
    });

    // describe('setLastAction', () => {
    //   it('sets the right value into lastActionAgo', async () => {
    //     wrapper = shallowMount(Component, {
    //       localVue,
    //       mocks: {
    //         $storage: storage,
    //       },
    //       computed: {
    //         id() {
    //           return mockCaseFile.id;
    //         },
    //         caseFile() {
    //           const altCaseFile = { ...mockCaseFile };
    //           altCaseFile.timestamp = moment().subtract(2, 'days');
    //           return altCaseFile;
    //         },
    //       },
    //     });

  //     await wrapper.vm.setLastAction();
  //     expect(wrapper.vm.lastActionAgo).toEqual('2 days ago');
  //   });
  // });
  });
});
