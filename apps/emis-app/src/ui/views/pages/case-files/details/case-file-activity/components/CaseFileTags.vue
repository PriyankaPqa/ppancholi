<template>
  <v-row class="no-gutters">
    <div v-for="tag in existingTags" :key="tag.id">
      <v-chip
        v-if="readonly"
        :data-test="`caseFileTags-chip-${tag.id}`"
        class="chip mr-3 mb-1"
        color="primary">
        {{ $m(tag.name) }}
      </v-chip>

      <rc-tooltip v-else bottom>
        <template #activator="{ on }">
          <v-chip
            :data-test="`caseFileTags-chip-${tag.id}`"
            class="chip mr-3 mb-1"
            color="primary"
            :close="!readonly"
            v-on="on"
            @click:close="initDeleteTag(tag)">
            {{ $m(tag.name) }}
          </v-chip>
        </template>
        {{ $t('caseFile.tags.removeTag') }}
      </rc-tooltip>
    </div>

    <v-btn
      v-if="!readonly"
      class="fw-bold"
      text
      small
      data-test="caseFile-add-tags-btn"
      @click="initAddTag()">
      <v-icon small>
        mdi-plus
      </v-icon>
      {{ $t('caseFile.tags.AddTag') }}
    </v-btn>

    <rc-dialog
      v-if="showAddTagsDialog"
      data-test="caseFileTags-add-tag-dialog"
      :title="$t('caseFile.tags.AddTag')"
      :cancel-action-label="$t('common.cancel')"
      :submit-action-label="$t('caseFile.tags.AddSelected')"
      :show.sync="showAddTagsDialog"
      :content-only-scrolling="true"
      :persistent="true"
      :max-width="750"
      :min-height="480"
      :submit-button-disabled="addButtonDisabled"
      @cancel="showAddTagsDialog = false;"
      @close="showAddTagsDialog = false;"
      @submit="submitAddTags()">
      <div data-test="caseFileTags-addTagsDialog-content" class="px-2">
        <p class="rc-body14 my-2">
          {{ $t('caseFile.tags.Instruction') }}
        </p>
        <v-list flat aria-busy="true">
          <v-list-item-group
            :value="listTags.filter(t=> t.selected || t.existing)"
            multiple
            :aria-label="$t('caseFile.tags.AddTag')"
            aria-busy="true"
            @change="onSelectTag($event)">
            <template v-for="(tag, i) in listTags.filter(t => t.active || t.existing)">
              <v-list-item
                :key="tag.id"
                dense
                :value="tag"
                :data-test="`checkbox-item-${tag.id}`"
                :active-class="getActiveItemClass(tag)"
                :disabled="tag.existing">
                <template #default="{ active }">
                  <v-list-item-action>
                    <v-icon :color="getCheckboxColor(tag)">
                      {{ (tag.selected || active) ? 'mdi-checkbox-marked' : 'mdi-checkbox-blank-outline' }}
                    </v-icon>
                  </v-list-item-action>

                  <v-list-item-content>
                    <v-list-item-title class="rc-body14 fw-bold">
                      {{ $m(tag.name) }}
                    </v-list-item-title>
                  </v-list-item-content>
                </template>
              </v-list-item>

              <v-divider :key="`tag.key-${i}`" />
            </template>
          </v-list-item-group>
        </v-list>
      </div>
    </rc-dialog>

    <rc-confirmation-dialog
      v-if="showDeleteTagDialog"
      data-test="caseFileActivity-delete-tag-dialog"
      :show.sync="showDeleteTagDialog"
      :title="deleteTagDialogTitle"
      :messages="$t('caseFile.tags.confirmRemove')"
      :loading="isSubmitting"
      @submit="submitDeleteTag()"
      @cancel="closeDeleteDialog()"
      @close="closeDeleteDialog()" />
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcDialog, RcConfirmationDialog, RcTooltip } from '@libs/component-lib/components';

import {
  IOptionItem,
} from '@libs/entities-lib/optionItem';
import { IListOption, IIdMultilingualName, Status } from '@libs/shared-lib/types';

import { useCaseFileStore } from '@/pinia/case-file/case-file';

interface IListTag extends IIdMultilingualName {
  existing: boolean;
  selected: boolean;
  active: boolean;
}

export default Vue.extend({
  name: 'CaseFileTags',

  components: {
    RcDialog,
    RcConfirmationDialog,
    RcTooltip,
  },
  props: {
    tags: {
      type: Array as ()=> IIdMultilingualName[],
      required: true,
    },
    caseFileId: {
      type: String,
      required: true,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      existingTags: [] as IIdMultilingualName[],
      listTags: [] as IListTag[],
      tagToDelete: null as IIdMultilingualName,
      showAddTagsDialog: false,
      showDeleteTagDialog: false,
      isSubmitting: false,
      isLoadingTags: false,
    };
  },

  computed: {
    addButtonDisabled(): boolean {
      return !this.listTags.some((t) => t.selected);
    },

    deleteTagDialogTitle(): string {
      if (!this.tagToDelete) {
        return '';
      }
      return `${this.$t('caseFile.tags.removeTag')} "${this.$m(this.tagToDelete.name)}"`;
    },

    remainingTags(): IIdMultilingualName[] {
      if (this.tagToDelete) {
        return this.existingTags.filter((t) => t.id !== this.tagToDelete.id);
      }
      return this.existingTags;
    },

    allTags(): IOptionItem[] {
      const existingIds = this.existingTags.map((t) => t.id);
      return useCaseFileStore().getTagsOptions(true, existingIds);
    },

  },

  created() {
    this.existingTags = this.tags ? [...this.tags] : [];
  },

  methods: {
    getActiveItemClass(tag: IListTag): string {
      return tag.existing ? 'existingTag' : 'tagToAdd';
    },

    getCheckboxColor(tag: IListTag): string {
      if (tag.existing) {
        return 'grey lighten-3';
      }
        return tag.selected ? 'primary' : 'grey darken-1';
    },

    async initAddTag() {
      this.isLoadingTags = true;
      try {
        // Build the tag list that will be used to display the tags available for selection in the add modal
        this.makeInitialListTags();
        this.showAddTagsDialog = true;
      } finally {
        this.isLoadingTags = false;
      }
    },

    makeInitialListTags() {
      this.listTags = this.allTags.map((tag: IOptionItem): IListTag => ({
        id: tag.id,
        name: tag.name,
        existing: !!this.existingTags.find((t) => t.id === tag.id),
        selected: false,
        active: tag.status === Status.Active,
      }));
    },

    initDeleteTag(tag: IIdMultilingualName) {
      this.tagToDelete = tag;
      this.showDeleteTagDialog = true;
    },

    closeDeleteDialog() {
      this.showDeleteTagDialog = false;
      this.tagToDelete = null;
    },

    onSelectTag(tags: IListTag[]) {
      // From all the tags returned, keep the ids of all the items that have been currently selected by the user
      const newItemsIds = tags.reduce((ids, t) => {
        if (!t.existing) {
          ids.push(t.id);
        }
        return ids;
      }, []);

      // Mark as selected the listTags whose ids are in the items that have been currently selected by the user
      this.listTags.map((tag:IListTag):IListTag => {
        if (newItemsIds.includes(tag.id)) {
          tag.selected = true;
        } else {
          tag.selected = false;
        }
        return tag;
      });
    },

    async submitAddTags() {
      this.isSubmitting = true;

      const tabsToSubmit : IIdMultilingualName[] = this.listTags.filter((t) => t.selected || t.existing);
      const payload: IListOption[] = this.makePayload(tabsToSubmit);

      try {
        const res = await useCaseFileStore().setCaseFileTags(this.caseFileId, payload);
        if (res) {
          // Update the tags displayed on the page only after the patch call was successful
          this.updateExistingTagsAfterAdd();
        }
      } finally {
        this.isSubmitting = false;
        this.showAddTagsDialog = false;
      }
    },

    async submitDeleteTag() {
      this.isSubmitting = true;
      const payload = this.makePayload(this.remainingTags);

      try {
        const res = await useCaseFileStore().setCaseFileTags(this.caseFileId, payload);
        if (res) {
          // Update the tags displayed on the page only after the patch call was successful
          this.existingTags = this.remainingTags;
        }
      } finally {
        this.isSubmitting = false;
        this.tagToDelete = null;
        this.showDeleteTagDialog = false;
      }
    },

    makePayload(tags: IIdMultilingualName[]): IListOption[] {
      if (!tags) {
        return [];
      }
      return tags.map((tag) => ({
        optionItemId: tag.id,
        specifiedOther: null,
      }));
    },

    updateExistingTagsAfterAdd() {
      // Recreating the existing tags list instead of pushing the added tags to the existing ones allows the proper ordering of the displayed case files
      this.existingTags = this.listTags
        .filter((t) => t.selected || t.existing)
        .map((tag: IListTag): IIdMultilingualName => {
        // Remove the fields 'selected' and 'existing' from the list tag before setting them as existing case files to be displayed
          const {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            selected, existing, active, ...caseFileTag
          } = tag;
          return caseFileTag;
        });
    },
  },
});
</script>

<style scoped lang="scss">
.chip {
  height: 25px;
  border-width: 2px;
}
.addTagDialogContainer {
  width: 100%;
}
.existingTag {
  background-color: white;
}
.tagToAdd {
  background-color: var(--v-primary-lighten2);
}
</style>
