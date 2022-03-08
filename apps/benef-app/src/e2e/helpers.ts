import { Selector, t } from 'testcafe';

/**
 * Used to select an element on a list based on its index
 * @param dataTest
 * @param index
 */
export async function selectListElement(dataTest: string, index: number) {
  const parentDiv = Selector('div')
    .withAttribute('data-test', dataTest);
  await t.click(parentDiv);

  const listOption = Selector('div')
    .withAttribute('data-test-index', `${dataTest}__itemIndex--${index}`);

  await t.click(listOption);
}

/**
 * Will translate Canada into C+a+n+a+d+a
 * @param string
 */
export function getPressKeySequence(string: string): string {
  let finalString = '';
  for (let i = 0; i < string.length; i += 1) {
    if (i !== string.length - 1) {
      finalString = finalString.concat(`${string[i]}+`);
    } else {
      finalString = finalString.concat(string[i]);
    }
  }
  return finalString;
}

export async function getInputTextValue(selector: Selector) {
  return selector.value;
}

export async function getSelectedListItem(selector : Selector) {
  return selector.find('.v-select__selection').value;
}
