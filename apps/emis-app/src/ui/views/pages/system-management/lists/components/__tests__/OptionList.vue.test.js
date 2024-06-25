import {
  createLocalVue,
  mount,
} from '@/test/testSetup';
import { mockOptionItem, mockOptionItemData } from '@libs/entities-lib/optionItem';
import { Status } from '@libs/shared-lib/types';
import { useMockOptionListStore } from '@/pinia/option-list/optionList.mock';
import OptionListItem from '@/ui/views/pages/system-management/lists/components/OptionListItem.vue';
import Component from '../OptionList.vue';

const localVue = createLocalVue();
const { pinia, optionListStore } = useMockOptionListStore();

describe('OptionList.vue', () => {
  let wrapper;
  const doMount = () => {
    wrapper = mount(Component, {
      localVue,
      pinia,
      propsData: {
        title: 'TITLE',
      },
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    doMount();

    jest.spyOn(wrapper.vm, 'scrollToInput').mockImplementation(() => {});
  });

  describe('> Props', () => {
    test('the title prop is displayed in the page title', () => {
      doMount();
      const title = wrapper.findDataTest('page-title');

      expect(title.text()).toBe('TITLE (4)');
    });

    test('the add button is hidden if the showAddButton prop is false', async () => {
      expect(wrapper.findDataTest('pageContent__addBtn').exists()).toBe(true);

      await wrapper.setProps({
        showAddButton: false,
      });

      expect(wrapper.findDataTest('pageContent__addBtn').exists()).toBe(false);
    });

    test('the status select is hidden if the hideItemStatus prop is true', async () => {
      await wrapper.setProps({
        hideItemStatus: false,
      });

      const component = wrapper.findComponent(OptionListItem);
      const props = 'hideItemStatus';

      expect(component.props(props)).toEqual(false);

      await wrapper.setProps({
        hideItemStatus: true,
      });
      expect(component.props(props)).toBe(true);
    });
  });

  describe('> Computed', () => {
    describe('formattedTitle', () => {
      it('returns correct value', async () => {
        optionListStore.getItems = jest.fn(() => mockOptionItemData());

        expect(wrapper.vm.formattedTitle).toBe('TITLE (4)');

        await wrapper.setProps({
          embedded: true,
        });

        expect(wrapper.vm.formattedTitle).toBe('TITLE');
      });
    });

    describe('>> items', () => {
      it('returns the items from the store', () => {
        optionListStore.getItems = jest.fn(() => mockOptionItemData());
        expect(wrapper.vm.items).toEqual(mockOptionItemData());
      });
      it('fires the sortItems action when assigned', () => {
        const spy = jest.spyOn(wrapper.vm, 'sortItems').mockImplementation(() => {});

        const items = mockOptionItemData();

        wrapper.vm.items = [
          items[2],
          items[1],
          items[0],
        ];

        expect(wrapper.vm.sortItems).toHaveBeenCalledWith([
          items[2],
          items[1],
          items[0],
        ]);

        spy.mockRestore();
      });

      it('should filter out hidden item', () => {
        optionListStore.getItems = jest.fn(() => [mockOptionItem({ id: '1', isHidden: true }), mockOptionItem({ id: '2', isHidden: false })]);
        expect(wrapper.vm.items).toEqual([mockOptionItem({ id: '2', isHidden: false })]);
      });
    });

    describe('>> highestRank', () => {
      it('returns the highestRank among the list', () => {
        optionListStore.getItems = jest.fn(() => mockOptionItemData());
        expect(wrapper.vm.highestRank).toEqual(5);
      });
      it('returns 0 when list is empty', () => {
        optionListStore.getItems = jest.fn(() => []);
        expect(wrapper.vm.highestRank).toEqual(0);
      });
    });
  });

  describe('> Methods', () => {
    describe('>> fetchItems', () => {
      it('dispatches the fetchItems action', async () => {
        optionListStore.fetchItems = jest.fn();
        jest.clearAllMocks();

        await wrapper.vm.fetchItems();

        expect(optionListStore.fetchItems).toHaveBeenCalledTimes(1);
      });
    });

    describe('>> isSearchResult', () => {
      it('returns true if the name in the current language mode matches the search string', async () => {
        const item = mockOptionItemData()[0];

        await wrapper.setData({
          search: 'flood',
        });

        expect(wrapper.vm.isSearchResult(item)).toBe(true);

        await wrapper.setData({
          search: 'NO MATCH',
        });

        expect(wrapper.vm.isSearchResult(item)).toBe(false);

        await wrapper.setData({
          languageMode: 'fr',
          search: 'inundation',
        });

        expect(wrapper.vm.isSearchResult(item)).toBe(true);
      });
    });

    describe('>> saveNewItem', () => {
      it('dispatches the createOption action', async () => {
        const name = { translation: { en: 'English Test', fr: 'French Test' } };
        const description = null;
        const status = Status.Active;

        await wrapper.vm.saveNewItem(
          name,
          description,
          status,
        );

        expect(optionListStore.createOption).toHaveBeenCalledTimes(1);
      });
      it('dispatches the createOption action with correct parameters', async () => {
        const name = { translation: { en: 'English Test', fr: 'French Test' } };
        const description = null;
        const status = Status.Active;
        optionListStore.createOption = jest.fn();

        await wrapper.vm.saveNewItem(
          name,
          description,
          status,
        );

        expect(optionListStore.createOption).toHaveBeenCalledWith(
          {
            name,
            status,
            orderRank: wrapper.vm.highestRank + 1,
          },
        );
      });

      it('does not dispatch the action if name or status are not provided', async () => {
        await wrapper.vm.saveNewItem(
          null,
          null,
          null,
        );

        expect(optionListStore.createOption).not.toHaveBeenCalled();
      });

      it('copies the translation values over to empty languages', async () => {
        const name = { translation: { en: 'English Test', fr: '' } };
        const description = null;
        const status = Status.Active;
        optionListStore.createOption = jest.fn();

        await wrapper.vm.saveNewItem(
          name,
          description,
          status,
        );

        expect(optionListStore.createOption).toHaveBeenCalledWith(
          {
            name: { translation: { en: 'English Test', fr: 'English Test' } },
            status,
            orderRank: wrapper.vm.highestRank + 1,
          },
        );
      });
    });

    describe('>> addSubItem', () => {
      it('sets addingItemId', async () => {
        const itemId = 'test id';

        expect(wrapper.vm.addingItemId).not.toBe(itemId);

        wrapper.vm.addSubItem(itemId);

        expect(wrapper.vm.addingItemId).toBe(itemId);
      });
    });

    describe('>> saveNewSubItem', () => {
      it('dispatches the addSubItem action', async () => {
        optionListStore.addSubItem = jest.fn();
        optionListStore.getItems = jest.fn(() => mockOptionItemData());
        const name = { translation: { en: 'English Test', fr: 'French Test' } };
        const description = { translation: { en: 'English description', fr: 'French description' } };
        const status = Status.Active;
        const itemId = mockOptionItemData()[0].id;

        await wrapper.vm.saveNewSubItem(
          name,
          description,
          status,
          itemId,
        );

        expect(optionListStore.addSubItem).toHaveBeenCalledTimes(1);
      });

      it('dispatches the addSubItem action with correct parameters', async () => {
        optionListStore.addSubItem = jest.fn();

        const name = { translation: { en: 'English Test', fr: 'French Test' } };
        const description = { translation: { en: 'English description', fr: 'French description' } };
        const status = Status.Active;

        const item = mockOptionItemData()[0];
        const itemId = item.id;
        optionListStore.addSubItem = jest.fn();

        let highestRank = 0;

        if (item.subitems.length > 0) {
          highestRank = item.subitems
            .reduce((prev, current) => ((prev.orderRank > current.orderRank) ? prev : current)).orderRank;
        }

        await wrapper.vm.saveNewSubItem(
          name,
          description,
          status,
          itemId,
        );

        expect(optionListStore.addSubItem).toHaveBeenCalledWith(
          itemId,
          {
            name,
            status,
            orderRank: highestRank + 1,
            description,
          },
        );
      });

      it('copies the translation values over to empty languages', async () => {
        optionListStore.addSubItem = jest.fn();

        const name = { translation: { en: 'English Test', fr: '' } };
        const description = { translation: { en: 'English description', fr: '' } };
        const status = Status.Active;
        optionListStore.addSubItem = jest.fn();

        const item = mockOptionItemData()[0];
        const itemId = item.id;

        let highestRank = 0;

        if (item.subitems.length > 0) {
          highestRank = item.subitems
            .reduce((prev, current) => ((prev.orderRank > current.orderRank) ? prev : current)).orderRank;
        }

        await wrapper.vm.saveNewSubItem(
          name,
          description,
          status,
          itemId,
        );

        expect(optionListStore.addSubItem).toHaveBeenCalledWith(
          itemId,
          {
            name: { translation: { en: 'English Test', fr: 'English Test' } },
            status,
            orderRank: highestRank + 1,
            description: { translation: { en: 'English description', fr: 'English description' } },
          },
        );
      });
    });

    describe('>> saveItem', () => {
      it('dispatches the updateItem action', async () => {
        doMount();
        await wrapper.setProps({ hasDescription: true });
        const item = mockOptionItemData()[0];
        const name = { translation: { en: 'English Test', fr: 'French Test' } };
        const description = { translation: { en: 'Desc English Test', fr: 'Desc French Test' } };
        optionListStore.updateItem = jest.fn();

        await wrapper.vm.saveItem(
          item,
          name,
          description,
        );

        expect(optionListStore.updateItem).toHaveBeenCalledWith({
          id: item.id,
          name,
          description,
        });
      });

      it('does not dispatch the action if item or name are not provided', async () => {
        await wrapper.vm.saveItem(
          null,
          null,
          { translation: { en: 'English Desc', fr: '' } },
        );

        expect(optionListStore.updateItem).not.toHaveBeenCalled();
      });

      it('sends description as null if hasDescription is false', async () => {
        await wrapper.setProps({ hasDescription: false });
        const item = mockOptionItemData()[0];
        const name = { translation: { en: 'English Test', fr: '' } };
        const description = { translation: { en: '', fr: '' } };
        optionListStore.updateItem = jest.fn();

        await wrapper.vm.saveItem(
          item,
          name,
          description,
        );

        expect(optionListStore.updateItem).toHaveBeenCalledWith({
          id: item.id,
          name: {
            translation: {
              en: 'English Test',
              fr:
            'English Test',
            },
          },
          description: null,
        });
      });

      it('copies the translation values over to empty languages', async () => {
        await wrapper.setProps({ hasDescription: true });
        const item = mockOptionItemData()[0];
        const name = { translation: { en: 'English Test', fr: '' } };
        const description = { translation: { en: 'English Desc Test', fr: '' } };
        optionListStore.updateItem = jest.fn();

        await wrapper.vm.saveItem(
          item,
          name,
          description,
        );

        expect(optionListStore.updateItem).toHaveBeenCalledWith({
          id: item.id,
          name: {
            translation: {
              en: 'English Test',
              fr:
            'English Test',
            },
          },
          description: {
            translation: {
              en: 'English Desc Test',
              fr:
            'English Desc Test',
            },
          }
          ,
        });
      });
    });

    describe('>> saveSubItem', () => {
      it('dispatches the updateSubItem action', async () => {
        const item = mockOptionItemData()[0];
        const subItem = item.subitems[0];
        const name = { translation: { en: 'name en', fr: 'name fr' } };
        const description = { translation: { en: 'description en', fr: 'description fr' } };
        optionListStore.updateSubItem = jest.fn();

        await wrapper.vm.saveSubItem(
          item,
          subItem,
          name,
          description,
        );

        expect(optionListStore.updateSubItem).toHaveBeenCalledWith({
          itemId: item.id,
          subItemId: subItem.id,
          name,
          description,
        });
      });

      it('does not dispatch the action if item or name are not provided', async () => {
        await wrapper.vm.saveSubItem(
          null,
          null,
        );

        expect(optionListStore.updateSubItem).not.toHaveBeenCalled();
      });

      it('copies the translation values over to empty languages', async () => {
        const item = mockOptionItemData()[0];
        const subItem = item.subitems[0];
        const name = { translation: { en: 'name en', fr: '' } };
        const description = { translation: { en: '', fr: 'description fr' } };
        optionListStore.updateSubItem = jest.fn();

        await wrapper.vm.saveSubItem(
          item,
          subItem,
          name,
          description,
        );

        expect(optionListStore.updateSubItem).toHaveBeenCalledWith({
          itemId: item.id,
          subItemId: subItem.id,
          name: {
            translation: {
              en: 'name en',
              fr:
            'name en',
            },
          },
          description: {
            translation: {
              en: 'description fr',
              fr:
            'description fr',
            },
          }
          ,
        });
      });
    });

    describe('>> sortItems', () => {
      it('dispatches the updateOrderRanks action', async () => {
        const items = mockOptionItemData();
        optionListStore.updateOrderRanks = jest.fn();

        await wrapper.vm.sortItems([
          items[2],
          items[1],
          items[0],
        ]);

        expect(optionListStore.updateOrderRanks).toHaveBeenCalledWith(
          [
            items[2],
            items[1],
            items[0],
          ],
        );
      });
    });

    describe('>> sortSubItems', () => {
      it('dispatches the updateSubItemOrderRanks action', async () => {
        optionListStore.updateSubItemOrderRanks = jest.fn();

        const item = mockOptionItemData()[0];

        await wrapper.vm.sortSubItems(item);

        expect(optionListStore.updateSubItemOrderRanks).toHaveBeenCalledWith(item);
      });
    });
  });

  describe('> Template', () => {
    test('typing in the search input sets the value of search', async () => {
      const input = wrapper.findDataTest('pageContent__search');

      await input.setValue('search test');

      expect(wrapper.vm.search).toBe('search test');
    });

    test('if the embedded prop is true, the close button is visible', async () => {
      expect(wrapper.findDataTest('optionsList__closeDialog').exists()).toBe(false);

      await wrapper.setProps({
        embedded: true,
      });

      expect(wrapper.findDataTest('optionsList__closeDialog').exists()).toBe(true);
    });

    test('clicking on the language tab sets the current language', async () => {
      expect(wrapper.vm.languageMode).toBe('en');

      await wrapper.findDataTest('optionsList__lang-fr').trigger('click');

      expect(wrapper.vm.languageMode).toBe('fr');
    });

    test('the sub items are displayed if sub-items exist and isCascading is true', async () => {
      await wrapper.setProps({
        isCascading: true,
      });

      const parent = wrapper.find('.optionsList__subItemsDraggable');

      expect(parent.exists()).toBe(true);

      expect(parent.findAll('.optionsList__item').length).toBe(mockOptionItemData()[0].subitems.length);
    });
  });
});
