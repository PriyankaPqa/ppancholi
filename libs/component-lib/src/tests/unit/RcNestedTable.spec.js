import { createLocalVue, mount } from '@libs/component-lib/tests/testSetup';
import Component from '../../components/organism/RcNestedTable/RcNestedTable.vue';

const headers = [{
  text: 'Section',
  value: 'section',
  cols: 2,
}, {
  text: 'Product',
  value: 'name',
  cols: 2,
}, {
  text: 'Stock',
  value: 'stock',
  cols: 3,
  align: 'center',
}, {
  text: 'On sale',
  value: 'onSale',
  cols: 3,
  align: 'center',
}, {
  text: '',
  value: 'buttons',
  cols: 2,
  align: 'right',
}];

const items = [{
  section: 'Dairy',
  products: [{
    name: '2% Milk',
    stock: 315,
    onSale: true,
  }, {
    name: 'Yogurt',
    stock: 145,
    onSale: false,
  }],
}, {
  section: 'Produce',
  products: [{
    name: 'Apples',
    stock: 1564,
    onSale: false,
  }, {
    name: 'Carrots',
    stock: 238,
    onSale: false,
  }],
}];

describe('RcNestedTable.vue', () => {
  let localVue;

  beforeEach(() => {
    localVue = createLocalVue();
  });

  test('The headers render properly', () => {
    const wrapper = mount(Component, {
      localVue,
      propsData: {
        headers,
        items,
        itemSubItem: 'products',
      },
    });

    const sectionHeader = wrapper.find('[data-test="rcNestedTable__header--section"]');
    const nameHeader = wrapper.find('[data-test="rcNestedTable__header--name"]');
    const stockHeader = wrapper.find('[data-test="rcNestedTable__header--stock"]');
    const onSaleHeader = wrapper.find('[data-test="rcNestedTable__header--onSale"]');
    const buttonsHeader = wrapper.find('[data-test="rcNestedTable__header--buttons"]');

    expect(sectionHeader.exists()).toBe(true);
    expect(sectionHeader.text()).toBe('Section');

    expect(nameHeader.exists()).toBe(true);
    expect(nameHeader.text()).toBe('Product');

    expect(stockHeader.exists()).toBe(true);
    expect(stockHeader.text()).toBe('Stock');
    expect(stockHeader.element.parentElement.classList.contains('center')).toBe(true);

    expect(onSaleHeader.exists()).toBe(true);
    expect(onSaleHeader.text()).toBe('On sale');
    expect(onSaleHeader.element.parentElement.classList.contains('center')).toBe(true);

    expect(buttonsHeader.exists()).toBe(true);
    expect(buttonsHeader.text()).toBe('');
    expect(buttonsHeader.element.parentElement.classList.contains('right')).toBe(true);
  });

  test('the itemSubItem property gets the correct child array when it is a string', async () => {
    const wrapper = mount(Component, {
      localVue,
      propsData: {
        headers,
        items,
        itemSubItem: 'INVALID',
      },
    });

    expect(wrapper.vm.getSubItems(items[0])).toBeUndefined();

    await wrapper.setProps({
      itemSubItem: 'products',
    });

    expect(wrapper.vm.getSubItems(items[0])).toEqual(items[0].products);
  });

  test('the itemSubItem property gets the correct child array when it is a function', async () => {
    const wrapper = mount(Component, {
      localVue,
      propsData: {
        headers,
        items,
        itemSubItem: (item) => item.invalid,
      },
    });

    expect(wrapper.vm.getSubItems(items[0])).toBeUndefined();

    await wrapper.setProps({
      itemSubItem: (item) => item.products,
    });

    expect(wrapper.vm.getSubItems(items[0])).toEqual(items[0].products);
  });

  test('the showAddItem prop shows or hides the add item button', async () => {
    const wrapper = mount(Component, {
      localVue,
      propsData: {
        headers,
        items,
        itemSubItem: 'products',
      },
    });

    expect(wrapper.find('[data-test="rcNestedTable__addItem"]').exists()).toBeFalsy();

    await wrapper.setProps({
      showAddItem: true,
    });

    expect(wrapper.find('[data-test="rcNestedTable__addItem"]').exists()).toBe(true);
  });

  test('the disableAddItem prop disables the add item button', async () => {
    const wrapper = mount(Component, {
      localVue,
      propsData: {
        headers,
        items,
        itemSubItem: 'products',
        showAddItem: true,
      },
    });

    const addItem = wrapper.find('[data-test="rcNestedTable__addItem"]');

    expect(addItem.attributes('disabled')).toBeFalsy();

    await wrapper.setProps({
      disableAddItem: true,
    });

    expect(addItem.attributes('disabled')).toBe('disabled');
  });

  test('the showAddSubItem prop shows the add sub item buttons', async () => {
    const wrapper = mount(Component, {
      localVue,
      propsData: {
        headers,
        items,
        itemSubItem: 'products',
      },
    });

    expect(wrapper.find('[data-test="rcNestedTable__addSubItem--0"]').exists()).toBeFalsy();
    expect(wrapper.find('[data-test="rcNestedTable__addSubItem--1"]').exists()).toBeFalsy();

    await wrapper.setProps({
      showAddSubItem: true,
    });

    expect(wrapper.find('[data-test="rcNestedTable__addSubItem--0"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="rcNestedTable__addSubItem--1"]').exists()).toBe(true);
  });

  test('the disableAddSubItem prop disables all the add sub item buttons if it is true', async () => {
    const wrapper = mount(Component, {
      localVue,
      propsData: {
        headers,
        items,
        itemSubItem: 'products',
        showAddSubItem: true,
      },
    });

    const addSubItem0 = wrapper.find('[data-test="rcNestedTable__addSubItem--0"]');
    const addSubItem1 = wrapper.find('[data-test="rcNestedTable__addSubItem--1"]');

    expect(addSubItem0.attributes('disabled')).toBeFalsy();
    expect(addSubItem1.attributes('disabled')).toBeFalsy();

    await wrapper.setProps({
      disableAddSubItem: true,
    });

    expect(addSubItem0.attributes('disabled')).toBe('disabled');
    expect(addSubItem1.attributes('disabled')).toBe('disabled');
  });

  test('the disableAddSubItem prop disables the specified add sub item buttons if it is an array', async () => {
    const wrapper = mount(Component, {
      localVue,
      propsData: {
        headers,
        items,
        itemSubItem: 'products',
        showAddSubItem: true,
      },
    });

    const addSubItem0 = wrapper.find('[data-test="rcNestedTable__addSubItem--0"]');
    const addSubItem1 = wrapper.find('[data-test="rcNestedTable__addSubItem--1"]');

    expect(addSubItem0.attributes('disabled')).toBeFalsy();
    expect(addSubItem1.attributes('disabled')).toBeFalsy();

    await wrapper.setProps({
      disableAddSubItem: [true, false],
    });

    expect(addSubItem0.attributes('disabled')).toBe('disabled');
    expect(addSubItem1.attributes('disabled')).toBeFalsy();
  });

  test('clicking the add item button emits the update:add-item event', async () => {
    const wrapper = mount(Component, {
      localVue,
      propsData: {
        headers,
        items,
        itemSubItem: 'products',
        showAddItem: true,
        showAddSubItem: true,
      },
    });

    await wrapper.find('[data-test="rcNestedTable__addItem"]').trigger('click');

    expect(wrapper.emitted('update:add-item')[0][0]).toBe(true);
  });

  test('clicking the add sub item button emits the update:add-item event with the array index of the parent item', async () => {
    const wrapper = mount(Component, {
      localVue,
      propsData: {
        headers,
        items,
        itemSubItem: 'products',
        showAddItem: true,
        showAddSubItem: true,
      },
    });

    await wrapper.find('[data-test="rcNestedTable__addSubItem--1"]').trigger('click');

    expect(wrapper.emitted('update:add-item')[0][0]).toBe(1);
  });

  test('the collapsible prop shows the collapse buttons', async () => {
    const wrapper = mount(Component, {
      localVue,
      propsData: {
        headers,
        items,
        itemSubItem: 'products',
      },
    });

    expect(wrapper.find('[data-test="rcNestedTable__collapseButton--0"]').exists()).toBeFalsy();
    expect(wrapper.find('[data-test="rcNestedTable__collapseButton--1"]').exists()).toBeFalsy();

    await wrapper.setProps({
      collapsible: true,
    });

    expect(wrapper.find('[data-test="rcNestedTable__collapseButton--0"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="rcNestedTable__collapseButton--1"]').exists()).toBe(true);
  });

  test('clicking the collapse button shows/hides the sub items', async () => {
    const wrapper = mount(Component, {
      localVue,
      propsData: {
        headers,
        items,
        itemSubItem: 'products',
        collapsible: true,
      },
    });

    const collapse0 = wrapper.find('[data-test="rcNestedTable__collapseButton--0"]');
    const collapse1 = wrapper.find('[data-test="rcNestedTable__collapseButton--1"]');

    expect(wrapper.findAll('.rcnestedtable__row')).toHaveLength(6);

    await collapse0.trigger('click');

    expect(wrapper.findAll('.rcnestedtable__row')).toHaveLength(4);

    await collapse1.trigger('click');

    expect(wrapper.findAll('.rcnestedtable__row')).toHaveLength(2);

    await collapse0.trigger('click');
    await collapse1.trigger('click');

    expect(wrapper.findAll('.rcnestedtable__row')).toHaveLength(6);
  });

  test('the sortable prop shows the drag handles', async () => {
    const wrapper = mount(Component, {
      localVue,
      propsData: {
        headers,
        items,
        itemSubItem: 'products',
      },
    });

    expect(wrapper.find('[data-test="rcNestedTable__dragHandle--0"]').exists()).toBeFalsy();
    expect(wrapper.find('[data-test="rcNestedTable__dragHandle--1"]').exists()).toBeFalsy();

    expect(wrapper.find('[data-test="rcNestedTable__dragHandleSub--0--0"]').exists()).toBeFalsy();
    expect(wrapper.find('[data-test="rcNestedTable__dragHandleSub--0--1"]').exists()).toBeFalsy();

    expect(wrapper.find('[data-test="rcNestedTable__dragHandleSub--1--0"]').exists()).toBeFalsy();
    expect(wrapper.find('[data-test="rcNestedTable__dragHandleSub--1--1"]').exists()).toBeFalsy();

    await wrapper.setProps({
      sortable: true,
    });

    expect(wrapper.find('[data-test="rcNestedTable__dragHandle--0"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="rcNestedTable__dragHandle--1"]').exists()).toBe(true);

    expect(wrapper.find('[data-test="rcNestedTable__dragHandleSub--0--0"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="rcNestedTable__dragHandleSub--0--1"]').exists()).toBe(true);

    expect(wrapper.find('[data-test="rcNestedTable__dragHandleSub--1--0"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="rcNestedTable__dragHandleSub--1--1"]').exists()).toBe(true);
  });

  test('the labels prop sets the text value of the add item and add sub item buttons', async () => {
    const wrapper = mount(Component, {
      localVue,
      propsData: {
        headers,
        items,
        showAddItem: true,
        showAddSubItem: true,
        itemSubItem: 'products',
      },
    });

    const addItem = wrapper.find('[data-test="rcNestedTable__addItem"]');
    const addSubItem0 = wrapper.find('[data-test="rcNestedTable__addSubItem--0"]');
    const addSubItem1 = wrapper.find('[data-test="rcNestedTable__addSubItem--1"]');

    expect(addItem.text()).toBe('Add item');
    expect(addSubItem0.text()).toBe('Add sub-item');
    expect(addSubItem1.text()).toBe('Add sub-item');

    await wrapper.setProps({
      labels: {
        addItem: 'ADD ITEM TEST',
        addSubItem: 'ADD SUB ITEM TEST',
      },
    });

    expect(addItem.text()).toBe('ADD ITEM TEST');
    expect(addSubItem0.text()).toBe('ADD SUB ITEM TEST');
    expect(addSubItem1.text()).toBe('ADD SUB ITEM TEST');
  });

  test('the onSortSubItems function properly sorts the correct list of sub-items', async () => {
    const wrapper = mount(Component, {
      localVue,
      propsData: {
        headers,
        items,
        itemSubItem: 'products',
        sortable: true,
      },
      data() {
        return {
          sortingParentItem: items[1],
        };
      },
    });

    wrapper.vm.onSortSubItems({
      oldIndex: 0,
      newIndex: 1,
    });

    expect(wrapper.emitted('sort-sub-items')[0]).toEqual([
      1,
      [
        items[1].products[1],
        items[1].products[0],
      ],
    ]);
  });
});
