import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import { CaseFile, mockCaseFilesSearchData, mockCaseFilesData } from '@/entities/case-file';
import routes from '@/constants/routes';
import { mockStorage } from '@/store/storage';
import { RcDialog, RcConfirmationDialog } from '@crctech/component-library';
import {
  mockOptionItemData,
  EOptionListItemStatus,
} from '@/entities/optionItem';

import Component from '../case-file-activity/components/CaseFileTags.vue';

const localVue = createLocalVue();
const storage = mockStorage();
const mockCaseFile = new CaseFile(mockCaseFilesSearchData()[0]);

describe('CaseFileTags.vue', () => {
  let wrapper;
  describe('Template', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        propsData: {
          tags: mockCaseFile.tags,
          caseFileId: mockCaseFile.id,
        },
        mocks: {
          $route: {
            name: routes.caseFile.activity.name,
            params: {
              id: mockCaseFile.id,
            },
          },
        },
      });
      wrapper.vm.existingTags = mockCaseFile.tags;
    });

    describe('tags chips', () => {
      let element;
      beforeEach(() => {
        element = wrapper.findDataTest(`caseFileTags-chip-${wrapper.vm.existingTags[0].id}`);
      });
      it('renders', () => {
        expect(element.exists()).toBeTruthy();
      });

      it('calls initDeleteTag when click:close is emitted', async () => {
        jest.spyOn(wrapper.vm, 'initDeleteTag').mockImplementation(() => {});

        await element.vm.$emit('click:close');

        expect(wrapper.vm.initDeleteTag).toHaveBeenCalledTimes(1);
      });

      it('contains the tag name', () => {
        expect(element.text()).toEqual(wrapper.vm.existingTags[0].name.translation.en);
      });
    });

    describe('add tag button', () => {
      let element;
      beforeEach(() => {
        element = wrapper.findDataTest('caseFile-add-tags-btn');
      });
      it('is renders', () => {
        expect(element.exists()).toBeTruthy();
      });

      it('calls the method initAddTag when clicked', async () => {
        jest.spyOn(wrapper.vm, 'initAddTag').mockImplementation(() => {});

        await element.vm.$emit('click');

        expect(wrapper.vm.initAddTag).toHaveBeenCalledTimes(1);
      });
    });

    describe('add tags dialog', () => {
      it('renders when showAddTagsDialog is true', async () => {
        wrapper.vm.showAddTagsDialog = true;
        await wrapper.vm.$nextTick();
        expect(wrapper.findComponent(RcDialog).exists()).toBeTruthy();
      });

      it('does not render when showAddTagsDialog is false', async () => {
        wrapper.vm.showAddTagsDialog = false;
        await wrapper.vm.$nextTick();
        expect(wrapper.findComponent(RcDialog).exists()).toBeFalsy();
      });

      it('calls submitAddTags when submit is triggered', async () => {
        jest.spyOn(wrapper.vm, 'submitAddTags').mockImplementation(() => {});
        wrapper.vm.showAddTagsDialog = true;
        await wrapper.vm.$nextTick();

        const element = wrapper.findComponent(RcDialog);
        await element.vm.$emit('submit');

        expect(wrapper.vm.submitAddTags).toHaveBeenCalledTimes(1);
      });
    });

    describe('add tag dialog list tags', () => {
      it('renders when the dialog is open, if the list tag is active', async () => {
        wrapper.vm.showAddTagsDialog = true;
        wrapper.vm.listTags = [{ ...mockCaseFile.tags[0], active: true }];
        await wrapper.vm.$nextTick();

        const element = wrapper.findDataTest(`checkbox-item-${wrapper.vm.listTags[0].id}`);
        expect(element.exists()).toBeTruthy();
      });

      it('displays the tag name', async () => {
        wrapper.vm.showAddTagsDialog = true;
        wrapper.vm.listTags = [{ ...mockCaseFile.tags[0], active: true }];
        await wrapper.vm.$nextTick();

        const element = wrapper.findDataTest(`checkbox-item-${wrapper.vm.listTags[0].id}`);
        expect(element.text()).toContain(wrapper.vm.listTags[0].name.translation.en);
      });

      it('does not render when the dialog is open, if list tag is not active', async () => {
        wrapper.vm.showAddTagsDialog = true;
        wrapper.vm.listTags = [{ ...mockCaseFile.tags[0], active: false }];
        await wrapper.vm.$nextTick();

        const element = wrapper.findDataTest(`checkbox-item-${wrapper.vm.listTags[0].id}`);
        expect(element.exists()).toBeFalsy();
      });
    });

    describe('delete tags confirmation dialog', () => {
      it('renders when showDeleteTagDialog is true', async () => {
        wrapper.vm.showDeleteTagDialog = true;
        await wrapper.vm.$nextTick();
        expect(wrapper.findComponent(RcConfirmationDialog).exists()).toBeTruthy();
      });

      it('does not render when showDeleteTagDialog is false', async () => {
        wrapper.vm.showDeleteTagDialog = false;
        await wrapper.vm.$nextTick();
        expect(wrapper.findComponent(RcConfirmationDialog).exists()).toBeFalsy();
      });

      it('calls submitAddTags when submit is triggered', async () => {
        jest.spyOn(wrapper.vm, 'submitDeleteTag').mockImplementation(() => {});
        wrapper.vm.showDeleteTagDialog = true;
        await wrapper.vm.$nextTick();

        const element = wrapper.findComponent(RcConfirmationDialog);
        await element.vm.$emit('submit');

        expect(wrapper.vm.submitDeleteTag).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Computed', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          tags: mockCaseFile.tags,
          caseFileId: mockCaseFile.id,
        },
        mocks: {
          $route: {
            name: routes.caseFile.activity.name,
            params: {
              id: mockCaseFile.id,
            },
          },
        },
      });
    });

    describe('addButtonDisabled', () => {
      it('returns false if some list tags are selected ', () => {
        wrapper.vm.listTags = [{ ...mockCaseFile.tags[0], selected: true }];

        expect(wrapper.vm.addButtonDisabled).toBeFalsy();
      });

      it('returns true if no list tags are selected ', () => {
        wrapper.vm.listTags = [{ ...mockCaseFile.tags[0], selected: false }];

        expect(wrapper.vm.addButtonDisabled).toBeTruthy();
      });
    });

    describe('deleteTagDialogTitle', () => {
      it('is empty string if there is no tagToDelete', () => {
        wrapper.vm.tagToDelete = null;
        wrapper.vm.$nextTick();
        expect(wrapper.vm.deleteTagDialogTitle).toEqual('');
      });

      it('returns the right title if there is no tagToDelete', () => {
        wrapper.vm.tagToDelete = { id: '1', name: { translation: { en: 'foo' } } };
        expect(wrapper.vm.deleteTagDialogTitle).toEqual('caseFile.tags.removeTag "foo"');
      });
    });

    describe('remainingTags', () => {
      it('returns the existing tags when there is no tagToRemove', () => {
        wrapper.vm.existingTags = mockCaseFile.tags;
        wrapper.vm.tagToDelete = null;

        expect(wrapper.vm.remainingTags).toEqual(wrapper.vm.existingTags);
      });

      it('returns the existing tags without the tagToRemove when there is a tagToRemove', () => {
        wrapper.vm.existingTags = [mockCaseFile.tags[0]];
        wrapper.vm.tagToDelete = { id: mockCaseFile.tags[0].id, name: { translation: { en: 'foo' } } };

        expect(wrapper.vm.remainingTags).toEqual([]);
      });
    });
  });

  describe('lifecycle', () => {
    test('existing tags should be set to the value of the tag prop data', () => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          tags: mockCaseFile.tags,
          caseFileId: mockCaseFile.id,
        },
        mocks: {
          $route: {
            name: routes.caseFile.activity.name,
            params: {
              id: mockCaseFile.id,
            },
          },

        },
      });
      expect(wrapper.vm.existingTags).toEqual(mockCaseFile.tags);
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      storage.caseFile.actions.fetchTagsOptions.mockReturnValueOnce(mockOptionItemData());
      storage.caseFile.actions.setCaseFileTags.mockReturnValueOnce(mockCaseFilesData()[0]);

      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          tags: mockCaseFile.tags,
          caseFileId: mockCaseFile.id,
        },
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
    });

    describe('getActiveItemClass', () => {
      it('returns the right value when the argument has a property of existing equal to true', () => {
        const tag = { existing: true };
        expect(wrapper.vm.getActiveItemClass(tag)).toEqual('existingTag');
      });

      it('returns the right value when the argument has a property of existing equal to false', () => {
        const tag = { existing: false };
        expect(wrapper.vm.getActiveItemClass(tag)).toEqual('tagToAdd');
      });
    });

    describe('getCheckboxColor', () => {
      it('returns the right value when the argument has a property of existing equal to true', () => {
        const tag = { existing: true };
        expect(wrapper.vm.getCheckboxColor(tag)).toEqual('grey lighten-3');
      });

      it('returns the right value when the argument has a property of existing equal to false', () => {
        const tag = { existing: false };
        expect(wrapper.vm.getCheckboxColor(tag)).toEqual('primary');
      });
    });

    describe('initAddTag', () => {
      it('fetches the options lists from the store ', async () => {
        expect(wrapper.vm.$storage.caseFile.actions.fetchTagsOptions).toHaveBeenCalledTimes(0);

        await wrapper.vm.initAddTag();
        expect(wrapper.vm.$storage.caseFile.actions.fetchTagsOptions).toHaveBeenCalledTimes(1);
      });

      it('calls makeInitialListTags with the options list result from the storage', async () => {
        jest.spyOn(wrapper.vm, 'makeInitialListTags').mockImplementation(() => {});
        await wrapper.vm.initAddTag();
        expect(wrapper.vm.makeInitialListTags).toHaveBeenCalledWith(mockOptionItemData());
      });
    });

    describe('makeInitialListTags', () => {
      it('assigns into list tags the right tag object with property existing equal to true if existingTags contains a tag with the same id',
        async () => {
          const optionsTag = {
            id: 'mock-id',
            status: EOptionListItemStatus.Active,
            name: { translation: { en: 'mock-name-en', fr: 'mock-name-fr' } },
          };

          wrapper.vm.existingTags = [{ id: 'mock-id' }];
          wrapper.vm.listTags = [];

          await wrapper.vm.makeInitialListTags([optionsTag]);
          expect(wrapper.vm.listTags).toEqual([{
            id: optionsTag.id,
            name: optionsTag.name,
            existing: true,
            selected: false,
            active: true,
          }]);
        });

      it('assigns into list tags the right tag object with property existing equal to false if existingTags does not contain a tag with the same id',
        async () => {
          const optionsTag = {
            id: 'mock-id',
            status: EOptionListItemStatus.Active,
            name: { translation: { en: 'mock-name-en', fr: 'mock-name-fr' } },
          };

          wrapper.vm.existingTags = [{ id: 'mock-id-2' }];
          wrapper.vm.listTags = [];

          await wrapper.vm.makeInitialListTags([optionsTag]);
          expect(wrapper.vm.listTags).toEqual([{
            id: optionsTag.id,
            name: optionsTag.name,
            existing: false,
            selected: false,
            active: true,
          }]);
        });

      it('assigns into list tags the right tag object with property active  equal to false if the option tag has other than active',
        async () => {
          const optionsTag = {
            id: 'mock-id',
            status: EOptionListItemStatus.Inactive,
            name: { translation: { en: 'mock-name-en', fr: 'mock-name-fr' } },
          };

          wrapper.vm.existingTags = [{ id: 'mock-id-2' }];
          wrapper.vm.listTags = [];

          await wrapper.vm.makeInitialListTags([optionsTag]);
          expect(wrapper.vm.listTags).toEqual([{
            id: optionsTag.id,
            name: optionsTag.name,
            existing: false,
            selected: false,
            active: false,
          }]);
        });
    });

    describe('initDeleteTag', () => {
      it('assigns its argument to tagToDelete ', async () => {
        const tag = { foo: 'bar' };
        await wrapper.vm.initDeleteTag(tag);
        expect(wrapper.vm.tagToDelete).toEqual(tag);
      });

      it('sets showDeleteTagDialog to true ', async () => {
        const tag = { foo: 'bar' };
        await wrapper.vm.initDeleteTag(tag);
        expect(wrapper.vm.showDeleteTagDialog).toBeTruthy();
      });
    });

    describe('closeDeleteDialog', () => {
      it('assigns null to tagToDelete ', async () => {
        wrapper.vm.tagToDelete = { foo: 'bar' };
        await wrapper.vm.closeDeleteDialog();
        expect(wrapper.vm.tagToDelete).toEqual(null);
      });

      it('sets showDeleteTagDialog to false ', async () => {
        await wrapper.vm.closeDeleteDialog();
        expect(wrapper.vm.showDeleteTagDialog).toBeFalsy();
      });
    });

    describe('onSelectTag', () => {
      // eslint-disable-next-line max-len
      it('sets the property of a tag in listTags to selected equal to true if the argument contains a tag with the same id and a property of existing equal to false',
        async () => {
          const tags = [
            { id: 'mock-id-1', existing: true },
            { id: 'mock-id-2', existing: false },
          ];

          wrapper.vm.listTags = [
            { id: 'mock-id-1', selected: false },
            { id: 'mock-id-2', selected: false },
            { id: 'mock-id-3', selected: false },
          ];

          await wrapper.vm.onSelectTag(tags);

          expect(wrapper.vm.listTags).toEqual([
            { id: 'mock-id-1', selected: false },
            { id: 'mock-id-2', selected: true },
            { id: 'mock-id-3', selected: false },
          ]);
        });
    });

    describe('submitAddTags', () => {
      it('calls makePayload with the tags in the list tags that have existing or selected properties equal to true', async () => {
        jest.spyOn(wrapper.vm, 'makePayload').mockImplementation(() => {});
        wrapper.vm.listTags = [
          { id: 'mock-id-1', selected: false, existing: false },
          { id: 'mock-id-2', selected: true, existing: false },
          { id: 'mock-id-3', selected: false, existing: true },
        ];

        await wrapper.vm.submitAddTags();
        expect(wrapper.vm.makePayload).toHaveBeenCalledWith([
          { id: 'mock-id-2', selected: true, existing: false },
          { id: 'mock-id-3', selected: false, existing: true },
        ]);
      });

      it('calls the storage action setCaseFileTags with the result from the makePayload call', async () => {
        jest.clearAllMocks();
        storage.caseFile.actions.setCaseFileTags = jest.fn(() => mockCaseFilesData()[0]);

        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            tags: mockCaseFile.tags,
            caseFileId: mockCaseFile.id,
          },
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

        const mockPayload = [{ foo: 'bar' }];
        jest.spyOn(wrapper.vm, 'makePayload').mockImplementation(() => mockPayload);

        expect(wrapper.vm.$storage.caseFile.actions.setCaseFileTags).toHaveBeenCalledTimes(0);

        await wrapper.vm.submitAddTags();

        expect(wrapper.vm.$storage.caseFile.actions.setCaseFileTags).toHaveBeenCalledTimes(1);

        expect(wrapper.vm.$storage.caseFile.actions.setCaseFileTags).toHaveBeenCalledWith(wrapper.vm.caseFileId, mockPayload);
      });

      it('calls updateExistingTagsAfterAdd if the storage action returns a result', async () => {
        jest.spyOn(wrapper.vm, 'updateExistingTagsAfterAdd').mockImplementation(() => {});

        expect(wrapper.vm.updateExistingTagsAfterAdd).toHaveBeenCalledTimes(0);

        await wrapper.vm.submitAddTags();
        expect(wrapper.vm.updateExistingTagsAfterAdd).toHaveBeenCalledTimes(1);
      });

      it('does not call updateExistingTagsAfterAdd if the storage action does not return a result', async () => {
        storage.caseFile.actions.setCaseFileTags = jest.fn();

        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            tags: mockCaseFile.tags,
            caseFileId: mockCaseFile.id,
          },
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
        jest.spyOn(wrapper.vm, 'updateExistingTagsAfterAdd').mockImplementation(() => {});

        expect(wrapper.vm.updateExistingTagsAfterAdd).toHaveBeenCalledTimes(0);

        await wrapper.vm.submitAddTags();
        expect(wrapper.vm.updateExistingTagsAfterAdd).toHaveBeenCalledTimes(0);
      });

      it('emits updateActivities', async () => {
        await wrapper.vm.submitAddTags();
        expect(wrapper.emitted('updateActivities')).toBeTruthy();
      });
    });

    describe('submitDeleteTag', () => {
      it('calls makePayload with the remainingTags value', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            tags: mockCaseFile.tags,
            caseFileId: mockCaseFile.id,
          },
          computed: {
            remainingTag() {
              return [{ tag: 'mock-tag' }];
            },
          },
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
        jest.spyOn(wrapper.vm, 'makePayload').mockImplementation(() => {});

        await wrapper.vm.submitDeleteTag();
        expect(wrapper.vm.makePayload).toHaveBeenCalledWith(wrapper.vm.remainingTags);
      });

      it('calls the storage action setCaseFileTags with the result from the makePayload call', async () => {
        jest.clearAllMocks();
        storage.caseFile.actions.setCaseFileTags.mockReturnValueOnce(mockCaseFilesData()[0]);

        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            tags: mockCaseFile.tags,
            caseFileId: mockCaseFile.id,
          },
          computed: {
            remainingTag() {
              return [{ tag: 'mock-tag' }];
            },
          },
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

        const mockPayload = [{ foo: 'bar' }];
        jest.spyOn(wrapper.vm, 'makePayload').mockImplementation(() => mockPayload);
        expect(wrapper.vm.$storage.caseFile.actions.setCaseFileTags).toHaveBeenCalledTimes(0);

        await wrapper.vm.submitDeleteTag();

        expect(wrapper.vm.$storage.caseFile.actions.setCaseFileTags).toHaveBeenCalledTimes(1);

        expect(wrapper.vm.$storage.caseFile.actions.setCaseFileTags).toHaveBeenCalledWith(wrapper.vm.caseFileId, mockPayload);
      });

      it('sets existing tags to remaining tags if the storage action returns a result', async () => {
        jest.clearAllMocks();

        storage.caseFile.actions.setCaseFileTags.mockReturnValueOnce(mockCaseFilesData()[0]);

        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            tags: mockCaseFile.tags,
            caseFileId: mockCaseFile.id,
          },
          computed: {
            remainingTag() {
              return [{ tag: 'mock-tag' }];
            },
          },
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

        wrapper.vm.existingTags = [];

        await wrapper.vm.submitDeleteTag();
        expect(wrapper.vm.existingTags).toEqual(wrapper.vm.remainingTags);
      });

      it('does not set existing tags to remaining tags if the storage action does not return a result', async () => {
        storage.caseFile.actions.setCaseFileTags = jest.fn();

        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            tags: mockCaseFile.tags,
            caseFileId: mockCaseFile.id,
          },
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

        wrapper.vm.existingTags = [];

        await wrapper.vm.submitDeleteTag();
        expect(wrapper.vm.existingTags).toEqual([]);
      });

      it('emits updateActivities', async () => {
        await wrapper.vm.submitAddTags();
        expect(wrapper.emitted('updateActivities')).toBeTruthy();
      });
    });

    describe('makePayload', () => {
      it('returns the right object form the argument', () => {
        const tags = [{ id: 'id-1' }, { id: 'id-2' }];
        expect(wrapper.vm.makePayload(tags)).toEqual([{
          optionItemId: 'id-1',
          specifiedOther: null,
        },
        {
          optionItemId: 'id-2',
          specifiedOther: null,
        },
        ]);
      });
    });

    describe('updateExistingTagsAfterAdd', () => {
      it('sets the right value from listTags and initialInactiveTags into existingTags', async () => {
        const listTags = [
          {
            id: 'id-1', selected: true, existing: false, active: true,
          },
          {
            id: 'id-2', selected: false, existing: true, active: false,
          },
          {
            id: 'id-3', selected: false, existing: false, active: true,
          },
        ];

        wrapper.vm.listTags = listTags;
        wrapper.vm.initialInactiveTags = { id: 'id-inactive' };

        wrapper.vm.updateExistingTagsAfterAdd();
        expect(wrapper.vm.existingTags).toEqual([
          { id: 'id-1' },
          { id: 'id-2' },
          { id: 'id-inactive' },
        ]);
      });
    });
  });
});
