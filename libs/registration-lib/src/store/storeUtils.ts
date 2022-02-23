export const resetVuexModuleState = (state: Record<string, unknown>, getDefaultState: Record<string, unknown>) => {
  const defaultState = getDefaultState;
  Object.keys(state).forEach((key) => {
    if (!Object.prototype.hasOwnProperty.call(defaultState, key)) {
      delete state[key as keyof typeof state];
    }
  });
  Object.assign(state, defaultState);
};
