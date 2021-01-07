// eslint-disable-next-line @typescript-eslint/ban-types
export function resetVuexModuleState(state: object, getDefaultState: () => object) {
  const defaultState = getDefaultState();
  Object.keys(state).forEach((key) => {
    if (!Object.prototype.hasOwnProperty.call(defaultState, key)) {
      delete state[key as keyof typeof state];
    }
  });
  Object.assign(state, defaultState);
}
