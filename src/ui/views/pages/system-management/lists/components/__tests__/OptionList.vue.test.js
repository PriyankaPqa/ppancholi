import {
  createLocalVue,
  mount,
} from '@/test/testSetup';
import { EOptionLists, EOptionListItemStatus } from '@/types';
import { mockOptionItemData } from '@/entities/optionItem';
import Component from '../OptionList.vue';

const localVue = createLocalVue();

const actions = {
  fetchItems: jest.fn(),
  createOption: jest.fn(),
  updateName: jest.fn(),
  updateStatus: jest.fn(),
  updateOrderRanks: jest.fn(),
};

const store = {
  modules: {
    optionList: {
      state: {
        list: EOptionLists.EventTypes,
        items: mockOptionItemData(),
      },
      actions,
    },
  },
};

describe('OptionList.vue', () => {
  let wrapper;

  beforeEach(() => {
    jest.clearAllMocks();

    wrapper = mount(Component, {
      localVue,
      propsData: {
        title: 'TITLE',
      },
      store,
    });

    jest.spyOn(wrapper.vm, 'scrollToInput').mockImplementation(() => {});
  });

  describe('> Props', () => {
    test('the title prop is displayed in the page title', () => {
      const title = wrapper.findDataTest('page-title');

      expect(title.text()).toBe('TITLE');
    });
  });

  describe('> Computed', () => {
    describe('>> items', () => {
      it('returns the items from the store', () => {
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
    });
  });

  describe('> Methods', () => {
    describe('>> fetchItems', () => {
      it('dispatches the fetchItems action', async () => {
        jest.clearAllMocks();

        await wrapper.vm.fetchItems();

        expect(actions.fetchItems).toHaveBeenCalledTimes(1);
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
        const itemStatus = EOptionListItemStatus.Active;

        await wrapper.vm.saveNewItem(
          name,
          description,
          itemStatus,
        );

        expect(actions.createOption).toHaveBeenCalledWith(
          expect.anything(),
          {
            name,
            itemStatus,
            orderRank: 4,
          },
        );
      });

      it('does not dispatch the action if name or status are not provided', async () => {
        await wrapper.vm.saveNewItem(
          null,
          null,
          null,
        );

        expect(actions.createOption).not.toHaveBeenCalled();
      });

      it('copies the translation values over to empty languages', async () => {
        const name = { translation: { en: 'English Test', fr: '' } };
        const description = null;
        const itemStatus = EOptionListItemStatus.Active;

        await wrapper.vm.saveNewItem(
          name,
          description,
          itemStatus,
        );

        expect(actions.createOption).toHaveBeenCalledWith(
          expect.anything(),
          {
            name: { translation: { en: 'English Test', fr: 'English Test' } },
            itemStatus,
            orderRank: 4,
          },
        );
      });
    });

    describe('>> saveItem', () => {
      it('dispatches the updateName action', async () => {
        const item = mockOptionItemData()[0];
        const name = { translation: { en: 'English Test', fr: 'French Test' } };

        await wrapper.vm.saveItem(
          item,
          name,
        );

        expect(actions.updateName).toHaveBeenCalledWith(
          expect.anything(),
          {
            id: item.id,
            name,
          },
        );
      });

      it('does not dispatch the action if item or name are not provided', async () => {
        await wrapper.vm.saveItem(
          null,
          null,
        );

        expect(actions.createOption).not.toHaveBeenCalled();
      });

      it('copies the translation values over to empty languages', async () => {
        const item = mockOptionItemData()[0];
        const name = { translation: { en: 'English Test', fr: '' } };

        await wrapper.vm.saveItem(
          item,
          name,
        );

        expect(actions.updateName).toHaveBeenCalledWith(
          expect.anything(),
          {
            id: item.id,
            name: { translation: { en: 'English Test', fr: 'English Test' } },
          },
        );
      });
    });

    describe('>> changeItemStatus', () => {
      it('dispatches the updateStatus action', async () => {
        const item = mockOptionItemData()[0];
        const itemStatus = EOptionListItemStatus.Inactive;

        await wrapper.vm.changeItemStatus(
          item,
          itemStatus,
        );

        expect(actions.updateStatus).toHaveBeenCalledWith(
          expect.anything(),
          {
            id: item.id,
            itemStatus,
          },
        );
      });

      it('does not dispatch the action if item or status are not provided', async () => {
        await wrapper.vm.changeItemStatus(
          null,
          null,
        );

        expect(actions.updateStatus).not.toHaveBeenCalled();
      });
    });

    describe('>> sortItems', () => {
      it('dispatches the updateOrderRanks action', async () => {
        const items = mockOptionItemData();

        await wrapper.vm.sortItems([
          items[2],
          items[1],
          items[0],
        ]);

        expect(actions.updateOrderRanks).toHaveBeenCalledWith(
          expect.anything(),
          [
            items[2],
            items[1],
            items[0],
          ],
        );
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
  });
});
