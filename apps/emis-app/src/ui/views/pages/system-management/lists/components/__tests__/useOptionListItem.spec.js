import { ref } from 'vue';
import { MAX_LENGTH_MD } from '@libs/shared-lib/constants/validations';
import { mockOptionItems, mockOptionItem } from '@libs/entities-lib/optionItem';
import { useOptionListItem } from '../useOptionListItem';

describe('useOptionListItem', () => {
  describe('rules', () => {
    it('returns the right value', () => {
      expect(useOptionListItem(false, ref(false), ref(mockOptionItems())).rules.value).toEqual({
        name: {
          required: true,
          max: MAX_LENGTH_MD,
          customValidator: { isValid: true, messageKey: 'validations.alreadyExists' },
        },
        description: {
          max: MAX_LENGTH_MD,
        },
      });
    });
  });

  describe('getParentItem', () => {
    it('returns the right value', () => {
      const item = mockOptionItem({ id: 'p-1' });
      const result = useOptionListItem(false, ref(false), ref([item]), null, 'p-1').getParentItem();
      expect(result).toEqual(item);
    });
  });

  describe('getAllNames', () => {
    it('returns the right names if the item is not a subItem and an item is passed in the argument', () => {
      const name1 = { translation: { en: 'name-1-en', fr: 'name-1-fr' } };
      const name2 = { translation: { en: 'name-2-en', fr: 'name-2-fr' } };
      const item1 = mockOptionItem({ name: name1, id: 'i-1' });
      const items = [item1, mockOptionItem({ name: name2, id: 'i-2' })];

      const result = useOptionListItem(false, ref(false), ref(items), item1).getAllNames();
      expect(result).toEqual([name2]);
    });

    it('returns the right names if the item is not a subItem and an item is not passed in the argument', () => {
      const name1 = { translation: { en: 'name-1-en', fr: 'name-1-fr' } };
      const name2 = { translation: { en: 'name-2-en', fr: 'name-2-fr' } };
      const item1 = mockOptionItem({ name: name1, id: '1' });
      const items = [item1, mockOptionItem({ name: name2 })];

      const result = useOptionListItem(false, ref(false), ref(items), null).getAllNames();
      expect(result).toEqual([name1, name2]);
    });

    it('returns the right names if the item is a subItem and an item is passed in the argument', () => {
      const name1 = { translation: { en: 'name-1-en', fr: 'name-1-fr' } };
      const name2 = { translation: { en: 'name-2-en', fr: 'name-2-fr' } };
      const name3 = { translation: { en: 'foo', fr: 'bar' } };
      const item1 = mockOptionItem({ name: name1, id: 'id-1' });
      const item2 = mockOptionItem({ name: name2, id: 'id-2' });
      const items = [mockOptionItem({ id: 'parent', subitems: [item1, item2] }),
        mockOptionItem({ id: 'parent-2', subitems: [mockOptionItem({ name: name3, id: 'id-3' })] })];

      const result = useOptionListItem(true, ref(false), ref(items), item1, 'parent').getAllNames();
      expect(result).toEqual([name2]);
    });

    it('returns the right names if the item is a subItem and an item is passed in the argument', () => {
      const name1 = { translation: { en: 'name-1-en', fr: 'name-1-fr' } };
      const name2 = { translation: { en: 'name-2-en', fr: 'name-2-fr' } };
      const name3 = { translation: { en: 'foo', fr: 'bar' } };
      const item1 = mockOptionItem({ name: name1, id: 'id-1' });
      const item2 = mockOptionItem({ name: name2, id: 'id-2' });

      const items = [mockOptionItem({ id: 'parent', subitems: [item1, item2] }),
        mockOptionItem({ id: 'parent-2', subitems: [mockOptionItem({ name: name3, id: 'id-3' })] })];

      const result = useOptionListItem(true, ref(false), ref(items), item1, 'parent').getAllNames();
      expect(result).toEqual([name2]);
    });

    it('returns the right names if the item is a subItem and an item is not passed in the argument', () => {
      const name1 = { translation: { en: 'name-1-en', fr: 'name-1-fr' } };
      const name2 = { translation: { en: 'name-2-en', fr: 'name-2-fr' } };
      const name3 = { translation: { en: 'foo', fr: 'bar' } };
      const item1 = mockOptionItem({ name: name1, id: 'id-1' });
      const item2 = mockOptionItem({ name: name2, id: 'id-2' });

      const items = [mockOptionItem({ id: 'parent', subitems: [item1, item2] }),
        mockOptionItem({ id: 'parent-2', subitems: [mockOptionItem({ name: name3, id: 'id-3' })] })];

      const result = useOptionListItem(true, ref(false), ref(items), null, 'parent').getAllNames();
      expect(result).toEqual([name1, name2]);
    });
  });

  describe('checkNameUniqueness', () => {
    it('sets isNameUnique to true if the passed arg is not an existing name', async () => {
      const name1 = { translation: { en: 'name-1-en', fr: 'name-1-fr' } };
      const name2 = { translation: { en: 'name-2-en', fr: 'name-2-fr' } };
      const item1 = mockOptionItem({ name: name1, id: 'id-1' });
      const item2 = mockOptionItem({ name: name2, id: 'id-2' });
      const composable = useOptionListItem(false, ref(false), ref([item1, item2]));
      composable.isNameUnique.value = false;
      expect(composable.isNameUnique.value).toBeFalsy();
      composable.getAllNames = jest.fn(() => [name1, name2]);
      composable.checkNameUniqueness('foo');
      expect(composable.isNameUnique.value).toBeTruthy();
    });

    it('sets isNameUnique to false if the passed arg is an existing name', () => {
      const name1 = { translation: { en: 'name-1-en', fr: 'name-1-fr' } };
      const name2 = { translation: { en: 'name-2-en', fr: 'name-2-fr' } };
      const item1 = mockOptionItem({ name: name1, id: 'id-1' });
      const item2 = mockOptionItem({ name: name2, id: 'id-2' });
      const composable = useOptionListItem(false, ref(false), ref([item1, item2]));
      composable.isNameUnique.value = true;
      composable.getAllNames = jest.fn(() => [name1, name2]);
      composable.checkNameUniqueness('name-1-en ');
      expect(composable.isNameUnique.value).toBeFalsy();
    });
  });
});
