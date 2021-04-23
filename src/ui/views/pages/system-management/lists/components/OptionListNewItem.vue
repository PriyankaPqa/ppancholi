<template>
  <validation-observer ref="form" v-slot="{ invalid }" slim>
    <v-row
      data-test="optionListNewItem__row"
      :class="{
        'optionsList__itemAdd': true,
        'active': !isSubItem || addMode,
      }">
      <v-col v-if="isSubItem" cols="3" />

      <v-col v-if="!addMode && isSubItem" :cols="isSubItem ? '6' : '9'">
        <v-btn data-test="optionListNewItem__addBtn" height="32" color="primary" @click="enterAddMode">
          <v-icon left>
            mdi-plus
          </v-icon>

          {{ $t(addSubItemLabel) }}
        </v-btn>
      </v-col>

      <template v-else>
        <validation-provider v-slot="{ errors }" :rules="rules.name" slim>
          <v-col :class="{ 'pb-0': !!errors.length }" :cols="isSubItem ? '4' : '7'">
            <v-text-field
              ref="input"
              v-model="name.translation[languageMode]"
              data-test="optionListNewItem__nameInput"
              class="optionListItem__nameInput optionsList__addItem ml-4"
              :label="$t(itemNameLabel)"
              :disabled="loading"
              :error="!!errors.length"
              :hide-details="!errors.length"
              :error-messages="errors"
              outlined
              dense
              background-color="white"
              @input="checkNameUniqueness($event)"
              @keydown.enter.stop="save"
              @keydown.esc.stop="cancel" />
          </v-col>
        </validation-provider>

        <v-col cols="3">
          <status-select
            v-model="currentStatus"
            data-test="optionListNewItem__statusSelect"
            :statuses="itemStatuses"
            status-name="EOptionListItemStatus" />
        </v-col>

        <v-col class="alignRight" cols="2">
          <v-btn data-test="optionListNewItem__saveBtn" color="primary" :disabled="!name || invalid" :loading="loading" @click="save">
            {{ $t('common.buttons.save') }}
          </v-btn>

          <v-btn data-test="optionListNewItem__cancelBtn" icon class="ml-2" :disabled="loading">
            <v-icon @click="cancel">
              mdi-close
            </v-icon>
          </v-btn>
        </v-col>

        <v-col v-if="hasDescription" :cols="isSubItem ? 9 : 12" :offset="isSubItem ? 3 : 0">
          <validation-provider v-slot="{ errors }" :rules="rules.description" slim>
            <v-text-field
              v-model="description.translation[languageMode]"
              data-test="optionListNewItem__descriptionInput"
              class="optionsList__addItem ml-4"
              :label="$t('common.description')"
              :disabled="loading"
              :error="!!errors.length"
              :hide-details="!errors.length"
              :error-messages="errors"
              outlined
              dense
              background-color="white"
              @keydown.enter="save"
              @keydown.esc="cancel" />
          </validation-provider>
        </v-col>
      </template>
    </v-row>
  </validation-observer>
</template>

<script lang="ts">
import Vue from 'vue';
import { IMultilingual, VForm } from '@/types';
import StatusSelect from '@/ui/shared-components/StatusSelect.vue';
import { MAX_LENGTH_MD } from '@/constants/validations';
import { SUPPORTED_LANGUAGES_INFO } from '@/constants/trans';
import entityUtils from '@/entities/utils';
import { EOptionListItemStatus, IOptionItem } from '@/entities/optionItem';

export default Vue.extend({
  name: 'OptionListNewItem',

  components: {
    StatusSelect,
  },

  props: {
    /**
     * Whether or not this element should be in a loading state while an API call is ongoing
     */
    loading: {
      type: Boolean,
      default: false,
    },

    /**
     * Whether or not this is for an item or sub-item
     */
    isSubItem: {
      type: Boolean,
      default: false,
    },

    /**
     * If the item should show the description field
     */
    hasDescription: {
      type: Boolean,
      default: false,
    },

    /**
     * Whether or not this component is currently in add mode. Shows/hides the form inputs
     */
    addMode: {
      type: Boolean,
      default: true,
    },

    languageMode: {
      type: String,
      required: true,
    },

    addSubItemLabel: {
      type: String,
      default: '',
    },

    itemNameLabel: {
      type: String,
      default: 'system_management.lists.itemName',
    },

    /**
     * The id of the parent item (if this is a sub-item)
     */
    itemId: {
      type: String,
      default: '',
    },

    items: {
      type: Array as () => IOptionItem[],
      default: (): IOptionItem[] => [],
    },
  },

  data() {
    return {
      name: entityUtils.initMultilingualAttributes(),

      description: entityUtils.initMultilingualAttributes(),

      currentStatus: EOptionListItemStatus.Active,

      isNameUnique: true,
    };
  },

  computed: {
    itemStatuses(): Array<EOptionListItemStatus> {
      return [
        EOptionListItemStatus.Active,
        EOptionListItemStatus.Inactive,
      ];
    },

    rules(): Record<string, unknown> {
      return {
        name: {
          required: true,
          max: MAX_LENGTH_MD,
          customValidator: { isValid: this.isNameUnique, messageKey: 'validations.alreadyExists' },
        },
        description: {
          max: MAX_LENGTH_MD,
        },
      };
    },

    allNames(): IMultilingual[] {
      let names: IMultilingual[] = [];
      this.items.forEach((item) => {
        names.push(item.name);
        names = names.concat(item.subitems.map((sub) => sub.name));
      });

      return names;
    },
  },

  watch: {
    addMode() {
      // When addMode becomes true focus the input
      if (this.addMode) {
        this.$nextTick(() => {
          this.focus();
        });
      }
    },

    languageMode() {
      if (!this.name.translation[this.languageMode]) {
        let name = '';

        SUPPORTED_LANGUAGES_INFO.forEach((lang) => {
          if (!name && this.name.translation[lang.key]) {
            name = this.name.translation[lang.key];
          }
        });

        this.name.translation[this.languageMode] = name;
      }

      if (!this.description.translation[this.languageMode]) {
        let description = '';

        SUPPORTED_LANGUAGES_INFO.forEach((lang) => {
          if (!description && this.description.translation[lang.key]) {
            description = this.description.translation[lang.key];
          }
        });

        this.description.translation[this.languageMode] = description;
      }
    },
  },

  methods: {
    /**
     * Handles focusing the name input
     * @public
     */
    focus() {
      (this.$refs.input as HTMLInputElement).focus();
    },

    /**
     * Emits the 'add-mode' event with the item ID when the + Add sub-item button is pressed
     */
    enterAddMode() {
      this.$emit('add-mode', this.itemId);
    },

    /**
     * Emits the 'save' event with the name, status, and the ID of the parent item (if this is a sub-item)
     */
    async save() {
      const valid = await (this.$refs.form as VForm).validate();

      if (valid) {
        this.$emit('save', this.name, this.description, this.currentStatus, this.itemId);

        this.name = entityUtils.initMultilingualAttributes();

        this.description = entityUtils.initMultilingualAttributes();

        this.currentStatus = EOptionListItemStatus.Active;

        (this.$refs.form as VForm).reset();
      }
    },

    /**
     * Emits the cancel event
     */
    cancel() {
      this.$emit('cancel');
    },

    checkNameUniqueness(input: string) {
      const treat = ((str: string) => str.trim().toLowerCase());

      const treatedInput = treat(input);

      this.isNameUnique = !this.allNames.some((name) => {
        const langs = Object.keys(name.translation);
        return langs.some((lang) => treat(name.translation[lang]) === treatedInput);
      });
    },
  },
});
</script>

<style scoped lang="scss">
.optionsList__itemAdd {
  border-top: 1px solid var(--v-grey-lighten2);
  min-height: 64px;

  div.col {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .alignRight {
    justify-content: flex-end;
  }
}

.optionsList__itemAdd.active {
  background-color: var(--v-primary-lighten2);
}

.optionListItem__nameInput {
  max-width: 300px;
}
</style>
