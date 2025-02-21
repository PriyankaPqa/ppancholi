<template>
  <rc-page-content
    :title="title"
    outer-scroll
    show-search
    :show-add-button="showAddButton"
    :add-button-label="$t('caseNote.create.rowTitle')"
    add-button-data-test="caseNote__createBtn"
    :show-help="false"
    content-padding="6"
    actions-padding="2"
    :help-link="$t('caseNote.help_link')"
    @search="debounceSearch"
    @add-button="isBeingCreated = true">
    <rc-page-loading v-if="loading" />
    <validation-observer v-else ref="observer" slim>
      <filter-toolbar
        class="caseNote__filter"
        :filter-key="filterKey"
        :filter-options="filterOptions"
        :initial-filter="filterState"
        :count="itemsCount"
        add-filter-label="caseNote.filter"
        @update:appliedFilter="onApplyFilter">
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
        @close-case-note-form="isBeingCreated = false" />

      <case-file-list-wrapper :loading="loading" :empty="caseNotes.length === 0">
        <case-notes-list-item
          v-for="item in caseNotes"
          :key="item.id"
          :item="item"
          :readonly="readonly"
          @setIsEdit="isBeingEdited = $event"
          @pin-case-note="pinCaseNote" />
      </case-file-list-wrapper>
    </validation-observer>
  </rc-page-content>
</template>

<script lang="ts">
import mixins from 'vue-typed-mixins';
import { RcPageContent, RcPageLoading } from '@libs/component-lib/components';
import { NavigationGuardNext, Route } from 'vue-router';
import { TranslateResult } from 'vue-i18n';
import _isEmpty from 'lodash/isEmpty';
import _debounce from 'lodash/debounce';
import { EFilterKeyType, EFilterType, IFilterSettings } from '@libs/component-lib/types';
import { FilterKey } from '@libs/entities-lib/user-account';
import FilterToolbar from '@/ui/shared-components/FilterToolbar.vue';
import { ICaseNoteEntity } from '@libs/entities-lib/case-note';
import TablePaginationSearchMixin from '@/ui/mixins/tablePaginationSearch';
import { ISearchParams, VForm } from '@libs/shared-lib/types';
import { IOptionItem } from '@libs/entities-lib/optionItem';
import { useCaseNoteStore } from '@/pinia/case-note/case-note';
import { useUserAccountStore } from '@/pinia/user-account/user-account';
import { UserRoles } from '@libs/entities-lib/user';
import CaseNoteForm from './components/CaseNoteForm.vue';
import CaseNotesListItem from './components/CaseNotesListItem.vue';
import CaseFileListWrapper from '../components/CaseFileListWrapper.vue';
import caseFileDetail from '../caseFileDetail';

export default mixins(TablePaginationSearchMixin, caseFileDetail).extend({
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
    if ((this.$refs.observer as VForm).flags.changed) { // add or edit case note
      const leavingConfirmed = await this.$confirm({
        title: this.titleLeave,
        messages: this.messagesLeave,
      });

      if (leavingConfirmed) {
        next();
      }
    } else {
      next();
    }
  },

  data() {
    return {
      isBeingCreated: false,
      isBeingEdited: false,
      filterKey: FilterKey.CaseNotes,
      dateSortDesc: true,
      dataTableParams: {
        search: '',
        orderBy: 'Entity/Created',
        descending: true,
        pageIndex: 1,
        pageSize: 1000,
      },
    };
  },

  computed: {
    showAddButton(): boolean {
      return (this.$hasLevel(UserRoles.level0) || this.$hasRole(UserRoles.contributorFinance) || this.$hasRole(UserRoles.contributor3))
        && !this.readonly;
    },

    caseNotes(): ICaseNoteEntity[] {
      return useCaseNoteStore().getByIdsWithPinnedItems(
        this.searchResultIds,
        { baseDate: this.searchExecutionDate, parentId: { caseFileId: this.caseFileId } },
      );
    },

    title(): string {
      // eslint-disable-next-line no-nested-ternary
      return `${this.$t('caseNote.caseNotes')} (${this.loading ? '...' : this.caseNotes ? this.caseNotes.length : 0})`;
    },

    filterOptions(): Array<IFilterSettings> {
      return [
        {
          key: `Metadata/CaseNoteCategoryName/Translation/${this.$i18n.locale}`,
          type: EFilterType.MultiSelect,
          label: this.$t('caseNote.category') as string,
          items: useCaseNoteStore().getCaseNoteCategories().map((c: IOptionItem) => ({ text: this.$m(c.name), value: this.$m(c.name) })),
        },
        {
          key: 'Entity/Created',
          type: EFilterType.Date,
          label: this.$t('caseNote.createdDate') as string,
        },
      ];
    },

    loading(): boolean {
      return useCaseNoteStore().searchLoading;
    },

    titleLeave(): TranslateResult {
      return this.$t('confirmLeaveDialog.title');
    },

    messagesLeave(): Array<TranslateResult> {
      return [this.$t('confirmLeaveDialog.message_1'), this.$t('confirmLeaveDialog.message_2')];
    },
  },

  watch: {
    async dateSortDesc(desc: boolean) {
      this.dataTableParams.descending = desc;
      await this.search(this.dataTableParams);
    },
  },

  async created() {
    await useUserAccountStore().fetchRoles();
    await useCaseNoteStore().fetchCaseNoteCategories();
    await this.search(this.dataTableParams);
  },

  methods: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    debounceSearch: _debounce(function func(this:any, keyword: string) {
      this.dataTableParams.search = keyword || '';
      this.search(this.dataTableParams);
    }, 500),

    async fetchData(params: ISearchParams) {
      const filter = _isEmpty(params?.filter) ? {} : params.filter;
      const res = await useCaseNoteStore().search({ params:
        {
          ...params,
          filter: { ...(filter as Record<string, unknown>), 'Entity/CaseFileId': { value: this.caseFileId, type: EFilterKeyType.Guid } },
          count: true,
        },
        includeInactiveItems: true });

      return res;
    },

    async pinCaseNote(caseNote: ICaseNoteEntity) {
      await useCaseNoteStore().pinCaseNote({ caseFileId: this.caseFileId, caseNoteId: caseNote.id, isPinned: !caseNote.isPinned });
      // Since back end search has a delay, update case note and sort case note list locally
      caseNote.isPinned = !caseNote.isPinned;
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
