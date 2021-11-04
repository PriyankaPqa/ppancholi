<template>
  <v-row class="no-gutters">
    <rc-tooltip v-for="tag in existingTags" :key="tag.id" bottom>
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
        <v-list flat>
          <v-list-item-group
            :value="listTags.filter(t=> t.selected || t.existing)"
            multiple
            @change="onSelectTag($event)">
            <template v-for="(tag, i) in listTags.filter(t => t.active)">
              <v-list-item
                :key="tag.id"
                dense
                :value="tag"
                :data-test="`checkbox-item-${tag.id}`"
                :active-class="getActiveItemClass(tag)"
                :disabled="tag.existing">
                <template #default="{ active }">
                  <v-list-item-action>
                    <v-checkbox :input-value="active" :true-value="tag" :color="getCheckboxColor(tag)" />
                  </v-list-item-action>

                  <v-list-item-content>
                    <v-list-item-title class="rc-body14 fw-bold" v-text="$m(tag.name)" />
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
import { RcDialog, RcConfirmationDialog, RcTooltip } from '@crctech/component-library';

import {
  IOptionItem,
} from '@/entities/optionItem';
import { IListOption, IIdMultilingualName } from '@/types';

import { Status } from '@/entities/base';

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
      initialInactiveTags: [] as IIdMultilingualName[],
    };
  },

  computed: {
    addButtonDisabled(): boolean {
      return !this.listTags.some((t) => t.selected);
    },

    deleteTagDialogTitle(): string {
      if (!this.tagToDelete) return '';
      return `${this.$t('caseFile.tags.removeTag')} "${this.$m(this.tagToDelete.name)}"`;
    },

    remainingTags(): IIdMultilingualName[] {
      if (this.tagToDelete) {
        return this.existingTags.filter((t) => t.id !== this.tagToDelete.id);
      }
      return this.existingTags;
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
      return tag.existing ? 'grey lighten-3' : 'primary';
    },

    async initAddTag() {
      this.isLoadingTags = true;
      try {
        // Fetch the list of all available tags as option items (active and inactive)
        const tagsOptions: IOptionItem[] = await this.$storage.caseFile.actions.fetchTagsOptions();
        // Build the tag list that will be used to display the tags available for selection in the add modal
        this.makeInitialListTags(tagsOptions);
        this.showAddTagsDialog = true;
      } finally {
        this.isLoadingTags = false;
      }
    },

    makeInitialListTags(tagsOptions: IOptionItem[]) {
      this.listTags = tagsOptions.map((tag: IOptionItem): IListTag => ({
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
        if (!t.existing) { ids.push(t.id); }
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
        const res = await this.$storage.caseFile.actions.setCaseFileTags(this.caseFileId, payload);
        if (res) {
          // Update the tags displayed on the page only after the patch call was successful
          this.updateExistingTagsAfterAdd();
          this.$emit('updateActivities');
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
        const res = await this.$storage.caseFile.actions.setCaseFileTags(this.caseFileId, payload);
        if (res) {
          // Update the tags displayed on the page only after the patch call was successful
          this.existingTags = this.remainingTags;
          this.$emit('updateActivities');
        }
      } finally {
        this.isSubmitting = false;
        this.tagToDelete = null;
        this.showDeleteTagDialog = false;
      }
    },

    makePayload(tags: IIdMultilingualName[]): IListOption[] {
      if (!tags) return [];
      return tags.map((tag) => ({
        optionItemId: tag.id,
        specifiedOther: null,
      }));
    },

    updateExistingTagsAfterAdd() {
      const caseFileTags = this.listTags
        .filter((t) => t.selected || t.existing)
        .map((tag: IListTag): IIdMultilingualName => {
        // Remove the fields 'selected' and 'existing' from the list tag before setting them as existing case files to be displayed
          const {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            selected, existing, active, ...caseFileTag
          } = tag;
          return caseFileTag;
        });

      // Recreating the exising tags list instead of pushing the added tags to the exising ones allows the proper ordering of the displayed case files
      this.existingTags = caseFileTags.concat(this.initialInactiveTags);
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
