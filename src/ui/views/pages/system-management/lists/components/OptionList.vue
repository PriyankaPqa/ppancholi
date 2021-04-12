<template>
  <rc-page-content
    :title="formattedTitle"
    :help-link="helpLink"
    :show-add-button="showAddButton"
    :show-help="!embedded"
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

          <v-container class="scroller" fluid>
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
                @change-status="changeItemStatus"
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
                      :language-mode="languageMode"
                      :edit-mode="!!editedItem && editedItem.id === subItem.id"
                      :edit-disabled="addingMode"
                      :is-search-result="isSearchResult(subItem)"
                      is-sub-item
                      :has-description="hasDescription"
                      @edit-item="editItem"
                      @save-item="saveSubItem"
                      @change-status="changeSubItemStatus"
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
} from '@crctech/component-library';
import { IMultilingual } from '@/types';
import routes from '@/constants/routes';
import entityUtils from '@/entities/utils';
import { SUPPORTED_LANGUAGES_INFO } from '@/constants/trans';
import {
  IOptionItem, OptionItem, EOptionListItemStatus, ICreateOptionItemRequest,
} from '@/entities/optionItem';
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
      loading: false,
      editedItem: null,
    };
  },

  computed: {
    formattedTitle(): string {
      return `${this.$t(this.title)} (${this.items.length})`;
    },

    helpLink(): string {
      if (this.$route.name === routes.systemManagement.roles.name) {
        return this.$t('zendesk.help_link.manage_roles') as string;
      }

      return this.$t('zendesk.help_link.view_option_lists') as string;
    },

    items: {
      get(): OptionItem[] {
        return this.$storage.optionList.getters.items();
      },

      set(value: IOptionItem[]) {
        this.sortItems(value);
      },
    },

    supportedLanguages() {
      return SUPPORTED_LANGUAGES_INFO;
    },

    highestRank(): number {
      const highestRankItem = this.items.reduce((prev, current) => ((prev.orderRank > current.orderRank) ? prev : current));
      return highestRankItem.orderRank;
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
        await this.$storage.optionList.actions.fetchItems();

        clearTimeout(this.loadingTimeout);
        this.loading = false;
        this.itemLoading = false;
      } catch (e) {
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
    async saveNewItem(name: IMultilingual, description: IMultilingual, status: EOptionListItemStatus) {
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
        await this.$storage.optionList.actions.createOption(payload);
      } catch {
        this.itemLoading = false;
        return;
      }

      this.itemLoading = false;
      this.scrollToInput();
    },

    async saveNewSubItem(name: IMultilingual, description: IMultilingual, status: EOptionListItemStatus, itemId: string) {
      const subItems = this.items.find((i) => i.id === itemId).subitems;
      const highestRank = subItems.reduce((prev, current) => ((prev.orderRank > current.orderRank) ? prev : current)).orderRank;

      const payload: ICreateOptionItemRequest = {
        name: entityUtils.getFilledMultilingualField(name),
        status,
        orderRank: highestRank + 1,
        description: entityUtils.getFilledMultilingualField(description),
      };

      this.itemLoading = true;

      try {
        await this.$storage.optionList.actions.addSubItem(itemId, payload);
      } catch {
        this.itemLoading = false;
        return;
      }

      this.itemLoading = false;
      this.scrollToInput();
    },

    /**
     * Handles editing the name of the item through the API
     * @param item The item to be modified
     * @param name The new name value. Sets the value for the currently selected language
     */
    async saveItem(item: IOptionItem, name: IMultilingual) {
      if (!item || !name) {
        return;
      }

      const payloadName = entityUtils.getFilledMultilingualField(name);

      this.itemLoading = true;

      try {
        await this.$storage.optionList.actions.updateName(item.id, payloadName);
      } catch (e) {
        this.itemLoading = false;
        return;
      }

      this.itemLoading = false;
      this.editedItem = null;
    },

    async saveSubItem() {
      // TODO 418
    },

    /**
     * Handles changing the status of an item through the API
     * @param item The item to be modified
     * @param status The new status to set
     */
    async changeItemStatus(item: IOptionItem, status: EOptionListItemStatus) {
      if (!item || !status) {
        return;
      }

      try {
        await this.$storage.optionList.actions.updateStatus(item.id, status);
      } catch {
        return;
      }

      this.editedItem = null;
    },

    async changeSubItemStatus() {
      // TODO 418
    },

    /**
     * Handles changing the order of items through the API
     */
    async sortItems(items: IOptionItem[]) {
      try {
        await this.$storage.optionList.actions.updateOrderRanks(items);
      } catch (e) {
        return;
      }

      this.$toasted.global.success(this.$t('system_management.lists.orderRankUpdated'));
    },

    /**
     * Handles changing the order of sub-items through the API
     * @param parentItem The parent item of the sub-items that are being sorted
     */
    async sortSubItems() {
      // TODO 418
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
