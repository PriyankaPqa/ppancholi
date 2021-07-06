<template>
  <rc-page-content
    :title="title"
    outer-scroll
    show-search
    show-add-button
    add-button-data-test="caseNote__createBtn"
    show-help
    content-padding="6"
    actions-padding="2"
    :help-link="$t('caseNote.help_link')"
    @search="search"
    @add-button="isBeingCreated = true">
    <rc-page-loading v-if="loading" />
    <template v-else>
      <div class="caseNote__filter">
        <v-toolbar elevation="1" color="grey lighten-5" />
      </div>

      <case-note-form
        v-if="isBeingCreated"
        :action-title="$t('caseNote.create.rowTitle')"
        @close-case-note-form="isBeingCreated = false"
        @add-case-note-id="addNewCaseNoteId($event)" />

      <case-file-list-wrapper :loading="loading" :empty="caseNotes.length === 0">
        <case-notes-list-item
          v-for="item in caseNotes"
          :key="item.id"
          :item="item"
          @setIsEdit="isBeingEdited = $event"
          @pin-case-note="pinCaseNote"
          @saved="onSaved($event)" />
      </case-file-list-wrapper>
    </template>

    <template v-if="!loading" #actions>
      <v-data-footer v-if="false" :options.sync="options" :pagination.sync="pagination" :items-per-page-options="[5, 10, 15, 20]" />
    </template>

    <rc-confirmation-dialog
      ref="confirmLeavePopup"
      :show.sync="showExitConfirmation"
      :title="titleLeave"
      :messages="messagesLeave" />
  </rc-page-content>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcPageContent, RcPageLoading, RcConfirmationDialog } from '@crctech/component-library';
import { FilterKey } from '@/entities/user-account';
import { ICaseNoteCombined } from '@/entities/case-note';
import _orderBy from 'lodash/orderBy';
import { NavigationGuardNext, Route } from 'vue-router';
import { TranslateResult } from 'vue-i18n';
import { ConfirmationDialog } from '@/types';
import * as searchEndpoints from '@/constants/searchEndpoints';
import CaseNoteForm from './components/CaseNoteForm.vue';
import CaseNotesListItem from './components/CaseNotesListItem.vue';
import CaseFileListWrapper from '../components/CaseFileListWrapper.vue';

export default Vue.extend({
  name: 'CaseNote',
  components: {
    RcPageContent,
    RcPageLoading,
    CaseNoteForm,
    CaseFileListWrapper,
    CaseNotesListItem,
    RcConfirmationDialog,
  },

  async beforeRouteLeave(to: Route, from: Route, next: NavigationGuardNext) {
    if (this.isBeingCreated || this.isBeingEdited) {
      const leavingConfirmed = await (this.$refs.confirmLeavePopup as ConfirmationDialog).open();
      if (leavingConfirmed) {
        next();
      }
    } else {
      next();
    }
  },

  data() {
    return {
      caseNoteIds: [] as string[],
      isBeingCreated: false,
      isBeingEdited: false,
      FilterKey,
      totalCount: 0,
      options: {
        page: 1,
        itemsPerPage: 10,
      },
      searchTimeout: null,
      showExitConfirmation: false,
      params: {
        filter: {
          'Entity/CaseFileId': this.$route.params.id,
        },
        search: '',
        orderBy: 'Entity/IsPinned desc, Entity/Created desc',
        count: true,
      },
    };
  },
  computed: {
    caseNotes(): ICaseNoteCombined[] {
      const caseNotes = this.$storage.caseNote.getters.getByIds(this.caseNoteIds);
      return _orderBy(caseNotes, ['entity.isPinned', 'entity.created'], ['desc', 'desc']);
    },

    title(): string {
      return `${this.$t('caseNote.caseNotes')} (${this.totalCount})`;
    },
    filterOptions(): Array<Record<string, unknown>> {
      return [];
    },
    pagination(): Record<string, number> {
      return { };
    },
    loading(): boolean {
      return this.$store.state.caseNoteEntities.isLoadingCaseNotes;
    },
    titleLeave(): TranslateResult {
      return this.$t('confirmLeaveDialog.title');
    },
    messagesLeave(): Array<TranslateResult> {
      return [
        this.$t('confirmLeaveDialog.message_1'),
        this.$t('confirmLeaveDialog.message_2'),
      ];
    },
  },

  async created() {
    await this.$storage.caseNote.actions.fetchCaseNoteCategories();
    await this.searchCaseNotes();
  },

  methods: {
    addNewCaseNoteId(id: string) {
      this.caseNoteIds.unshift(id);
    },

    onSaved() {
      // TODO
    },

    search(keyword: string) {
      this.params.search = keyword || '';
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => this.searchCaseNotes(), 500);
    },

    async searchCaseNotes() {
      const res = await this.$storage.caseNote.actions.search(this.params, searchEndpoints.CASE_NOTES);
      if (res) {
        this.caseNoteIds = res.ids;
        this.totalCount = res.count;
      }
    },

    async pinCaseNote(caseNote: ICaseNoteCombined) {
      try {
        await this.$storage.caseNote.actions.pinCaseNote(this.$route.params.id, caseNote.entity.id, !caseNote.entity.isPinned);
        // Since back end search has a delay, update case note and sort case note list locally
        caseNote.entity.isPinned = !caseNote.entity.isPinned;
      // eslint-disable-next-line no-empty
      } catch (e) {}
    },
  },
});
</script>

<style scoped lang="scss">
.caseNote__filter {
  margin: -24px;
  margin-bottom: 16px;
}
</style>
