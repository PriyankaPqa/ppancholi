import { createLocalVue, shallowMount } from '@/test/testSetup';
import { CaseFile, mockCaseFilesSearchData } from '@/entities/case-file';
import routes from '@/constants/routes';
import { mockStorage } from '@/store/storage';

import Component from '../case-file-activity/CaseFileActivity.vue';

const localVue = createLocalVue();
const storage = mockStorage();
const mockCaseFile = new CaseFile(mockCaseFilesSearchData()[0]);

describe('CaseFileActivity.vue', () => {
  let wrapper;

  describe('Template', () => {
    beforeEach(() => {
      jest.clearAllMocks();

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
      it('is renders', () => {
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
  });

  describe('Methods', () => {
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
  });
});
