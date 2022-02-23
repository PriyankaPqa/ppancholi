import { Selector, t } from 'testcafe';
import { timeout } from './functions';

/**
 * Used to select an element on a list based on its index
 * @param dataTest
 * @param index
 */
export async function selectListElementByIndex(dataTest: string, index: number) {
  const parentDiv = Selector('div')
    .withAttribute('data-test', dataTest);
  await t.click(parentDiv);

  const listOption = Selector('div')
    .withAttribute('data-test-index', `${dataTest}__itemIndex--${index}`);

  await t.click(listOption);
}

/**
 * Used to select an element on a list based on its value (might be different to what's on screen)
 * {dataTest}__item--{value}
 * @param dataTest
 * @param value
 */
export async function selectListElementByValue(dataTest: string, value: string) {
  const parentDiv = Selector('div')
    .withAttribute('data-test', dataTest);
  await t.click(parentDiv);

  const valueWithoutSpace = value.replace(/\s/g, '');

  const listOption = Selector('div')
    .withAttribute('data-test', `${dataTest}__item--${valueWithoutSpace}`);

  await t.click(listOption);
}

/**
 * Used to select multiple items in a dropdown with their value
 * @param dataTest
 * @param values
 */
export async function selectMultipleElementByValues(dataTest: string, values: string[]) {
  // eslint-disable-next-line no-restricted-syntax
  for (const value of values) {
    // eslint-disable-next-line
    await selectListElementByValue(dataTest, value);
  }
  await t.pressKey('tab'); // Exit the field
}

/**
 * Used to select multiple items in a dropdown by their index
 * @param dataTest
 * @param indexes
 */
export async function selectMultipleElementByIndex(dataTest: string, indexes: number[]) {
  // eslint-disable-next-line no-restricted-syntax
  for (const index of indexes) {
    // eslint-disable-next-line
    await selectListElementByIndex(dataTest, index);
  }
  await t.pressKey('tab'); // Exit the field
}

/**
 * Used to write a value within a vuetify autocomplete or rc-autosuggest
 * @param dataTest
 * @param value
 */
export async function writeInputSelect(dataTest: string, value: string) {
  const parentDiv = Selector('input').withAttribute('data-test', dataTest);

  await t.click(parentDiv);

  await t.typeText(Selector('input').withAttribute('data-test', dataTest), value);
}

/**
 * Get the current value of a input text
 * @param selector
 */
export async function getInputTextValue(selector: Selector) {
  return selector.value;
}

/**
 * Get the current selection of a select
 * @param selector
 */
export async function getSelectedListItem(selector : Selector) {
  return selector.find('.v-select__selection').value;
}

/**
 * Select date on a date picker
 * @param selector
 * @param year
 * @param month
 * @param day
 */
export async function setDatePicker(selector : Selector, { year, month, day }: {year: number; month: number; day: number}) {
  await t.click(selector);
  const middleHeaderButton = Selector('.v-date-picker-header__value button');
  await t.click(middleHeaderButton);

  await timeout(500);
  const yearHeader = Selector('.v-date-picker-header__value button');
  await t.click(yearHeader);

  const yearSelector = Selector('.v-date-picker-years li').withText(year.toString());
  await t.click(yearSelector);

  const monthSelector = Selector('.v-date-picker-table--month td').nth(month - 1);
  await t.click(monthSelector);

  const daySelector = Selector('div.v-btn__content').nth(day - 1);
  await t.click(daySelector);
}
