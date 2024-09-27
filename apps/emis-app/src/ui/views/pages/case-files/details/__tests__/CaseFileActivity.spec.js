/* eslint-disable max-params */
import flushPromises from 'flush-promises';
import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import { mockCaseFileActivities, CaseFileTriage, mockCaseFileEntity } from '@libs/entities-lib/case-file';
import { mockOptionItemData } from '@libs/entities-lib/optionItem';
import { EEventStatus, mockEventEntity } from '@libs/entities-lib/event';
import { useMockCaseFileStore } from '@/pinia/case-file/case-file.mock';
import { useMockEventStore } from '@/pinia/event/event.mock';
import { useMockUserAccountStore } from '@/pinia/user-account/user-account.mock';
import Component from '../case-file-activity/CaseFileActivity.vue';

const localVue = createLocalVue();

const mockCaseFile = mockCaseFileEntity({ id: '1' });
const mockActivities = mockCaseFileActivities();
const mockEvent = mockEventEntity();
mockEvent.schedule.status = EEventStatus.Open;

const { pinia, caseFileStore } = useMockCaseFileStore();
const eventStore = useMockEventStore(pinia).eventStore;
const userStore = useMockUserAccountStore(pinia).userAccountStore;

describe('CaseFileActivity', () => {
  let wrapper;

  const mountWrapperOverwriteComputed = async (canEdit) => {
    wrapper = shallowMount(Component, {
      localVue,
      pinia,
      data() {
        return {
          caseFileActivities: mockActivities,
        };
      },
      propsData: { id: mockCaseFile.id },
      computed: {
        canEdit() {
          return canEdit;
        },
        canEditTags() {
          return canEdit;
        },
        caseFile() {
          return mockCaseFile;
        },
        event() {
          return mockEvent;
        },
        tags() {
          return [{ id: '1', name: { translation: { en: 'name' } } }];
        },
      },

    });
    await flushPromises();
  };

  const mountWrapper = async (fullMount = false, level = 6, hasRole = 'role', readonly = false, mocks = {}) => {
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      pinia,
      propsData: { id: mockCaseFile.id },
      computed: {
        caseFile() {
          return mockCaseFile;
        },
        event() {
          return mockEvent;
        },
        readonly() {
          return readonly;
        },
      },
      mocks: {
        $hasLevel: (lvl) => lvl <= `level${level}` && level != null,
        $hasRole: (r) => r === hasRole,
        ...mocks,
      },
    });
    await flushPromises();
  };

  describe('Template', () => {
    beforeEach(async () => {
      jest.clearAllMocks();
      await mountWrapperOverwriteComputed(true);
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
        expect(element.props('tags')).toEqual(wrapper.vm.tags);
      });

      it('passes readonly as props', async () => {
        await mountWrapperOverwriteComputed(false);
        element = wrapper.findDataTest('caseFileActivity-tags');
        expect(element.props('readonly')).toBeTruthy();
        await mountWrapperOverwriteComputed(true);
        element = wrapper.findDataTest('caseFileActivity-tags');
        expect(element.props('readonly')).toBeFalsy();
      });

      it('passes the case file id as props', () => {
        expect(element.props('caseFileId')).toEqual(mockCaseFile.id);
      });
    });

    describe('triage select', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('caseFileActivity-triage-select');
        expect(element.exists()).toBeTruthy();
      });

      it('passes readonly as props', async () => {
        await mountWrapperOverwriteComputed(false);
        let element = wrapper.findDataTest('caseFileActivity-triage-select');
        expect(element.attributes('readonly')).toBeTruthy();
        await mountWrapperOverwriteComputed(true);
        element = wrapper.findDataTest('caseFileActivity-triage-select');
        expect(element.attributes('readonly')).toBeFalsy();
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
      wrapper = shallowMount(Component, {
        localVue,
        pinia,
        propsData: { id: mockCaseFile.id },
      });
    });

    describe('id', () => {
      it('returns the right value', () => {
        expect(wrapper.vm.id).toEqual(mockCaseFile.id);
      });
    });

    describe('caseFile', () => {
      it('return the case file by id from the storage', () => {
        expect(JSON.stringify(wrapper.vm.caseFile)).toEqual(JSON.stringify(mockCaseFile));
      });
    });

    describe('canEdit', () => {
      it('returns the true for level 1+ users if not readonly', async () => {
        await mountWrapper(false, 0);
        expect(wrapper.vm.canEdit).toBe(false);
        await mountWrapper(false, 1);
        expect(wrapper.vm.canEdit).toBe(true);
        await mountWrapper(false, 1, null, true);
        expect(wrapper.vm.canEdit).toBe(false);
      });
    });

    describe('canEditTags', () => {
      it('returns the true for level 2+ users', async () => {
        await mountWrapper(false, 0, null, false);
        expect(wrapper.vm.canEditTags).toBe(false);
        await mountWrapper(false, 1, null, false);
        expect(wrapper.vm.canEditTags).toBe(false);
        await mountWrapper(false, 2, null, false);
        expect(wrapper.vm.canEditTags).toBe(true);
        await mountWrapper(false, 1, null, true);
        expect(wrapper.vm.canEditTags).toBe(false);
      });
    });

    describe('canEditLabels', () => {
      it('returns the true for level 0+ users if not readonly , else it returns false', async () => {
        await mountWrapper(false, 0, null, false);
        expect(wrapper.vm.canEditLabels).toBe(true);
        await mountWrapper(false, 1, null, false);
        expect(wrapper.vm.canEditLabels).toBe(true);
        await mountWrapper(false, 1, null, true);
        expect(wrapper.vm.canEditLabels).toBe(false);
        await mountWrapper(false, 0, null, true);
        expect(wrapper.vm.canEditLabels).toBe(false);
      });
    });

    describe('tags', () => {
      it('should call the storage getter and return the tags data in the right form', async () => {
        const caseFile = { ...mockCaseFile, tags: [{ optionItemId: 'id-1' }] };

        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: { id: mockCaseFile.id },

          computed: {
            caseFile() {
              return caseFile;
            },
            event() {
              return mockEvent;
            },
          },
        });

        caseFileStore.getTagsOptions = jest.fn(() => [{ ...mockOptionItemData()[1], id: 'id-1', name: { translation: { en: 'name-en', fr: 'name-fr' } } }]);

        await flushPromises();

        expect(caseFileStore.getTagsOptions).toHaveBeenCalledWith(false);
        expect(wrapper.vm.tags).toEqual([{ id: 'id-1', name: { translation: { en: 'name-en', fr: 'name-fr' } } }]);
      });
    });
  });

  describe('lifecycle', () => {
    beforeEach(async () => {
      wrapper = shallowMount(Component, {
        localVue,
        pinia,
        propsData: { id: mockCaseFile.id },

        computed: {
          caseFile() {
            return mockCaseFile;
          },
          event() {
            return mockEvent;
          },
        },
      });

      await flushPromises();
    });

    describe('created', () => {
      it('should call fetch', () => {
        expect(caseFileStore.fetch).toHaveBeenCalledWith(mockCaseFile.id);
      });

      it('should call fetchCaseFileActivities', async () => {
        wrapper.vm.fetchCaseFileActivities = jest.fn();

        expect(wrapper.vm.fetchCaseFileActivities).toHaveBeenCalledTimes(0);

        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });

        expect(wrapper.vm.fetchCaseFileActivities).toHaveBeenCalledTimes(1);
      });

      it('should call fetchRoles', () => {
        expect(userStore.fetchRoles).toHaveBeenCalled();
      });

      it('should call fetchScreeningIds', () => {
        expect(caseFileStore.fetchScreeningIds).toHaveBeenCalled();
      });

      it('should call fetchExceptionalAuthenticationTypes', () => {
        expect(eventStore.fetchExceptionalAuthenticationTypes).toHaveBeenCalled();
      });

      it('should call fetchTagsOptions', () => {
        expect(caseFileStore.fetchTagsOptions).toHaveBeenCalled();
      });

      it('should call attachToChanges', async () => {
        wrapper.vm.attachToChanges = jest.fn();

        expect(wrapper.vm.attachToChanges).toHaveBeenCalledTimes(0);

        await wrapper.vm.$options.created[0].call(wrapper.vm);

        expect(wrapper.vm.attachToChanges).toHaveBeenCalledWith(true);
      });
    });

    describe('destroyed', () => {
      it('should call attachToChanges', async () => {
        wrapper.vm.attachToChanges = jest.fn();

        expect(wrapper.vm.attachToChanges).toHaveBeenCalledTimes(0);

        wrapper.destroy();

        expect(wrapper.vm.attachToChanges).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        pinia,
        propsData: { id: mockCaseFile.id },

        computed: {
          caseFile() {
            return mockCaseFile;
          },
          event() {
            return mockEvent;
          },
        },
      });
    });

    describe('setCaseFileIsDuplicate', () => {
      it('calls the setCaseFileIsDuplicate action with the correct params', async () => {
        expect(caseFileStore.setCaseFileIsDuplicate).toHaveBeenCalledTimes(0);

        await wrapper.vm.setCaseFileIsDuplicate();

        expect(caseFileStore.setCaseFileIsDuplicate).toHaveBeenCalledTimes(1);
        expect(caseFileStore.setCaseFileIsDuplicate).toHaveBeenCalledWith(
          mockCaseFile.id,
          !mockCaseFile.isDuplicate,
        );
      });
    });

    describe('setCaseFileTriage', () => {
      it('calls the setTriage action with the correct params', async () => {
        expect(caseFileStore.setCaseFileTriage).toHaveBeenCalledTimes(0);

        const triage = CaseFileTriage.Tier1;

        await wrapper.vm.setCaseFileTriage(triage);

        expect(caseFileStore.setCaseFileTriage).toHaveBeenCalledTimes(1);
        expect(caseFileStore.setCaseFileTriage).toHaveBeenCalledWith(
          mockCaseFile.id,
          triage,
        );
      });
    });

    describe('sortCaseFileActivities', () => {
      beforeEach(async () => {
        await wrapper.setData({ caseFileActivities: [{
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
        }] });
      });

      it('sort CaseFile activities asc', async () => {
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
