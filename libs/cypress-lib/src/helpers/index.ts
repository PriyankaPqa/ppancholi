export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.substring(1);
}

export * from './generator';
export * from './optionLists';
export * from './date';
