<template>
  <v-container fluid :data-test="dataTest">
    <v-row class="rcnestedtable__header" align="center">
      <v-col
        v-for="(header, $headerIndex) in headers"
        :key="header.value"
        :class="{
          right: header.align === 'right',
          left: header.align === 'left',
          center: header.align === 'center',
          rcNestedTable__col: true,
          'pl-6': $headerIndex === 0,
          'pr-3': $headerIndex === headers.length - 1,
        }"
        :cols="header.cols">
        <span class="rc-body14 fw-bold break-word" :data-test="`${dataTest}__header--${header.value}`">
          {{ header.text }}
        </span>
      </v-col>
    </v-row>

    <draggable v-model="sortItems" handle=".rcnestedtable__dragHandle" ghost-class="ghost" class="mt-3">
      <template v-for="(item, $index) in items">
        <v-row
          :key="`item__${$index}`"
          :data-test="`${dataTest}_item__${$index}`"
          :class="{
            rcnestedtable__row: true,
            rcnestedtable__parentRow: true,
            active: editedItem === item,
          }"
          align="center">
          <v-col
            v-for="(header, $headerIndex) in headers"
            :key="`item__${$index}__${header.value}`"
            :data-test="`${dataTest}_item__${$index}__${header.value}`"
            :class="{
              right: header.align === 'right',
              left: header.align === 'left',
              center: header.align === 'center',
              rcNestedTable__col: true,
              'pl-6': $headerIndex === 0,
              'pr-3': $headerIndex === headers.length - 1,
            }"
            :cols="header.cols">
            <v-icon
              v-if="sortable && $headerIndex === 0 && editedItem !== item"
              class="rcnestedtable__dragHandle"
              :data-test="`${dataTest}__dragHandle--${$index}`">
              mdi-drag
            </v-icon>

            <v-btn
              v-if="collapsible && $headerIndex === 0 && editedItem !== item"
              icon
              small
              :data-test="`${dataTest}__collapseButton--${$index}`"
              :aria-label="$t('common.buttons.expand')"
              @click="collapseItem($index)">
              <v-icon v-if="getIsItemCollapsed($index)">
                mdi-menu-right
              </v-icon>

              <v-icon v-else>
                mdi-menu-down
              </v-icon>
            </v-btn>

            <!-- Slot edit-item -->
            <slot v-if="editedItem === item" :item="item" :index="$index" :name="`edit-item.${header.value}`">
              <!-- Use the add-item slot if available to avoid duplication -->
              <slot v-if="$scopedSlots[`add-item.${header.value}`]" :item="item" :index="$index" :name="`add-item.${header.value}`" />

              <span v-else class="rc-body14 break-word">
                {{ item[header.value] }}
              </span>
            </slot>

            <!-- Slot item -->
            <slot v-else :item="item" :index="$index" :name="`item.${header.value}`">
              <span class="rc-body14 break-word">
                {{ item[header.value] }}
              </span>
            </slot>
          </v-col>

          <v-col cols="12" class="py-0">
            <draggable
              v-if="!getIsItemCollapsed($index)"
              :value="getSubItems(item)"
              handle=".rcnestedtable__dragHandle"
              ghost-class="ghost"
              @start="sortingParentItem = item"
              @sort="onSortSubItems">
              <v-row
                v-for="(subItem, $subIndex) in getSubItems(item)"
                :key="`subItem__${$index}__${$subIndex}`"
                :data-test="`${dataTest}__subItem__${$index}__${$subIndex}`"
                align="center"
                :class="{
                  rcnestedtable__row: true,
                  active: editedItem === subItem,
                }">
                <v-col
                  v-for="(header, $headerIndex) in headers"
                  :key="`subItem__${$index}__${$subIndex}__${header.value}`"
                  :data-test="`${dataTest}__subItem__${$index}__${$subIndex}__${header.value}`"
                  :class="{
                    right: header.align === 'right',
                    left: header.align === 'left',
                    center: header.align === 'center',
                    rcNestedTable__col: true,
                    'pl-3': $headerIndex === 0,
                    'pr-3': $headerIndex === headers.length - 1,
                  }"
                  :cols="header.cols">
                  <v-icon
                    v-if="sortable && $headerIndex === 1 && editedItem !== subItem"
                    class="rcnestedtable__dragHandle"
                    :data-test="`${dataTest}__dragHandleSub--${$index}--${$subIndex}`">
                    mdi-drag
                  </v-icon>

                  <!-- Slot edit-sub-item -->
                  <slot
                    v-if="editedItem === subItem"
                    :item="subItem"
                    :index="$subIndex"
                    :parent="item"
                    :parent-index="$index"
                    :name="`edit-sub-item.${header.value}`">
                    <!-- Use the add-sub-item slot if available to avoid duplication -->
                    <slot
                      v-if="$scopedSlots[`add-sub-item.${header.value}`]"
                      :item="subItem"
                      :index="$subIndex"
                      :parent="item"
                      :parent-index="$index"
                      :name="`add-sub-item.${header.value}`" />

                    <span v-else class="rc-body14 break-word">
                      {{ subItem[header.value] }}
                    </span>
                  </slot>

                  <!-- Slot sub-item -->
                  <slot v-else :item="subItem" :index="$subIndex" :parent="item" :parent-index="$index" :name="`sub-item.${header.value}`">
                    <span class="rc-body14 break-word">
                      {{ subItem[header.value] }}
                    </span>
                  </slot>
                </v-col>
              </v-row>
            </draggable>

            <template v-if="addItem === $index">
              <v-row :key="`addSubItem__${$index}`" class="rcnestedtable__row active">
                <v-col
                  v-for="(header, $headerIndex) in headers"
                  :key="`addSubItem__${header.value}`"
                  :class="{
                    right: header.align === 'right',
                    left: header.align === 'left',
                    center: header.align === 'center',
                    rcNestedTable__col: true,
                    'pl-3': $headerIndex === 0,
                    'pr-3': $headerIndex === headers.length - 1,
                  }"
                  :cols="header.cols">
                  <!-- Slot add-sub-item -->
                  <slot :index="$index" :parent="item" :name="`add-sub-item.${header.value}`" />
                </v-col>
              </v-row>
            </template>

            <v-row v-if="showAddSubItem" :key="`addSubItemButton__${$index}`" class="mt-2 mb-n1">
              <v-col :cols="12 - headers[0].cols" :offset="headers[0].cols">
                <v-btn
                  color="primary"
                  :disabled="getIsAddSubItemDisabled($index) || addItem !== false"
                  :data-test="`${dataTest}__addSubItem--${$index}`"
                  :aria-label="$t('financialAssistance.addSubItem')"
                  @click="onAddSubItem($index)">
                  <v-icon>
                    mdi-plus
                  </v-icon>
                  {{ mergedLabels.addSubItem }}
                </v-btn>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </template>
    </draggable>

    <template v-if="addItem === true">
      <v-row class="rcnestedtable__row active mt-3">
        <v-col
          v-for="(header, $headerIndex) in headers"
          :key="`addItem__${header.value}`"
          :class="{
            right: header.align === 'right',
            left: header.align === 'left',
            center: header.align === 'center',
            rcNestedTable__col: true,
            'pl-3': $headerIndex === 0,
            'pr-3': $headerIndex === headers.length - 1,
          }"
          :cols="header.cols">
          <!-- Slot add-item -->
          <slot :name="`add-item.${header.value}`" />
        </v-col>
      </v-row>
    </template>

    <v-row v-if="showAddItem" class="rcnestedtable__row mt-3">
      <v-col cols="12">
        <v-btn color="primary" :disabled="disableAddItem || addItem !== false" :data-test="`${dataTest}__addItem`" @click="onAddItem">
          <v-icon>
            mdi-plus
          </v-icon>
          {{ mergedLabels.addItem }}
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import draggable from 'vuedraggable';

/**
 * A nested table component including sorting, adding/editing of items
 */
export default Vue.extend({
  name: 'RcNestedTable',

  components: {
    draggable,
  },

  props: {
    /**
     * The configuration of the table headers. Format:
     * { text: string; value: string; cols: number (1 - 12); align: left | right | center }
     */
    headers: {
      type: Array,
      required: true,
    },

    /**
     * The array of items to render in the table
     */
    items: {
      type: Array,
      required: true,
    },

    /**
     * The string property name of the sub-item array in the items, or a function
     * which resolves to the child array
     */
    itemSubItem: {
      type: [String, Function],
      default: 'subItems',
    },

    /**
     * Whether to show the add item button
     */
    showAddItem: {
      type: Boolean,
      default: false,
    },

    /**
     * Whether to disable the add item button
     */
    disableAddItem: {
      type: Boolean,
      default: false,
    },

    /**
     * Whether to show the add sub item button
     */
    showAddSubItem: {
      type: Boolean,
      default: false,
    },

    /**
     * Whether to disable the add sub item buttons. Pass true to disable all of them,
     * or pass an array of booleans to disable the button for each item individually
     */
    disableAddSubItem: {
      type: [Array, Boolean],
      default: false,
    },

    /**
     * Represents the item being added. If the value is true, an item is being added.
     * If it is a number, a sub-item is being added under the item at the index equal to this value
     */
    addItem: {
      type: [Boolean, Number],
      default: false,
    },

    /**
     * Represents the item being edited. Pass in the item or sub-item object being edited.
     */
    editedItem: {
      type: Object,
      default: null,
    },

    /**
     * Whether to show the collapsible buttons for item rows
     */
    collapsible: {
      type: Boolean,
      default: false,
    },

    /**
     * Whether to enable the sorting behaviour
     */
    sortable: {
      type: Boolean,
      default: false,
    },

    /**
     * A dictionary of labels to pass in for i18n purposes
     * { addItem: 'Add item', addSubItem: 'Add sub-item' }
     */
    labels: {
      type: Object,
      default: () => ({}),
    },

    /**
     * The data test attribute to apply to the root element, and to prepend to the data-tests for buttons
     */
    dataTest: {
      type: String,
      default: 'rcNestedTable',
    },
  },

  data() {
    return {
      collapsedItems: {} as Record<string, boolean>,
      sortingParentItem: {},
    };
  },

  computed: {
    /**
     * Merges the labels passed in as props with the default values
     */
    mergedLabels(): Record<string, string> {
      return {
        addItem: 'Add item',
        addSubItem: 'Add sub-item',
        ...this.labels,
      };
    },

    /**
     * Handles sorting the items when the user uses the drag handle
     */
    sortItems: {
      get(): Array<unknown> {
        return this.items;
      },

      set(value: Array<unknown>) {
        this.$emit('sort-items', value);
      },
    },
  },

  methods: {
    /**
     * Get the sub-items for the specified item using the itemSubItem prop
     */
    getSubItems(item: Record<string, string>) {
      if (typeof this.itemSubItem === 'function') {
        return this.itemSubItem(item);
      }

      return item[this.itemSubItem];
    },

    /**
     * Emits the update:add-item event when the Add Item button is pressed
     */
    onAddItem() {
      this.$emit('update:add-item', true);
    },

    /**
     * Emits the update:add-item event when the Add Sub Item button is pressed
     */
    onAddSubItem(index: number) {
      this.$emit('update:add-item', index);
    },

    /**
     * Determines whether or not an Add Sub Item button should be disabled, using the disableAddSubItem prop
     */
    getIsAddSubItemDisabled(index: number) {
      if (typeof this.disableAddSubItem === 'boolean') {
        return this.disableAddSubItem;
      }

      return !!this.disableAddSubItem[index];
    },

    /**
     * Handles when a user clicks on the button to expand/collapse an item's list of sub-items
     */
    collapseItem(index: number) {
      const isCollapsed = !!this.collapsedItems[index];

      this.$set(this.collapsedItems, index, !isCollapsed);
    },

    /**
     * Returns true if an item's list of sub-items is collapsed and should be hidden
     */
    getIsItemCollapsed(index: number) {
      if (!this.collapsible) {
        return false;
      }

      return !!this.collapsedItems[index];
    },

    /**
     * Handles sorting the sub items
     */
    onSortSubItems(e: Record<string, number>) {
      const subItems = this.getSubItems(this.sortingParentItem as Record<string, string>);

      const parentIndex = this.items.indexOf(this.sortingParentItem);

      if (parentIndex < 0) {
        return;
      }

      const itemToMove = subItems[e.oldIndex];

      const removed = [...subItems.slice(0, e.oldIndex), ...subItems.slice(e.oldIndex + 1)];

      const added = [...removed.slice(0, e.newIndex), itemToMove, ...removed.slice(e.newIndex)];

      this.$emit('sort-sub-items', parentIndex, added);
    },
  },
});
</script>

<style scoped lang="scss">
.rcnestedtable__header {
  min-height: 56px;
  border-top: 1px solid var(--v-grey-lighten2);
  border-bottom: 1px solid var(--v-grey-lighten2);
  box-shadow: 0px 2px 3px 0px rgba(0, 0, 0, 0.12);
}

.rcnestedtable__parentRow {
  &.active {
    background-color: var(--v-primary-lighten2);

    .rcnestedtable__row {
      background-color: white;
    }
  }
}

.rcnestedtable__row {
  min-height: 48px;
  border-bottom: 1px solid var(--v-grey-lighten2);

  &.active {
    background-color: var(--v-primary-lighten2);
  }

  &:first-child {
    border-top: 1px solid var(--v-grey-lighten2);
  }
}

.right {
  text-align: right;
}

.left {
  text-align: left;
}

.center {
  text-align: center;
}

.ghost {
  background-color: var(--v-primary-lighten2) !important;
}

.rcnestedtable__dragHandle {
  cursor: grab;
}

.rcNestedTable__col {
  padding-left: 6px;
  padding-right: 6px;
}

.testtest {
  background-color: aqua;
}
</style>
