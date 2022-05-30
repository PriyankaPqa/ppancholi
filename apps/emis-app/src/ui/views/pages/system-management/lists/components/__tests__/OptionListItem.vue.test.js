import flushPromises from 'flush-promises';
import {
  createLocalVue,
  mount,
  shallowMount,
} from '@/test/testSetup';

import { mockOptionItemData, EOptionLists } from '@/entities/optionItem';
import entityUtils from '@libs/core-lib/entities/utils';
import { Status } from '@libs/core-lib/entities/base';
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

  describe('Computed', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
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

    describe('allNames', () => {
      it('returns the correct value', async () => {
        await wrapper.setProps({
          items: [{
            name: {
              translation: {
                en: 'name 1 en',
                fr: 'name 1 fr',
              },
            },
            subitems: [{
              name: {
                translation: {
                  en: 'sub name en',
                  fr: 'sub name fr',
                },
              },
            }],
          }, {
            name: {
              translation: {
                en: 'name 2 en',
                fr: 'name 2 fr',
              },
            },
            subitems: [],
          }],
        });

        expect(wrapper.vm.allNames).toEqual([{
          translation: {
            en: 'name 1 en',
            fr: 'name 1 fr',
          },
        }, {
          translation: {
            en: 'sub name en',
            fr: 'sub name fr',
          },
        }, {
          translation: {
            en: 'name 2 en',
            fr: 'name 2 fr',
          },
        }]);
      });
    });

    describe('renameNotAllowed', () => {
      it('returns true if is Role name', async () => {
        wrapper.vm.$storage.optionList.mutations.setList(EOptionLists.Roles);

        await wrapper.setProps({
          isSubItem: false,
        });

        expect(wrapper.vm.renameNotAllowed).toBeTruthy();
      });

      it('returns false if is not Role', async () => {
        wrapper.vm.$storage.optionList.mutations.setList(EOptionLists.FinancialAssistance);

        await wrapper.setProps({
          isSubItem: false,
        });

        expect(wrapper.vm.renameNotAllowed).toBeFalsy();
      });

      it('returns false if is subItem', async () => {
        wrapper.vm.$storage.optionList.mutations.setList(EOptionLists.Roles);

        await wrapper.setProps({
          isSubItem: true,
        });

        expect(wrapper.vm.renameNotAllowed).toBeFalsy();
      });
    });
  });

  describe('Methods', () => {
    describe('checkNameUniqueness', () => {
      let wrapper;
      beforeEach(() => {
        wrapper = mount(Component, {
          localVue,
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
      });
      it('should set isNameUnique to true if the name is unique', () => {
        wrapper.vm.checkNameUniqueness('name 3 en');
        expect(wrapper.vm.isNameUnique).toBeTruthy();
      });
      it('should set isNameUnique to false if the name is not unique', () => {
        wrapper.vm.checkNameUniqueness('name 1 en');
        expect(wrapper.vm.isNameUnique).toBeFalsy();

        wrapper.vm.checkNameUniqueness('name 1 EN');
        expect(wrapper.vm.isNameUnique).toBeFalsy();

        wrapper.vm.checkNameUniqueness('name 2 fr');
        expect(wrapper.vm.isNameUnique).toBeFalsy();
      });
      it('is called when @input is emitted on sub item name', () => {
        wrapper.vm.checkNameUniqueness = jest.fn();

        const nameInput = wrapper.findDataTest('optionsListItem__nameInput');
        nameInput.trigger('input');

        expect(wrapper.vm.checkNameUniqueness).toHaveBeenCalledTimes(1);
      });
    });

    describe('>> confirmChangeStatus', () => {
      it('dispatches the updateSubItemStatus action if is subItem', async () => {
        const items = mockOptionItemData();
        const item = items[0];
        const subItem = item.subitems[0];

        await wrapper.setProps({
          isSubItem: true,
          items: mockOptionItemData(),
          item: mockOptionItemData()[0].subitems[0],
        });

        const status = Status.Inactive;
        wrapper.vm.changeToStatus = status;
        wrapper.vm.$storage.optionList.actions.updateSubItemStatus = jest.fn();

        await wrapper.vm.confirmChangeStatus();

        expect(wrapper.vm.$storage.optionList.actions.updateSubItemStatus).toHaveBeenCalledWith(item.id, subItem.id, status);
      });

      it('dispatches the updateStatus action if is not subItem', async () => {
        await wrapper.setProps({
          isSubItem: false,
        });

        const status = Status.Inactive;
        wrapper.vm.changeToStatus = status;
        wrapper.vm.$storage.optionList.actions.updateStatus = jest.fn();

        await wrapper.vm.confirmChangeStatus();

        expect(wrapper.vm.$storage.optionList.actions.updateStatus).toHaveBeenCalledWith(mockOptionItemData()[0].id, status);
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
