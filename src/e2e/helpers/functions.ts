import { ClientFunction } from 'testcafe';

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

/**
 * Set a local storage value
 */
export const setLocalStorageItem = ClientFunction((prop, value) => {
  localStorage.setItem(prop, value);
});

/**
 * Get local storage value
 */
export const getLocalStorageItem = ClientFunction((key) => localStorage.getItem(key));

/**
 * Get the current URL
 */
export const getURL = ClientFunction(() => window.location.href);

/**
 * Used to wait some time
 * @param ms
 */
export const timeout = (ms: number) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});
