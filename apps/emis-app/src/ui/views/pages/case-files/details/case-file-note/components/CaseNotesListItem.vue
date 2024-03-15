<template>
  <div>
    <case-note-form
      v-if="isEdit"
      :case-note="item"
      :action-title="$t('caseNote.edit.rowTitle')"
      is-edit
      @close-case-note-form="closeCaseNoteEdit()" />
    <case-file-list-item-wrapper v-else :item="item" :show-menu="canEditCaseNote" is-case-note>
      <template slot="content">
        <div class="mb-2">
          <div class="rc-body16 fw-bold" data-test="caseNotes__subject">
            {{ item.subject }}
          </div>
        </div>

        <div class="caseNote__categoryRow">
          <span class="category rc-caption12" data-test="caseNotes__category">
            {{ categoryName }}
          </span>
        </div>

        <pre
          ref="description"
          :class="[{ 'caseNote__description--more': true }, 'caseNote__description', 'rc-body14', 'pr-4']"
          data-test="caseNotes__description">
            {{ item.description }}
          </pre>
      </template>

      <template slot="menu">
        <v-list-item v-if="canEditCaseNote" data-test="items__editButton" @click="editCaseNote()">
          <v-list-item-title>{{ $t('caseFileItem.edit') }}</v-list-item-title>
        </v-list-item>

        <!--        <v-list-item data-test="items__pinButton" @click="emitPinEvent()">-->
        <!--          <v-list-item-title v-if="item.isPinned">-->
        <!--            {{ $t('caseFileItem.unpinItem') }}-->
        <!--          </v-list-item-title>-->

        <!--          <v-list-item-title v-else>-->
        <!--            {{ $t('caseFileItem.pinItem') }}-->
        <!--          </v-list-item-title>-->
        <!--        </v-list-item>-->
      </template>
    </case-file-list-item-wrapper>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { ICaseNoteEntity } from '@libs/entities-lib/case-note';
import { IOptionItem } from '@libs/entities-lib/optionItem';
import { useCaseNoteStore } from '@/pinia/case-note/case-note';
import { UserRoles } from '@libs/entities-lib/user';
import CaseFileListItemWrapper from '../../components/CaseFileListItemWrapper.vue';
import CaseNoteForm from './CaseNoteForm.vue';

/**
 * Renders a single case note, with controls to edit, translate, and pin the note.
 */
export default Vue.extend({
  name: 'CaseNotesListItem',
  components: {
    CaseFileListItemWrapper,
    CaseNoteForm,
  },
  props: {
    item: {
      type: Object as () => ICaseNoteEntity,
      required: true,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      isEdit: false,
    };
  },

  computed: {
    canEditCaseNote(): boolean {
      return this.$hasLevel(UserRoles.level4) && !this.readonly;
    },

    caseNoteCategories(): IOptionItem[] {
      return useCaseNoteStore().getCaseNoteCategories();
    },

    categoryName(): string {
      const category = this.caseNoteCategories.find((c) => c.id === this.item.category?.optionItemId);
      if (category) {
        return this.$m(category.name);
      }
      return '';
    },
  },

  methods: {
    editCaseNote() {
      this.isEdit = true;
      this.$emit('setIsEdit', true);
    },

    closeCaseNoteEdit() {
      this.isEdit = false;
      this.$emit('setIsEdit', false);
    },

    emitPinEvent() {
      this.$emit('pin-case-note', this.item);
    },
  },
});
</script>

<style scoped lang="scss">
.caseNote__categoryRow {
  display: flex;
  flex: 1;
  width: 100%;
  justify-content: flex-start;
  flex-wrap: wrap;
  margin-bottom: 8px;

  .category {
    background: var(--v-primary-lighten2);
    color: var(--v-primary-darken-1);
    margin: 4px 8px 4px 0;
    border-radius: 4px;
    padding: 1px 4px;
    display: inline-block;
  }
}

.caseNote__description {
  max-height: 95px;
  overflow: hidden;
  white-space: pre-line;
}

.caseNote__description--more {
  max-height: none;
}
</style>
