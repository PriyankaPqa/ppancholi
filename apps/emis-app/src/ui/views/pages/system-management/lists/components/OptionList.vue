<template>
  <rc-page-content
    :title="formattedTitle"
    :help-link="helpLink"
    :show-add-button="showAddButton"
    :add-button-label="$t(addButtonLabel)"
    :show-help="false && !embedded"
    show-search
    :fullscreen="embedded"
    @search="search = $event"
    @add-button="addItem">
    <template v-if="embedded" #buttons>
      <v-btn class="ml-2" icon data-test="optionsList__closeDialog" @click="closeDialog()">
        <v-icon color="primary lighten-2">
          mdi-close
        </v-icon>
      </v-btn>
    </template>

    <v-container v-if="loading">
      <v-row justify="center">
        <v-col cols="12" lg="10" class="mt-10">
          <v-skeleton-loader class="my-6" type="article" />
          <v-skeleton-loader class="my-6" type="article" />
          <v-skeleton-loader class="my-6" type="article" />
        </v-col>
      </v-row>
    </v-container>

    <v-container v-else-if="!error" class="full-height">
      <v-row justify="center" class="full-height">
        <v-col cols="12" lg="10" class="mt-4 flex-parent full-height">
          <rc-tabs>
            <rc-tab
              v-for="lang in supportedLanguages"
              :key="lang.key"
              :label="$t(`tab.${lang.key}`)"
              :data-test="`optionsList__lang-${lang.key}`"
              :active="languageMode === lang.key"
              @click="setLanguageMode(lang.key)" />
          </rc-tabs>

          <v-container :class="{ scroller: !embedded }" fluid>
            <v-row class="optionsList__header">
              <template v-if="isCascading">
                <v-col cols="3">
                  <span class="rc-body14 fw-bold">{{ $t(itemLabel) }}</span>
                </v-col>

                <v-col cols="4">
                  <span class="rc-body14 fw-bold">{{ $t(subItemLabel) }}</span>
                </v-col>
              </template>

              <template v-else>
                <v-col cols="7">
                  <span class="rc-body14 fw-bold">{{ $t('system_management.lists.header.item') }}</span>
                </v-col>
              </template>

              <v-col cols="3">
                <span class="rc-body14 fw-bold">{{ $t('system_management.lists.header.status') }}</span>
              </v-col>

              <v-col cols="2" />
            </v-row>

            <draggable
              v-model="items"
              handle=".optionsList__dragHandle"
              ghost-class="ghost">
              <option-list-item
                v-for="item in items"
                :key="item.id"
                :loading="itemLoading"
                :item="item"
                :is-cascading="isCascading"
                :has-description="hasDescription"
                :language-mode="languageMode"
                :edit-mode="!!editedItem && editedItem === item.id"
                :edit-disabled="addingMode"
                :is-search-result="isSearchResult(item)"
                :has-default="hasDefault"
                :has-other="hasOther"
                :hide-item-status="hideItemStatus"
                :hide-item-drag="hideItemDrag"
                @edit-item="editItem"
                @save-item="saveItem"
                @cancel-edit="cancelEdit">
                <v-col cols="12" class="py-0">
                  <draggable
                    v-model="item.subitems"
                    class="optionsList__subItemsDraggable"
                    handle=".optionsList__dragHandle"
                    ghost-class="ghost"
                    @sort="sortSubItems(item)">
                    <option-list-item
                      v-for="subItem in item.subitems"
                      :key="subItem.id"
                      :loading="itemLoading"
                      :item="subItem"
                      :items="items"
                      :language-mode="languageMode"
                      :edit-mode="!!editedItem && editedItem === subItem.id"
                      :edit-disabled="addingMode"
                      :is-search-result="isSearchResult(subItem)"
                      is-sub-item
                      :item-name-label="subItemNameLabel"
                      :has-description="hasDescription"
                      @edit-item="editItem"
                      @save-item="(...args)=>saveSubItem(item, ...args)"
                      @cancel-edit="cancelEdit" />
                  </draggable>
                </v-col>

                <template #add>
                  <v-col cols="12" class="pb-6">
                    <option-list-new-item
                      v-if="isCascading"
                      is-sub-item
                      :items="items"
                      :has-description="hasDescription"
                      :add-mode="addingItemId === item.id"
                      :language-mode="languageMode"
                      :item-id="item.id"
                      :loading="itemLoading"
                      :add-sub-item-label="addSubItemLabel"
                      :item-name-label="subItemNameLabel"
                      @save="saveNewSubItem"
                      @add-mode="addSubItem"
                      @cancel="closeAddForms" />
                  </v-col>
                </template>
              </option-list-item>
            </draggable>

            <option-list-new-item
              v-if="addingMode"
              ref="addItem"
              :loading="itemLoading"
              :has-description="hasDescription"
              :language-mode="languageMode"
              @save="saveNewItem"
              @cancel="cancelNewItem"
              @add-mode="addItem" />
          </v-container>
        </v-col>
      </v-row>
    </v-container>

    <div v-else-if="error">
      {{ $t('system_management.lists.notFoundError') }}
    </div>
  </rc-page-content>
</template>

<script lang="ts">
import Vue from 'vue';
import draggable from 'vuedraggable';
import {
  RcTabs,
  RcTab,
  RcPageContent,
} from '@libs/component-lib/components';
import { IMultilingual } from '@libs/shared-lib/types';
import routes from '@/constants/routes';
import entityUtils from '@libs/entities-lib/utils';
import { SUPPORTED_LANGUAGES_INFO } from '@/constants/trans';
import {
  IOptionItem, OptionItem, ICreateOptionItemRequest, IOptionSubItem, EOptionLists,
} from '@libs/entities-lib/optionItem';
import { Status } from '@libs/entities-lib/base';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';
import { useOptionListStore } from '@/pinia/option-list/optionList';
import OptionListItem from './OptionListItem.vue';
import OptionListNewItem from './OptionListNewItem.vue';

export default Vue.extend({
  name: 'OptionList',

  components: {
    RcTabs,
    RcTab,
    draggable,
    RcPageContent,
    OptionListItem,
    OptionListNewItem,
  },

  props: {
    title: {
      type: String,
      required: true,
    },

    hideItemStatus: {
      type: Boolean,
      default: false,
    },

    hideItemDrag: {
      type: Boolean,
      default: false,
    },

    itemLabel: {
      type: String,
      default: 'system_management.lists.header.item',
    },

    subItemLabel: {
      type: String,
      default: 'system_management.lists.header.subItem',
    },

    subItemNameLabel: {
      type: String,
      default: 'system_management.lists.itemName',
    },

    showAddButton: {
      type: Boolean,
      default: true,
    },

    addSubItemLabel: {
      type: String,
      default: 'system_management.lists.addSubItem',
    },

    addButtonLabel: {
      type: String,
      default: 'common.add',
    },

    hasDescription: {
      type: Boolean,
      default: false,
    },

    isCascading: {
      type: Boolean,
      default: false,
    },

    embedded: {
      type: Boolean,
      default: false,
    },

    hasDefault: {
      type: Boolean,
      default: false,
    },

    hasOther: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      languageMode: 'en',
      addingMode: false,
      addingItemId: '',
      itemLoading: false,
      loadingTimeout: null,
      search: '',
      error: false,
      loading: true,
      editedItem: null,
    };
  },

  computed: {
    formattedTitle(): string {
      const title = this.$t(this.title);
      const count = this.embedded ? '' : ` (${this.items.length})`;
      return `${title}${count}`;
    },

    helpLink(): string {
      if (this.$route.name === routes.systemManagement.roles.name) {
        return this.$t('zendesk.help_link.manage_roles') as string;
      }

      return this.$t('zendesk.help_link.view_option_lists') as string;
    },

    items: {
      get(): OptionItem[] {
        let items = useOptionListStore().getItems();
        if (useOptionListStore().list === EOptionLists.Roles && !this.$hasFeature(FeatureKeys.L0Access)) {
          items = items?.filter((i) => i.name.translation.en !== 'Level 0');
        }
        return items;
      },

      set(value: IOptionItem[]) {
        this.sortItems(value);
      },
    },

    supportedLanguages() {
      return SUPPORTED_LANGUAGES_INFO;
    },

    highestRank(): number {
      if (this.items.length > 0) {
        const highestRankItem = this.items.reduce((prev, current) => ((prev.orderRank > current.orderRank) ? prev : current));
        return highestRankItem.orderRank;
      }
      return 0;
    },
  },

  async mounted() {
    await this.fetchItems();
  },

  methods: {
    /**
     * Fetch the list and its items from the API
     * @param isNewItem {boolean} Whether this method was called as a result of creating a new item
     */
    async fetchItems(isNewItem?: boolean) {
      if (!isNewItem) {
        this.loadingTimeout = setTimeout(() => {
          this.loading = true;
        }, 200);
      }

      try {
        await useOptionListStore().fetchItems();

        clearTimeout(this.loadingTimeout);
        this.loading = false;
        this.itemLoading = false;
      } catch (e) {
        this.$appInsights.trackException(e, {}, 'OptionList', 'fetchItems');
        clearTimeout(this.loadingTimeout);
        this.loading = false;
        this.error = true;
        return;
      }

      this.error = false;
    },

    /**
     * Highlights items that match the text input in the search bar
     * @param item The item to compare with the search value
     */
    isSearchResult(item: IOptionItem) {
      if (this.search) {
        return item.name.translation[this.languageMode].toLowerCase().indexOf(this.search.toLowerCase()) > -1;
      }

      return false;
    },

    /**
     * Handles saving a new item through the API
     * @param name The name of the new item. This value is put in both en and fr slots
     * @param description The description of the new item. This value is put in both en and fr slots
     * @param status The status of the item
     */
    async saveNewItem(name: IMultilingual, description: IMultilingual, status: Status) {
      if (!name || !status) {
        return;
      }

      const payload: ICreateOptionItemRequest = {
        name: entityUtils.getFilledMultilingualField(name),
        status,
        orderRank: this.highestRank + 1,
      };

      if (this.hasDescription) {
        if (!description) {
          return;
        }

        payload.description = entityUtils.getFilledMultilingualField(description);
      }

      this.itemLoading = true;

      try {
        await useOptionListStore().createOption(payload);
      } catch (e) {
        this.$appInsights.trackException(e, {}, 'OptionList', 'saveNewItem');
        this.itemLoading = false;
        return;
      }

      this.itemLoading = false;
      this.scrollToInput();
    },

    async saveNewSubItem(name: IMultilingual, description: IMultilingual, status: Status, itemId: string) {
      const subItems = this.items.find((i) => i.id === itemId).subitems;
      let highestRank = 0;

      if (subItems.length > 0) {
        highestRank = subItems.reduce((prev, current) => ((prev.orderRank > current.orderRank) ? prev : current)).orderRank;
      }

      const payload: ICreateOptionItemRequest = {
        name: entityUtils.getFilledMultilingualField(name),
        status,
        orderRank: highestRank + 1,
        description: entityUtils.getFilledMultilingualField(description),
      };

      this.itemLoading = true;

      try {
        await useOptionListStore().addSubItem(itemId, payload);
      } catch (e) {
        this.$appInsights.trackException(e, {}, 'OptionList', 'saveNewSubItem');
        this.itemLoading = false;
        return;
      }

      this.itemLoading = false;
      this.scrollToInput();
    },

    /**
     * Handles editing the item through the API
     * @param item The item to be modified
     * @param name The new name value. Sets the value for the currently selected language
     * @param description The new description value. Sets the value for the currently selected language
     */
    async saveItem(item: IOptionItem, name: IMultilingual, description: IMultilingual) {
      if (!item || !name) {
        return;
      }

      const payloadName = entityUtils.getFilledMultilingualField(name);
      const payloadDescription = this.hasDescription ? entityUtils.getFilledMultilingualField(description) : null;

      this.itemLoading = true;

      try {
        await useOptionListStore().updateItem({ id: item.id, name: payloadName, description: payloadDescription });
      } catch (e) {
        this.$appInsights.trackException(e, {}, 'OptionList', 'saveItem');
        this.itemLoading = false;
        return;
      }

      this.itemLoading = false;
      this.editedItem = null;
    },

    async saveSubItem(item: IOptionSubItem, subItem: IOptionSubItem, name: IMultilingual, description: IMultilingual) {
      if (!item || !name) {
        return;
      }

      const payloadName = entityUtils.getFilledMultilingualField(name);
      const payloadDescription = entityUtils.getFilledMultilingualField(description);

      this.itemLoading = true;

      try {
        await useOptionListStore().updateSubItem({
          itemId: item.id, subItemId: subItem.id, name: payloadName, description: payloadDescription,
        });

        this.editedItem = null;
      } finally {
        this.itemLoading = false;
      }
    },

    /**
     * Handles changing the order of items through the API
     */
    async sortItems(items: IOptionItem[]) {
      try {
        await useOptionListStore().updateOrderRanks(items);
      } catch (e) {
        this.$appInsights.trackException(e, {}, 'OptionList', 'sortItem');
        return;
      }

      this.$toasted.global.success(this.$t('system_management.lists.orderRankUpdated'));
    },

    /**
     * Handles changing the order of sub-items through the API
     * @param parentItem The parent item of the sub-items that are being sorted
     */
    async sortSubItems(parentItem: IOptionItem) {
      await useOptionListStore().updateSubItemOrderRanks(parentItem);

      this.$toasted.global.success(this.$t('system_management.lists.orderRankUpdated'));
    },

    /**
     * Toggle the language mode between English and French
     * @param language The language to set to, either 'en' or 'fr'
     */
    setLanguageMode(language: string) {
      this.languageMode = language;
    },

    /**
     * Scroll the view to the add item input and focus it
     */
    scrollToInput() {
      this.$vuetify.goTo('.optionsList__addItem', {
        duration: 400,
        container: '.pageContentCard__content',
        easing: 'easeInOutCubic',
      }).then(() => {
        if (this.$refs.addItem) {
          (this.$refs.addItem as HTMLInputElement).focus();
        }
      });
    },

    /**
     * Enable the add new item form when the + button is pressed.
     * Automatically scrolls to the form element and focuses it.
     */
    addItem() {
      this.editedItem = null;
      this.addingMode = true;
      this.addingItemId = '';

      this.$nextTick(() => {
        this.scrollToInput();
      });
    },

    addSubItem(addingItemId: string) {
      this.addingItemId = addingItemId;
    },

    /**
     * Triggered when the cancel button is pressed, hides the add new item form
     */
    cancelNewItem() {
      this.addingMode = false;
    },

    /**
     * Triggered when the pencil button is pushed on an item. Shows the edit form
     */
    editItem(item: IOptionItem) {
      this.editedItem = item.id;
    },

    /**
     * Handles canceling an edit for an item or sub-item
     */
    cancelEdit() {
      this.editedItem = null;
    },

    closeAddForms() {
      this.addingMode = false;
      this.addingItemId = '';
    },

    closeDialog() {
      this.closeAddForms();
      this.cancelNewItem();
      this.cancelEdit();
      this.$emit('close');
    },
  },
});
</script>

<style scoped lang="scss">
.optionsList__header {
  div.col {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  div.col:last-child {
    justify-content: flex-end;
  }
}

.optionsList__subItemsDraggable {
  width: 100%;
}

.ghost {
  background-color: var(--v-primary-lighten2)!important;
}

.flex-parent {
  display: flex;
  flex-direction: column;
}

.scroller {
  flex: 1;
  overflow-y: auto;
}
</style>
