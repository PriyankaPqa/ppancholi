import { defineStore } from 'pinia';
import { Ref, ref } from 'vue';
import { ItemState, IUIStateState } from '@/pinia/ui-state/uiState.type';

export const useUiStateStore = defineStore('uiState', () => {
  const searchStates = ref([]) as Ref<IUIStateState[]>;

  function getSearchTableState(key: string) {
    return searchStates.value.filter((s) => s.key === key)[0]?.state;
  }

  function getAllSearchIds() {
    return searchStates.value
      .filter((item) => item.state.searchResultIds !== undefined)
      .map((item) => item.state.searchResultIds)
      .reduce((acc, ids) => acc.concat(ids), []);
  }

  function setSearchTableState(key: string, state: ItemState) {
    searchStates.value = searchStates.value.filter((s) => s.key !== key);
    searchStates.value.push({ key, state });
  }
  return {
    searchStates,
    getSearchTableState,
    getAllSearchIds,
    setSearchTableState,
  };
});
