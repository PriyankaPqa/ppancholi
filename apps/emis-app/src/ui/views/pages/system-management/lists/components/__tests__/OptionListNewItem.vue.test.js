import flushPromises from 'flush-promises';
import {
  createLocalVue,
  shallowMount,
  mount,
} from '@/test/testSetup';
import { Status } from '@libs/shared-lib/types';
import { useMockOptionListStore } from '@/pinia/option-list/optionList.mock';
import Component from '../OptionListNewItem.vue';

const localVue = createLocalVue();
const { pinia } = useMockOptionListStore();

describe('OptionListNewItem.vue', () => {
  describe('Computed', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        pinia,
        propsData: {
          isSubItem: true,
          addMode: true,
          languageMode: 'en',
          addSubItemLabel: 'add sub item',
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
  });

  describe('Methods', () => {
    describe('clearDescription', () => {
      it('clears the field description', async () => {
        const wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            isSubItem: true,
            hasDescription: true,
            addMode: true,
            languageMode: 'en',
            addSubItemLabel: 'add sub item',
          },
          data() {
            return { description: { en: 'foo', fr: 'bar' } };
          },
        });

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

  test('loading state disables the button and text input', () => {
    const wrapper = mount(Component, {
      localVue,
      pinia,
      propsData: {
        loading: true,
        hasDescription: true,
        languageMode: 'en',
        addSubItemLabel: 'add sub item',
      },
    });

    const saveButton = wrapper.find('[data-test="optionListNewItem__saveBtn"]');
    expect(saveButton.props('loading')).toBe(true);

    const cancelButton = wrapper.find('[data-test="optionListNewItem__cancelBtn"]');
    expect(cancelButton.props('disabled')).toBe(true);

    const nameInput = wrapper.find('[data-test="optionListNewItem__nameInput"]');
    expect(nameInput.attributes('disabled')).toBe('disabled');

    const descriptionInput = wrapper.find('[data-test="optionListNewItem__descriptionInput"]');
    expect(descriptionInput.attributes('disabled')).toBe('disabled');
  });

  test('the form is not visible unless addMode is true for sub item type', async () => {
    const wrapper = mount(Component, {
      localVue,
      pinia,
      propsData: {
        isSubItem: true,
        hasDescription: true,
        addMode: false,
        languageMode: 'en',
        addSubItemLabel: 'add sub item',
      },
    });

    expect(wrapper.find('[data-test="optionListNewItem__saveBtn"]').exists()).toBe(false);
    expect(wrapper.find('[data-test="optionListNewItem__cancelBtn"]').exists()).toBe(false);
    expect(wrapper.find('[data-test="optionListNewItem__nameInput"]').exists()).toBe(false);
    expect(wrapper.find('[data-test="optionListNewItem__descriptionInput"]').exists()).toBe(false);
    expect(wrapper.find('[data-test="optionListNewItem__addBtn"]').exists()).toBe(true);

    await wrapper.setProps({
      addMode: true,
    });

    expect(wrapper.find('[data-test="optionListNewItem__saveBtn"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="optionListNewItem__cancelBtn"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="optionListNewItem__nameInput"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="optionListNewItem__descriptionInput"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="optionListNewItem__addBtn"]').exists()).toBe(false);
  });

  test('the add sub item button emits the add-mode event', async () => {
    const wrapper = mount(Component, {
      localVue,
      pinia,
      propsData: {
        isSubItem: true,
        addMode: false,
        parentItemId: 'parentid',
        languageMode: 'en',
        addSubItemLabel: 'add sub item',
      },
    });

    await wrapper.find('[data-test="optionListNewItem__addBtn"]').trigger('click');

    expect(wrapper.emitted('add-mode').length).toBe(1);
    expect(wrapper.emitted('add-mode')[0]).toEqual(['parentid']);
  });

  test('the status select changes the status', async () => {
    const wrapper = mount(Component, {
      localVue,
      pinia,
      propsData: {
        languageMode: 'en',
        addSubItemLabel: 'add sub item',
      },
    });

    expect(wrapper.vm.$data.currentStatus).toEqual(Status.Active);

    await wrapper.find('[data-test="statusSelect__chip"]').trigger('click');

    await wrapper.find('[data-test="statusSelect__2"]').trigger('click');

    expect(wrapper.vm.$data.currentStatus).toEqual(Status.Inactive);
  });

  test('the save button emits the save event if the name exists', async () => {
    const wrapper = mount(Component, {
      localVue,
      pinia,
      propsData: {
        isSubItem: true,
        addMode: true,
        parentItemId: 'parentid',
        languageMode: 'en',
        addSubItemLabel: 'add sub item',
      },
    });

    const saveButton = wrapper.find('[data-test="optionListNewItem__saveBtn"]');

    await saveButton.trigger('click');

    expect(wrapper.emitted('save')).toBeFalsy();

    await wrapper.setData({
      name: {
        translation: {
          en: 'Name',
          fr: 'Name',
        },
      },
    });

    await saveButton.trigger('click');

    await flushPromises();

    expect(wrapper.emitted('save').length).toBe(1);
    expect(wrapper.emitted('save')[0]).toEqual([
      {
        translation: {
          en: 'Name',
          fr: 'Name',
        },
      },
      {
        translation: {
          en: '',
          fr: '',
        },
      },
      Status.Active,
      'parentid']);
  });

  test('the save button emits the save event if the name exists', async () => {
    const wrapper = mount(Component, {
      localVue,
      pinia,
      propsData: {
        isSubItem: true,
        hasDescription: true,
        addMode: true,
        parentItemId: 'parentid',
        languageMode: 'en',
        addSubItemLabel: 'add sub item',
      },
    });

    const saveButton = wrapper.find('[data-test="optionListNewItem__saveBtn"]');

    await saveButton.trigger('click');

    expect(wrapper.emitted('save')).toBeFalsy();

    await wrapper.setData({
      name: {
        translation: {
          en: 'Name',
          fr: 'Name',
        },
      },
      description: {
        translation: {
          en: 'Description',
          fr: 'Description',
        },
      },
    });

    await saveButton.trigger('click');

    await flushPromises();

    expect(wrapper.emitted('save').length).toBe(1);
    expect(wrapper.emitted('save')[0]).toEqual([
      {
        translation: {
          en: 'Name',
          fr: 'Name',
        },
      },
      {
        translation: {
          en: 'Description',
          fr: 'Description',
        },
      },
      Status.Active,
      'parentid',
    ]);
  });

  test('the status is reset to Active after saving a new item with a status of Inactive', async () => {
    const wrapper = mount(Component, {
      localVue,
      pinia,
      propsData: {
        isSubItem: true,
        hasDescription: true,
        addMode: true,
        parentItemId: 'parentid',
        languageMode: 'en',
        addSubItemLabel: 'add sub item',
      },
    });

    const saveButton = wrapper.find('[data-test="optionListNewItem__saveBtn"]');

    await wrapper.setData({
      name: {
        translation: {
          en: 'Name',
          fr: 'Name',
        },
      },
      description: {
        translation: {
          en: 'Description',
          fr: 'Description',
        },
      },
    });

    expect(wrapper.vm.currentStatus).toEqual(Status.Active);

    await wrapper.find('[data-test="statusSelect__chip"]').trigger('click');

    await wrapper.find('[data-test="statusSelect__2"]').trigger('click');

    expect(wrapper.vm.$data.currentStatus).toEqual(Status.Inactive);

    await saveButton.trigger('click');

    await flushPromises();

    expect(wrapper.vm.$data.currentStatus).toEqual(Status.Active);
  });

  test('the keyboard events for enter and esc emit the proper events in name field', async () => {
    const wrapper = mount(Component, {
      localVue,
      pinia,
      propsData: {
        languageMode: 'en',
        addSubItemLabel: 'add sub item',
      },
    });

    await wrapper.setData({
      name: {
        translation: {
          en: 'Name',
          fr: 'Name',
        },
      },
    });

    const textInput = wrapper.find('[data-test="optionListNewItem__nameInput"]');

    await textInput.trigger('keydown.enter');

    await flushPromises();

    expect(wrapper.emitted('save')).toBeTruthy();

    await textInput.trigger('keydown.esc');

    expect(wrapper.emitted('cancel')).toBeTruthy();
  });

  test('the keyboard events for enter and esc emit the proper events in description field', async () => {
    const wrapper = mount(Component, {
      localVue,
      pinia,
      propsData: {
        hasDescription: true,
        languageMode: 'en',
        addSubItemLabel: 'add sub item',
      },
      data() {
        return {
          name: {
            translation: {
              en: 'Name',
              fr: 'Name',
            },
          },
          description: {
            translation: {
              en: 'Description',
              fr: 'Description-fr',
            },
          },
        };
      },
    });

    const textInput = wrapper.find('[data-test="optionListNewItem__descriptionInput"]');

    await textInput.trigger('keydown.enter');

    await flushPromises();

    expect(wrapper.emitted('save')).toBeTruthy();

    await textInput.trigger('keydown.esc');

    expect(wrapper.emitted('cancel')).toBeTruthy();
  });

  test('the description is displayed if the hasDescription prop is true', async () => {
    const wrapper = mount(Component, {
      localVue,
      pinia,
      propsData: {
        languageMode: 'en',
        addSubItemLabel: 'add sub item',
      },
    });

    expect(wrapper.find('[data-test="optionListNewItem__descriptionInput"]').exists()).toBe(false);

    await wrapper.setProps({
      hasDescription: true,
    });

    expect(wrapper.find('[data-test="optionListNewItem__descriptionInput"]').exists()).toBe(true);
  });

  test('the description allows a maximum number of 250 characters', async () => {
    const wrapper = mount(Component, {
      localVue,
      pinia,
      propsData: {
        languageMode: 'en',
        addSubItemLabel: 'add sub item',
      },
    });

    await wrapper.setProps({
      hasDescription: true,
    });

    const description = wrapper.find('[data-test="optionListNewItem__descriptionInput"]');

    await description.setValue('x'.repeat(251));

    await wrapper.vm.$refs.form.validate();
    await flushPromises();

    expect(description.element.previousElementSibling.classList).toContain('error--text');

    await description.setValue('x'.repeat(250));

    await wrapper.vm.$refs.form.validate();
    await flushPromises();

    expect(description.element.previousElementSibling.classList).not.toContain('error--text');
  });

  test('when languageMode changes it copies the name and description fields to unfilled languages', async () => {
    const wrapper = mount(Component, {
      localVue,
      pinia,
      propsData: {
        languageMode: 'en',
        addSubItemLabel: 'add sub item',
      },
    });

    await wrapper.setData({
      name: {
        translation: {
          en: 'Name EN',
          fr: '',
        },
      },
      description: {
        translation: {
          en: 'Desc EN',
          fr: '',
        },
      },
    });

    await wrapper.setProps({
      languageMode: 'fr',
    });

    expect(wrapper.vm.name.translation.fr).toBe('Name EN');
    expect(wrapper.vm.description.translation.fr).toBe('Desc EN');
  });
});
