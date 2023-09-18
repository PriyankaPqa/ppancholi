import { ref, watch, computed, Ref } from 'vue';
import { MAX_LENGTH_MD } from '@libs/shared-lib/constants/validations';
import { IMultilingual } from '@libs/shared-lib/types';
import { IOptionItem } from '@libs/entities-lib/optionItem';

// eslint-disable-next-line max-params
export function useOptionListItem(isSubItem: boolean, editMode: Ref<boolean>, items: Ref<IOptionItem[]>, item: IOptionItem = null, parentItemId: string = '') {
  const isNameUnique = ref(true);

  const rules = computed(() => ({
    name: {
      required: true,
      max: MAX_LENGTH_MD,
      customValidator: { isValid: isNameUnique.value, messageKey: 'validations.alreadyExists' },
    },
    description: {
      max: MAX_LENGTH_MD,
    },
  }));

  function getParentItem(): IOptionItem {
    return parentItemId ? items.value.find((i) => i.id === parentItemId) : null;
  }

  function getAllNames(): IMultilingual[] {
    let names: IMultilingual[] = [];
    if (!isSubItem) {
      names = items.value.map((i) => (item ? i.id !== item.id && i.name : i.name));
    } else {
      names = getParentItem() ? getParentItem().subitems.map((si) => (item ? si.id !== item.id && si.name : si.name)) : [];
    }

    return names.filter((n) => n);
  }

 function checkNameUniqueness(input: string) {
    const treat = ((str: string) => str.trim().toLowerCase());

    const treatedInput = treat(input);

    isNameUnique.value = !getAllNames().some((name) => {
      const langs = Object.keys(name.translation);
      return langs.some((lang) => treat(name.translation[lang]) === treatedInput);
    });
  }

  watch(editMode, () => {
    isNameUnique.value = true;
  });

  return {
    rules,
    isNameUnique,
    getParentItem,
    checkNameUniqueness,
    getAllNames,
  };
}
