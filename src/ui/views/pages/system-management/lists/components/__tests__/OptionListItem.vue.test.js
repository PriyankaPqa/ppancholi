import flushPromises from 'flush-promises';
import {
  createLocalVue,
  mount,
} from '@/test/testSetup';

import { mockOptionItemData, EOptionListItemStatus } from '@/entities/optionItem';
import entityUtils from '@/entities/utils';
import Component from '../OptionListItem.vue';

const localVue = createLocalVue();

describe('OptionListItem.vue', () => {
  let wrapper;
  let items;

  beforeEach(async () => {
    items = mockOptionItemData();

    wrapper = mount(Component, {
      localVue,
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

  test('selecting a status opens the status dialog, confirming emits change-status event', async () => {
    await wrapper.find('[data-test="statusSelect__chip"]').trigger('click');

    await wrapper.find('[data-test="statusSelect__2"]').trigger('click');

    const dialog = wrapper.find('[data-test="optionsListItem__statusDialog"]');

    expect(dialog.exists()).toBe(true);

    expect(dialog.element).toBeVisible();

    await dialog.find('[data-test="dialog-submit-action"]').trigger('click');

    expect(wrapper.emitted('change-status')).toBeTruthy();

    expect(wrapper.emitted('change-status')[0]).toEqual([wrapper.vm.$props.item, EOptionListItemStatus.Inactive]);
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
});
