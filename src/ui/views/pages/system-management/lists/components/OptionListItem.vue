<template>
  <validation-observer ref="form" v-slot="{ pristine, dirty, invalid }" slim>
    <v-row :class="{ optionsList__item: true, active: editMode }">
      <v-col v-if="isSubItem" :class="{ search: isSearchResult, 'pb-2': true }" cols="3" />

      <v-col v-if="!editMode" :class="{ search: isSearchResult, 'pb-2': true }" :cols="isSubItem ? '4' : '7'">
        <v-icon data-test="optionsListItem__dragHandle" class="optionsList__dragHandle mr-1">
          mdi-drag
        </v-icon>

        <v-btn
          v-if="isCascading"
          data-test="optionsListItem__expandBtn"
          icon
          small
          class="mr-1"
          @click="subItemsExpanded = !subItemsExpanded">
          <v-icon v-if="subItemsExpanded">
            mdi-menu-up
          </v-icon>
          <v-icon v-else>
            mdi-menu-down
          </v-icon>
        </v-btn>

        <span data-test="optionsListItem__name" class="rc-body14 fw-bold optionsListItem__name">
          {{ item.name.translation[languageMode] }}
          <template v-if="isCascading && item.optionsListSubItems">
            {{ ` (${item.optionsListSubItems.length})` }}
          </template>
        </span>

        <div>
          <v-chip
            v-if="hasDefault && item.isDefault"
            class="otherDefaultChip ml-2"
            small
            color="primary lighten-1"
            text-color="grey darken-4"
            close
            @click:close="setIsDefault">
            {{ $t('common.default') }}
          </v-chip>

          <v-chip
            v-if="hasOther && item.isOther"
            class="otherDefaultChip ml-2"
            small
            color="primary lighten-1"
            text-color="grey darken-4"
            close
            @click:close="setIsOther">
            {{ $t('common.other') }}
          </v-chip>
        </div>
      </v-col>

      <validation-provider v-else v-slot="{ errors }" :rules="rules.name" slim>
        <v-col :class="{ search: isSearchResult, 'pb-2': !!errors.length }" :cols="isSubItem ? '4' : '7'">
          <v-text-field
            ref="input"
            v-model="name.translation[languageMode]"
            data-test="optionsListItem__nameInput"
            class="optionListItem__nameInput ml-4"
            :label="$t('system_management.lists.itemName')"
            :disabled="loading"
            :error="!!errors.length"
            :hide-details="!errors.length"
            :error-messages="errors"
            outlined
            dense
            background-color="white"
            @keydown.enter.stop="saveItem"
            @keydown.esc.stop="cancelEdit" />
        </v-col>
      </validation-provider>

      <v-col :class="{ search: isSearchResult, 'pb-2': true }" cols="3">
        <status-select
          :value="item.itemStatus"
          :statuses="itemStatuses"
          status-name="EOptionListItemStatus"
          data-test="optionsListItem__statusSelect"
          @input="onChangeStatus" />
      </v-col>

      <v-col v-if="!editMode" :class="{ search: isSearchResult, 'pb-2': true }" class="alignRight" cols="2">
        <v-btn data-test="optionsListItem__editBtn" icon :disabled="editDisabled" @click="editItem">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>

        <v-menu v-if="hasOther || hasDefault" offset-y>
          <template #activator="{ on, attrs }">
            <v-btn v-bind="attrs" data-test="optionsListItem__menuBtn" icon :disabled="editDisabled" v-on="on">
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>

          <v-list>
            <v-list-item v-if="hasDefault" @click="setIsDefault">
              {{ $t('common.default') }}
              <v-icon v-if="item.isDefault" class="ml-2" small>
                mdi-close
              </v-icon>
            </v-list-item>

            <v-list-item v-if="hasOther" @click="setIsOther">
              {{ $t('common.other') }}
              <v-icon v-if="item.isOther" class="ml-2" small>
                mdi-close
              </v-icon>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-col>

      <v-col v-else :class="{ search: isSearchResult, alignRight: true }" cols="2">
        <v-btn data-test="optionsListItem__saveBtn" color="primary" :disabled="pristine || (dirty && invalid)" :loading="loading" @click="saveItem">
          {{ $t('common.buttons.save') }}
        </v-btn>

        <v-btn data-test="optionsListItem__cancelBtn" icon class="ml-2" :disabled="loading" @click="cancelEdit">
          <v-icon>
            mdi-close
          </v-icon>
        </v-btn>
      </v-col>

      <template v-if="hasDescription && editMode">
        <v-col v-if="editMode && isSubItem" :class="{ search: isSearchResult }" cols="3" />

        <v-col
          v-if="editMode"
          :class="{ search: isSearchResult }"
          :cols="isSubItem ? '9' : '12'">
          <validation-provider v-slot="{ errors }" :rules="rules.description" slim>
            <v-text-field
              v-model="description.translation[languageMode]"
              data-test="optionsListItem__descriptionInput"
              class="ml-4"
              :label="$t('common.description')"
              :disabled="loading"
              :error="!!errors.length"
              :hide-details="!errors.length"
              :error-messages="errors"
              outlined
              dense
              background-color="white"
              @keydown.enter="saveItem"
              @keydown.esc="cancelEdit" />
          </validation-provider>
        </v-col>
      </template>

      <template v-else-if="hasDescription">
        <v-col
          v-if="isSubItem"
          :class="{ search: isSearchResult, 'pt-0 optionsList__description': true }"
          cols="3" />

        <v-col
          :class="{ search: isSearchResult, 'pt-0 optionsList__description': true }"
          :style="`padding-left: ${isSubItem ? '40px' : '74px' }`"
          :cols="isSubItem ? '9' : '12'">
          <span v-if="item.description && item.description.translation" class="rc-body14">
            {{ item.description.translation[languageMode] }}
          </span>
        </v-col>
      </template>

      <v-col v-if="isCascading && subItemsExpanded" class="py-0" cols="12">
        <v-container fluid class="pa-0">
          <v-row v-if="item.optionsListSubItems && item.optionsListSubItems.length">
            <slot name="default" />
          </v-row>

          <v-row>
            <slot name="add" />
          </v-row>
        </v-container>
      </v-col>

      <rc-dialog
        data-test="optionsListItem__statusDialog"
        :title="$t('system_management.lists.statusDialog.title')"
        :submit-action-label="$t('common.buttons.confirm')"
        :show.sync="showStatusDialog"
        content-padding="6"
        max-width="450"
        persistent
        show-close
        @cancel="showStatusDialog = false"
        @submit="confirmChangeStatus">
        <div v-if="changeToStatus" class="rc-body14">
          {{ $t('system_management.lists.statusDialog.body', { status: $t(`system_management.lists.status.${getStatusKey(changeToStatus)}`) }) }}
        </div>
      </rc-dialog>
    </v-row>
  </validation-observer>
</template>

<script lang="ts">
import Vue from 'vue';
import { ValidationObserver, ValidationProvider } from 'vee-validate';
import { RcDialog } from '@crctech/component-library';
import StatusSelect from '@/ui/shared-components/StatusSelect.vue';
import {
  IOptionListItem,
  EOptionListItemStatus,
  IOptionListSubItem,
  VForm,
} from '@/types';
import { MAX_LENGTH_MD } from '@/constants/validations';
import entityUtils from '@/entities/utils';

export default Vue.extend({
  name: 'OptionListItem',

  components: {
    ValidationObserver,
    ValidationProvider,
    StatusSelect,
    RcDialog,
  },

  props: {
    /**
     * The item or sub-item to render
     */
    item: {
      type: Object as () => IOptionListItem | IOptionListSubItem,
      required: true,
    },

    /**
     * The current language selected from the parent component's language tabs
     */
    languageMode: {
      type: String,
      required: true,
    },

    /**
     * Whether or not the parent list type is cascading or non-cascading (items + sub-items)
     */
    isCascading: {
      type: Boolean,
      default: false,
    },

    /**
     * Whether or not this component represents a sub-item
     */
    isSubItem: {
      type: Boolean,
      default: false,
    },

    /**
     * If this item should be highlighted by the search function
     */
    isSearchResult: {
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
     * If this item is in edit mode
     */
    editMode: {
      type: Boolean,
      required: true,
    },

    /**
     * If this item should have its edit button disabled by having a NewItem component active
     */
    editDisabled: {
      type: Boolean,
      default: false,
    },

    /**
     * If this item should be in a loading state during an ongoing API call
     */
    loading: {
      type: Boolean,
      default: false,
    },

    /**
     * If the list allows the user to set the default option
     */
    hasDefault: {
      type: Boolean,
      default: false,
    },

    /**
     * If the list allows the user to set the other option
     */
    hasOther: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      name: this.item.name ? entityUtils.getFilledMultilingualField(this.item.name) : entityUtils.initMultilingualAttributes(),

      description: this.item.description ? entityUtils.getFilledMultilingualField(this.item.description) : entityUtils.initMultilingualAttributes(),

      showStatusDialog: false,

      changeToStatus: null,

      subItems: [] as Array<IOptionListSubItem>,

      subItemsExpanded: true,

      rules: {
        name: {
          required: true,
          max: MAX_LENGTH_MD,
        },
        description: {
          max: MAX_LENGTH_MD,
        },
      },
    };
  },

  computed: {
    itemStatuses(): Array<EOptionListItemStatus> {
      return [
        EOptionListItemStatus.Active,
        EOptionListItemStatus.Inactive,
      ];
    },
  },

  watch: {
    editMode() {
      if (this.editMode) {
        this.name = entityUtils.getFilledMultilingualField(this.item.name);

        if (this.item.description) {
          this.description = entityUtils.getFilledMultilingualField(this.item.description);
        }

        this.$nextTick(() => {
          (this.$refs.input as HTMLInputElement).focus();
        });
      }
    },

    item() {
      // this.subItems = _cloneDeep((this.item as IOptionListItem).optionsListSubItems);
    },

    languageMode() {
      this.name = entityUtils.getFilledMultilingualField(this.name);

      this.description = entityUtils.getFilledMultilingualField(this.description);
    },
  },

  mounted() {
    // this.subItems = _cloneDeep((this.item as IOptionListItem).optionsListSubItems);
  },

  methods: {
    /**
     * Emits the 'edit-item' event when the pencil button is pushed
     */
    editItem() {
      this.$emit('edit-item', this.item);
    },

    /**
     * Emits the save-item event with the item and the new name value
     */
    async saveItem() {
      const valid = await (this.$refs.form as VForm).validate();

      if (valid) {
        this.$emit('save-item', this.item, this.name, this.description);
      }
    },

    /**
     * Emits the cancel-edit event when the cancel button is pressed
     */
    cancelEdit() {
      this.$emit('cancel-edit');
    },

    /**
     * Shows the status change dialog when the status selector is used
     */
    onChangeStatus(status: EOptionListItemStatus) {
      this.changeToStatus = status;
      this.showStatusDialog = true;
    },

    /**
     * Emits the 'change-status' event with the item and the new status value when the dialog is confirmed
     */
    confirmChangeStatus() {
      this.$emit('change-status', this.item, this.changeToStatus);
      this.showStatusDialog = false;
    },

    getStatusKey(status: EOptionListItemStatus) {
      return EOptionListItemStatus[status];
    },

    async setIsDefault() {
      const value = !this.item.isDefault;
      await this.$storage.optionList.actions.setIsDefault(this.item.id, value);
      if (value) {
        this.$toasted.global.success(this.$t('system_management.lists.defaultOptionSet'));
      } else {
        this.$toasted.global.success(this.$t('system_management.lists.defaultOptionRemoved'));
      }
    },

    async setIsOther() {
      const value = !this.item.isOther;
      await this.$storage.optionList.actions.setIsOther(this.item.id, value);
      if (value) {
        this.$toasted.global.success(this.$t('system_management.lists.otherOptionSet'));
      } else {
        this.$toasted.global.success(this.$t('system_management.lists.otherOptionRemoved'));
      }
    },
  },
});
</script>

<style scoped lang="scss">
.optionsList__item {
  border-top: 1px solid var(--v-grey-lighten2);
  min-height: 64px;
  margin-top: 0;
  margin-bottom: 0;

  div.col {
    display: flex;
    flex-direction: row;
    align-items: center;
    min-height: 64px;

    &.optionsList__description {
      min-height: 0px;
    }
  }

  .alignRight {
    justify-content: flex-end;
  }
}

.optionsList__item.active {
  background-color: var(--v-primary-lighten2);
}

.optionsListItem__name {
  word-break: break-word;
}

.optionListItem__nameInput {
  max-width: 300px;
}

.optionsList__dragHandle {
  cursor: grab;
}

.search {
  background: var(--v-status_yellow_pale-base);
}

.otherDefaultChip {
  ::v-deep.v-chip__close {
    color: var(--v-grey-darken3);
  }
}
</style>
