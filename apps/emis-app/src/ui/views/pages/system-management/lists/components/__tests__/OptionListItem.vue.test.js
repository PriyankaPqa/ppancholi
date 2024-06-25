import flushPromises from 'flush-promises';
import {
  createLocalVue,
  mount,
  shallowMount,
} from '@/test/testSetup';

import { mockOptionItemData, EOptionLists, mockOptionItem } from '@libs/entities-lib/optionItem';
import entityUtils from '@libs/entities-lib/utils';
import { Status } from '@libs/shared-lib/types';
import { useMockOptionListStore } from '@/pinia/option-list/optionList.mock';
import Component from '../OptionListItem.vue';

const localVue = createLocalVue();
const { pinia, optionListStore } = useMockOptionListStore();

describe('OptionListItem.vue', () => {
  let wrapper;
  let items;

  beforeEach(async () => {
    items = mockOptionItemData();

    wrapper = mount(Component, {
      localVue,
      pinia,
      propsData: {
        item: mockOptionItemData()[0],
        languageMode: 'en',
        isCascading: true,
        isSubItem: false,
        editMode: false,
        addSubItemLabel: 'add',
      },
    });
  });
  describe('Computed', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        pinia,
        propsData: {
          item: mockOptionItemData()[0],
          isSubItem: true,
          editMode: true,
          languageMode: 'en',
        },
      });
    });

    describe('itemStatuses', () => {
      it('returns the correct value', async () => {
        expect(wrapper.vm.itemStatuses).toEqual([
          Status.Active,
          Status.Inactive,
        ]);
      });
    });

    describe('renameNotAllowed', () => {
      it('returns true if is Role name', async () => {
        optionListStore.list = EOptionLists.Roles;

        await wrapper.setProps({
          isSubItem: false,
        });

        expect(wrapper.vm.renameNotAllowed).toBeTruthy();
      });

      it('returns false if is not Role', async () => {
        optionListStore.list = EOptionLists.FinancialAssistanceCategories;

        await wrapper.setProps({
          isSubItem: false,
        });

        expect(wrapper.vm.renameNotAllowed).toBeFalsy();
      });

      it('returns false if is subItem', async () => {
        optionListStore.list = EOptionLists.FinancialAssistanceCategories;

        await wrapper.setProps({
          isSubItem: true,
        });

        expect(wrapper.vm.renameNotAllowed).toBeFalsy();
      });
    });
  });

  describe('Methods', () => {
    describe('>> confirmChangeStatus', () => {
      it('dispatches the updateSubItemStatus action if is subItem', async () => {
        const items = mockOptionItemData();
        const item = items[0];
        const subItem = item.subitems[0];

        wrapper.vm.getParentItem = jest.fn(() => mockOptionItem({ id: 'id-1' }));

        await wrapper.setProps({
          isSubItem: true,
          items: mockOptionItemData(),
          item: mockOptionItemData()[0].subitems[0],
        });

        const status = Status.Inactive;
        wrapper.vm.changeToStatus = status;
        optionListStore.updateSubItemStatus = jest.fn();

        await wrapper.vm.confirmChangeStatus();
        const payload = {
          itemId: 'id-1',
          subItemId: subItem.id,
          status,
        };

        expect(optionListStore.updateSubItemStatus).toHaveBeenCalledWith(payload);
      });

      it('dispatches the updateStatus action if is not subItem', async () => {
        await wrapper.setProps({
          isSubItem: false,
        });

        const status = Status.Inactive;
        wrapper.vm.changeToStatus = status;
        optionListStore.updateStatus = jest.fn();

        await wrapper.vm.confirmChangeStatus();
        const payload = {
          id: mockOptionItemData()[0].id,
          status,
        };

        expect(optionListStore.updateStatus).toHaveBeenCalledWith(payload);
      });
    });

    describe('clearDescription', () => {
      it('clears the field description', async () => {
        wrapper.setData({ description: { en: 'foo', fr: 'bar' } });
        await wrapper.vm.clearDescription();
        expect(wrapper.vm.description).toEqual({
          translation: {
            en: '',
            fr: '',
          },
        });
      });
    });
  });

  test('form is not visible if edit mode is false', async () => {
    expect(wrapper.find('[data-test="optionsListItem__nameInput"]').exists()).toBe(false);
    expect(wrapper.find('[data-test="optionsListItem__saveBtn"]').exists()).toBe(false);
    expect(wrapper.find('[data-test="optionsListItem__cancelBtn"]').exists()).toBe(false);
    expect(wrapper.find('[data-test="optionsListItem__editBtn"]').exists()).toBe(true);

    await wrapper.setProps({
      editMode: true,
    });

    expect(wrapper.find('[data-test="optionsListItem__nameInput"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="optionsListItem__saveBtn"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="optionsListItem__cancelBtn"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="optionsListItem__editBtn"]').exists()).toBe(false);
  });

  test('name renders correctly in different language modes', async () => {
    const name = wrapper.find('[data-test="optionsListItem__name"]');

    expect(name.text().indexOf('Flood')).toBe(0);

    await wrapper.setProps({
      languageMode: 'fr',
    });

    expect(name.text().indexOf('Inundation')).toBe(0);
  });

  test('the expand button shows/hides the children', async () => {
    const expandButton = wrapper.find('[data-test="optionsListItem__expandBtn"]');

    expect(wrapper.vm.$data.subItemsExpanded).toBe(true);

    await expandButton.trigger('click');

    expect(wrapper.vm.$data.subItemsExpanded).toBe(false);
  });

  test('selecting a status opens the status dialog, submitting dialog triggers the method confirmChangeStatus', async () => {
    wrapper.vm.confirmChangeStatus = jest.fn();

    await wrapper.find('[data-test="statusSelect__chip"]').trigger('click');

    await wrapper.find('[data-test="statusSelect__2"]').trigger('click');

    const dialog = wrapper.find('[data-test="optionsListItem__statusDialog"]');

    expect(dialog.exists()).toBe(true);

    await dialog.find('[data-test="dialog-submit-action"]').trigger('click');

    expect(wrapper.vm.confirmChangeStatus).toHaveBeenCalledTimes(1);
  });

  test('the save button emits the save event if a name is present', async () => {
    await wrapper.setProps({
      editMode: true,
      hasDescription: true,
    });

    await wrapper.setData({
      name: entityUtils.initMultilingualAttributes(),
    });

    const saveButton = wrapper.find('[data-test="optionsListItem__saveBtn"]');

    await saveButton.trigger('click');

    expect(wrapper.emitted('save-item')).toBeFalsy();

    await wrapper.setData({
      name: {
        translation: {
          en: 'Name EN',
          fr: 'Name FR',
        },
      },
      description: {
        translation: {
          en: 'Desc EN',
          fr: 'Desc FR',
        },
      },
    });

    await wrapper.vm.saveItem();

    await flushPromises();

    expect(wrapper.emitted('save-item')).toBeTruthy();
    expect(wrapper.emitted('save-item')[0]).toEqual([
      wrapper.vm.$props.item,
      {
        translation: {
          en: 'Name EN',
          fr: 'Name FR',
        },
      },
      {
        translation: {
          en: 'Desc EN',
          fr: 'Desc FR',
        },
      },
    ]);
  });

  test('the cancel button emits the cancel event', async () => {
    await wrapper.setProps({
      editMode: true,
    });

    expect(wrapper.emitted('cancel-edit')).toBeFalsy();

    await wrapper.find('[data-test="optionsListItem__cancelBtn"]').trigger('click');

    expect(wrapper.emitted('cancel-edit')).toBeTruthy();
  });

  test('the keyboard events for enter and esc emit the proper events', async () => {
    // wrapper.vm.$refs.form.validate = jest.fn(() => true);
    wrapper = mount(Component, {
      localVue,
      pinia,
      propsData: {
        item: mockOptionItemData()[0],
        isSubItem: true,
        editMode: true,
        languageMode: 'en',
      },
      computed: {
        allNames() {
          return [{
            translation: {
              en: 'name 1 en',
              fr: 'name 1 fr',
            },
          }, {
            translation: {
              en: 'name 2 en',
              fr: 'name 2 fr  ',
            },
          }];
        },
      },
    });

    await wrapper.setProps({
      editMode: true,
    });

    await wrapper.setData({
      name: {
        translation: {
          en: 'Name EN',
          fr: 'Name FR',
        },
      },
    });

    const textInput = wrapper.find('[data-test="optionsListItem__nameInput"]');

    await textInput.trigger('keydown.enter');

    await wrapper.vm.$refs.form.validate();

    await flushPromises();

    expect(wrapper.emitted('save-item')).toBeTruthy();

    await textInput.trigger('keydown.esc');

    expect(wrapper.emitted('cancel-edit')).toBeTruthy();
  });

  test('the description is displayed if the hasDescription prop is true', async () => {
    expect(wrapper.find('.optionsList__description').exists()).toBe(false);

    await wrapper.setProps({
      hasDescription: true,
    });

    expect(wrapper.find('.optionsList__description').exists()).toBe(true);
  });

  test('the description input is displayed if hasDescription and editMode are true', async () => {
    expect(wrapper.find('[data-test="optionsListItem__descriptionInput"]').exists()).toBe(false);

    await wrapper.setProps({
      editMode: true,
      hasDescription: true,
    });

    expect(wrapper.find('[data-test="optionsListItem__descriptionInput"]').exists()).toBe(true);
  });

  test('the description allows a maximum number of 250 characters', async () => {
    await wrapper.setProps({
      editMode: true,
      hasDescription: true,
    });

    const description = wrapper.find('[data-test="optionsListItem__descriptionInput"]');

    await description.setValue('x'.repeat(251));

    await wrapper.vm.$refs.form.validate();
    await flushPromises();

    expect(description.element.previousElementSibling.classList).toContain('error--text');

    await description.setValue('x'.repeat(250));

    await wrapper.vm.$refs.form.validate();
    await flushPromises();

    expect(description.element.previousElementSibling.classList).not.toContain('error--text');
  });

  test('when the edit mode is changed the name and language data is reset to the original value from the item prop', async () => {
    await wrapper.setProps({
      editMode: true,
      hasDescription: true,
    });

    const name = wrapper.find('[data-test="optionsListItem__nameInput"]');

    expect(name.element.value).toBe(items[0].name.translation.en);

    await name.setValue('Hello Name');

    expect(name.element.value).toBe('Hello Name');

    await wrapper.setProps({
      editMode: false,
    });

    await wrapper.setProps({
      editMode: true,
    });

    expect(wrapper.find('[data-test="optionsListItem__nameInput"]').element.value).toBe(items[0].name.translation.en);
  });

  test('when the component mounts, the name and description IMultilingual fields are filled with available values', async () => {
    wrapper = mount(Component, {
      localVue,
      pinia,
      propsData: {
        editMode: true,
        hasDescription: true,
        isCascading: true,
        isSubItem: false,
        languageMode: 'en',
        item: {
          ...items[0],
          name: {
            translation: {
              en: 'Clementine',
              fr: '',
            },
          },
          description: {
            translation: {
              en: 'Description Clementine',
              fr: '',
            },
          },
        },
      },
    });

    expect(wrapper.vm.name).toEqual({ translation: { en: 'Clementine', fr: 'Clementine' } });
    expect(wrapper.vm.description).toEqual({ translation: { en: 'Description Clementine', fr: 'Description Clementine' } });
  });

  describe('setIsDefault', () => {
    it('calls the right action', async () => {
      await wrapper.setData({ item: { ...wrapper.vm.item, isDefault: false } });
      optionListStore.setIsDefault = jest.fn();
      wrapper.vm.setIsDefault();
      expect(optionListStore.setIsDefault).toHaveBeenCalledWith({ id: wrapper.vm.item.id, isDefault: true });
    });

    it('doesnt do anything in readonly', async () => {
      await wrapper.setProps({ isSubItem: false, readonly: true });
      await wrapper.setData({ item: { ...wrapper.vm.item, isDefault: false } });
      optionListStore.setIsDefault = jest.fn();
      wrapper.vm.setIsDefault();
      expect(optionListStore.setIsDefault).not.toHaveBeenCalled();
    });
  });

  describe('setRestrictFinancial', () => {
    it('calls the right action', async () => {
      await wrapper.setData({ item: { ...wrapper.vm.item, restrictFinancial: false } });
      optionListStore.setRestrictFinancial = jest.fn();
      wrapper.vm.setRestrictFinancial();
      expect(optionListStore.setRestrictFinancial).toHaveBeenCalledWith({ id: wrapper.vm.item.id, restrictFinancial: true });
    });

    it('doesnt do anything in readonly', async () => {
      await wrapper.setProps({ isSubItem: false, readonly: true });
      await wrapper.setData({ item: { ...wrapper.vm.item, restrictFinancial: false } });
      optionListStore.setRestrictFinancial = jest.fn();
      wrapper.vm.setRestrictFinancial();
      expect(optionListStore.setRestrictFinancial).not.toHaveBeenCalled();
    });
  });

  describe('setLodging', () => {
    it('calls the right action', async () => {
      await wrapper.setData({ item: { ...wrapper.vm.item, isLodging: false } });
      optionListStore.setLodging = jest.fn();
      wrapper.vm.setLodging();
      expect(optionListStore.setLodging).toHaveBeenCalledWith({ id: wrapper.vm.item.id, isLodging: true });
    });

    it('doesnt do anything in readonly', async () => {
      await wrapper.setProps({ isSubItem: false, readonly: true });
      await wrapper.setData({ item: { ...wrapper.vm.item, isLodging: false } });
      optionListStore.setLodging = jest.fn();
      wrapper.vm.setLodging();
      expect(optionListStore.setLodging).not.toHaveBeenCalled();
    });
  });

  describe('setIsOther', () => {
    it('calls the right action when is not subitem', async () => {
      await wrapper.setProps({ isSubItem: false });
      await wrapper.setData({ item: { ...wrapper.vm.item, isOther: false } });
      optionListStore.setIsOther = jest.fn();
      wrapper.vm.setIsOther();
      expect(optionListStore.setIsOther).toHaveBeenCalledWith({ id: wrapper.vm.item.id, isOther: true });
    });

    it('doesnt do anything in readonly', async () => {
      await wrapper.setProps({ isSubItem: false, readonly: true });
      await wrapper.setData({ item: { ...wrapper.vm.item, isOther: false } });
      optionListStore.setIsOther = jest.fn();
      wrapper.vm.setIsOther();
      expect(optionListStore.setIsOther).not.toHaveBeenCalled();
    });

    it('calls the right action when is  subitem', async () => {
      await wrapper.setProps({ isSubItem: true });
      await wrapper.setData({ item: { ...wrapper.vm.item, isOther: false } });
      optionListStore.setSubItemIsOther = jest.fn();
      wrapper.vm.getParentItem = jest.fn(() => ({ id: 'p-id-1' }));
      wrapper.vm.setIsOther();
      expect(optionListStore.setSubItemIsOther).toHaveBeenCalledWith({ itemId: 'p-id-1', subItemId: wrapper.vm.item.id, isOther: true });
    });

    it('displays error if no response', async () => {
      await wrapper.setProps({ isSubItem: false });
      optionListStore.setIsOther = jest.fn();
      await wrapper.vm.setIsOther();
      expect(wrapper.vm.$toasted.global.error).toHaveBeenCalledWith('system_management.lists.errorUpdating');
    });

    it('displays right message if isOther is set to false', async () => {
      await wrapper.setProps({ isSubItem: false });
      optionListStore.setIsOther = jest.fn(() => ({ res: '' }));
      await wrapper.setData({ item: { ...wrapper.vm.item, isOther: true } });
      await wrapper.vm.setIsOther();
      expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledWith('system_management.lists.otherOptionRemoved');
    });

    it('displays right message if isOther is set to true', async () => {
      await wrapper.setProps({ isSubItem: false });
      await wrapper.setData({ item: { ...wrapper.vm.item, isOther: false } });
      optionListStore.setIsOther = jest.fn(() => ({ res: '' }));
      await wrapper.vm.setIsOther();

      expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledWith('system_management.lists.otherOptionSet');
    });
  });
});
