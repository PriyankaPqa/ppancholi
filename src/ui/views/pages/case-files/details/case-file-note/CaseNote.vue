<template>
  <rc-page-content
    :title="title"
    outer-scroll
    show-search
    :show-add-button="showAddButton"
    add-button-data-test="caseNote__createBtn"
    show-help
    content-padding="6"
    actions-padding="2"
    :help-link="$t('caseNote.help_link')"
    @search="search"
    @add-button="isBeingCreated = true">
    <rc-page-loading v-if="loading" />
    <template v-else>
      <filter-toolbar class="caseNote__filter" :filter-options="[]" :count="totalCount" :filter-key="filterKey">
        <template #toolbarActions>
          <div class="flex-row">
            <span
              class="rc-body14 mr-4 noselect pointer"
              data-test="caseNote__sortBtn"
              @keydown="dateSortDesc = !dateSortDesc"
              @click="dateSortDesc = !dateSortDesc">
              {{ $t('caseNote.sortByDate') }}
              <v-icon>{{ dateSortDesc ? 'mdi-menu-down' : ' mdi-menu-up' }}</v-icon>
            </span>
          </div>
        </template>
      </filter-toolbar>

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
  </rc-page-content>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcPageContent, RcPageLoading } from '@crctech/component-library';
import _orderBy from 'lodash/orderBy';
import { NavigationGuardNext, Route } from 'vue-router';
import { TranslateResult } from 'vue-i18n';
import { FilterKey } from '@/entities/user-account';
import FilterToolbar from '@/ui/shared-components/FilterToolbar.vue';
import { ICaseNoteCombined } from '@/entities/case-note';
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
    FilterToolbar,
  },

  async beforeRouteLeave(to: Route, from: Route, next: NavigationGuardNext) {
    if (this.isBeingCreated || this.isBeingEdited) {
      const leavingConfirmed = await this.$confirm(this.titleLeave, this.messagesLeave);
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
      filterKey: FilterKey.CaseNotes,
      totalCount: 0,
      dateSortDesc: true,
      options: {
        page: 1,
        itemsPerPage: 10,
      },
      searchTimeout: null,
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
    showAddButton(): boolean {
      return this.$hasLevel('level1') || this.$hasRole('contributorFinance') || this.$hasRole('contributor3');
    },

    caseNotes(): ICaseNoteCombined[] {
      const caseNotes = this.$storage.caseNote.getters.getByIds(this.caseNoteIds);
      const orderbyDate = this.dateSortDesc ? 'desc' : 'asc';
      return _orderBy(caseNotes, ['entity.isPinned', 'entity.created'], ['desc', orderbyDate]);
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

  watch: {
    dateSortDesc(desc: boolean) {
      this.params.orderBy = `Entity/IsPinned desc, Entity/Created${desc ? ' desc' : ''}`;
      this.searchCaseNotes();
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
