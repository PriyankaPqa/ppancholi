<template>
  <validation-observer ref="form" v-slot="{ pristine, dirty, invalid }" slim>
    <v-row :class="{ optionsList__item: true, active: editMode }">
      <v-col v-if="isSubItem" :class="{ search: isSearchResult, 'pb-2': true }" cols="3" />

      <v-col v-if="!editMode" :class="{ search: isSearchResult, 'pb-2': true }" :cols="isSubItem ? '4' : '7'">
        <v-icon data-test="optionsListItem__dragHandle" :class="hideItemDrag ? 'hidden' : 'optionsList__dragHandle mr-1'">
          mdi-drag
        </v-icon>

        <v-btn
          v-if="isCascading"
          data-test="optionsListItem__expandBtn"
          icon
          small
          class="mr-1"
          :aria-label="$t('common.buttons.expand')"
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
          <template v-if="isCascading && item.subitems">
            {{ ` (${item.subitems.length})` }}
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
            {{ $t('common.pleaseSpecify') }}
          </v-chip>

          <v-chip
            v-if="hasRestrictFinancial && item.restrictFinancial"
            class="otherDefaultChip ml-2"
            small
            color="primary lighten-1"
            text-color="grey darken-4"
            close
            @click:close="setRestrictFinancial">
            {{ $t('common.restrictFinancial') }}
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
            :label="$t(itemNameLabel)"
            :disabled="loading || renameNotAllowed"
            :error="!!errors.length"
            :hide-details="!errors.length"
            :error-messages="errors"
            outlined
            dense
            background-color="white"
            @input="checkNameUniqueness($event)"
            @keydown.enter.stop="saveItem"
            @keydown.esc.stop="cancelEdit" />
        </v-col>
      </validation-provider>

      <v-col :class="{ search: isSearchResult, 'pb-2': true }" cols="3">
        <status-select
          v-if="!hideItemStatus && !editMode"
          :disabled="readonly"
          :value="item.status"
          :statuses="itemStatuses"
          status-name="Status"
          data-test="optionsListItem__statusSelect"
          :attach="false"
          @input="onChangeStatus" />
      </v-col>

      <v-col v-if="!editMode" :class="{ search: isSearchResult, 'pb-2': true }" class="alignRight" cols="2">
        <v-btn data-test="optionsListItem__editBtn" icon :aria-label="$t('common.edit')" :disabled="editDisabled" @click="editItem">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>

        <v-menu v-if="hasOther || hasDefault || hasRestrictFinancial" offset-y>
          <template #activator="{ on, attrs }">
            <v-btn v-bind="attrs" data-test="optionsListItem__menuBtn" :aria-label="$t('task.action')" icon :disabled="editDisabled" v-on="on">
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>

          <v-list>
            <v-list-item v-if="hasDefault" @click="setIsDefault">
              {{ $t('common.default') }}
              <v-icon v-if="item.isDefault" :aria-label="$t('common.buttons.close')" class="ml-2" small>
                mdi-close
              </v-icon>
            </v-list-item>

            <v-list-item v-if="hasOther" @click="setIsOther">
              {{ $t('common.pleaseSpecify') }}
              <v-icon v-if="item.isOther" :aria-label="$t('common.buttons.close')" class="ml-2" small>
                mdi-close
              </v-icon>
            </v-list-item>

            <v-list-item v-if="hasRestrictFinancial" @click="setRestrictFinancial">
              {{ $t('common.restrictFinancial') }}
              <v-icon v-if="item.restrictFinancial" :aria-label="$t('common.buttons.close')" class="ml-2" small>
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

        <v-btn data-test="optionsListItem__cancelBtn" icon class="ml-2" :aria-label="$t('common.buttons.close')" :disabled="loading" @click="cancelEdit">
          <v-icon>
            mdi-close
          </v-icon>
        </v-btn>
      </v-col>

      <template v-if="hasDescription && editMode">
        <v-col v-if="editMode && isSubItem" :class="{ search: isSearchResult }" cols="3" />

        <v-col
          v-if="editMode"
          :class="{ search: isSearchResult, 'mb-4 py-0': true }"
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
              clearable
              @keydown.enter="saveItem"
              @keydown.esc="cancelEdit"
              @click:clear="clearDescription" />
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
          <v-row v-if="item.subitems && item.subitems.length">
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
        :cancel-action-label="$t('common.buttons.cancel')"
        :show.sync="showStatusDialog"
        content-padding="6"
        max-width="450"
        persistent
        show-close
        :loading="updatingStatus"
        @close="showStatusDialog = false"
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
import Vue, { toRef } from 'vue';
import { RcDialog } from '@libs/component-lib/components';
import StatusSelect from '@/ui/shared-components/StatusSelect.vue';
import { VForm } from '@libs/shared-lib/types';
import entityUtils from '@libs/entities-lib/utils';
import { EOptionLists, IOptionItem } from '@libs/entities-lib/optionItem';
import { Status } from '@libs/entities-lib/base';
import { useOptionListStore } from '@/pinia/option-list/optionList';
import { useOptionListItem } from './useOptionListItem';

export default Vue.extend({
  name: 'OptionListItem',

  components: {
    StatusSelect,
    RcDialog,
  },

  props: {
    /**
     * The item or sub-item to render
     */
    item: {
      type: Object as () => IOptionItem,
      required: true,
    },

    items: {
      type: Array as () => IOptionItem[],
      default: (): IOptionItem[] => [],
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
     * The id of the parent item (if this is a sub-item)
     */
    parentItemId: {
      type: String,
      default: '',
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

    /**
     * If the list allows the user to set the restrict financial attribute for an item
     */
    hasRestrictFinancial: {
      type: Boolean,
      default: false,
    },

    /**
     * If the list allows the user to see and modify the status of the item
     */
    hideItemStatus: {
      type: Boolean,
      default: false,
    },

    /**
     * If the item should hide the drag handle
     */
    hideItemDrag: {
      type: Boolean,
      default: false,
    },

    itemNameLabel: {
      type: String,
      default: 'system_management.lists.itemName',
    },

    readonly: {
      type: Boolean,
      default: false,
    },
  },

  setup(props) {
    const { rules, getParentItem, checkNameUniqueness,
     } = useOptionListItem(props.isSubItem, toRef(props, 'editMode'), toRef(props, 'items'), props.item, props.parentItemId);
    return { rules, getParentItem, checkNameUniqueness };
  },

  data() {
    return {
      name: this.item.name ? entityUtils.getFilledMultilingualField(this.item.name) : entityUtils.initMultilingualAttributes(),

      description: this.item.description ? entityUtils.getFilledMultilingualField(this.item.description) : entityUtils.initMultilingualAttributes(),

      showStatusDialog: false,

      changeToStatus: null,

      subItems: [] as Array<IOptionItem>,

      subItemsExpanded: true,

      updatingStatus: false,

      itemStatuses: [Status.Active, Status.Inactive],
    };
  },

  computed: {

    renameNotAllowed(): boolean {
      return useOptionListStore().list === EOptionLists.Roles && !this.isSubItem;
    },

  },

  watch: {
    editMode() {
      if (this.editMode) {
        this.name = entityUtils.getFilledMultilingualField(this.item.name);

        if (this.item.description) {
          this.description = entityUtils.getFilledMultilingualField(this.item.description);
        } else {
          this.description = entityUtils.initMultilingualAttributes();
        }

        this.$nextTick(() => {
          (this.$refs.input as HTMLInputElement).focus();
        });
      }
    },

    languageMode() {
      this.name = entityUtils.getFilledMultilingualField(this.name);

      this.description = entityUtils.getFilledMultilingualField(this.description);
    },
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
    onChangeStatus(status: Status) {
      this.changeToStatus = status;
      this.showStatusDialog = true;
    },

    /**
     * Emits the 'change-status' event with the item and the new status value when the dialog is confirmed
     */
    async confirmChangeStatus() {
      this.updatingStatus = true;

      try {
        if (this.isSubItem) {
          !!this.getParentItem() && await useOptionListStore().updateSubItemStatus({ itemId: this.getParentItem().id, subItemId: this.item.id, status: this.changeToStatus });
        } else {
          await useOptionListStore().updateStatus({ id: this.item.id, status: this.changeToStatus });
        }
      } finally {
        this.updatingStatus = false;
        this.showStatusDialog = false;
      }
    },

    getStatusKey(status: Status) {
      return Status[status];
    },

    async setIsDefault() {
      if (this.readonly) {
        return;
      }
      const value = !this.item.isDefault;
      await useOptionListStore().setIsDefault({ id: this.item.id, isDefault: value });
      if (value) {
        this.$toasted.global.success(this.$t('system_management.lists.defaultOptionSet'));
      } else {
        this.$toasted.global.success(this.$t('system_management.lists.defaultOptionRemoved'));
      }
    },

    async setIsOther() {
      if (this.readonly) {
        return;
      }
      const value = !this.item.isOther;
      let res = null as IOptionItem;
      if (this.isSubItem) {
        res = !!this.getParentItem() && await useOptionListStore().setSubItemIsOther({ itemId: this.getParentItem().id, subItemId: this.item.id, isOther: value });
      } else {
        res = await useOptionListStore().setIsOther({ id: this.item.id, isOther: value });
      }

      if (!res) {
        this.$toasted.global.error(this.$t('system_management.lists.errorUpdating'));
      } else if (value) {
          this.$toasted.global.success(this.$t('system_management.lists.otherOptionSet'));
      } else {
        this.$toasted.global.success(this.$t('system_management.lists.otherOptionRemoved'));
      }
    },

    async setRestrictFinancial() {
      if (this.readonly) {
        return;
      }
      const value = !this.item.restrictFinancial;
      await useOptionListStore().setRestrictFinancial({ id: this.item.id, restrictFinancial: value });
      if (value) {
        this.$toasted.global.success(this.$t('system_management.lists.restrictFinancialOptionSet'));
      } else {
        this.$toasted.global.success(this.$t('system_management.lists.restrictFinancialOptionUnset'));
      }
    },

    clearDescription() {
      this.description = entityUtils.initMultilingualAttributes();
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
      margin-bottom: 10px;
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

.hidden {
  display: none;
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
