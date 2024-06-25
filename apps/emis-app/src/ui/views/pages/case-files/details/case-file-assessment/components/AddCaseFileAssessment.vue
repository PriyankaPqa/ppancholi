<template>
  <rc-dialog
    :title="$t('assessmentTemplate.add_assessment')"
    :cancel-action-label="$t('common.buttons.close')"
    :show.sync="show"
    :show-submit="false"
    content-padding="6"
    content-only-scrolling
    fullscreen
    persistent
    show-close
    :loading="loading"
    @close="close"
    @cancel="close">
    <v-row>
      <v-col cols="12" md="8" class="px-6 mx-auto">
        <div>
          <v-text-field
            v-model="search"
            clearable
            outlined
            prepend-inner-icon="mdi-magnify"
            data-test="search-input"
            :placeholder="$t('assessmentTemplate.search_assessment')" />
        </div>
        <div>
          <v-data-table-a11y
            data-test="table"
            must-sort
            hide-default-footer
            class="bordered"
            :headers="headers"
            :items="items"
            :items-per-page="Math.max(items.length, 1)">
            <template #[`item.name`]="{ item }">
              {{ $m(item.name) }}
            </template>
            <template #[`item.program`]="{ item }">
              {{ getProgramName(item) }}
            </template>
            <template #[`item.select`]="{ item }">
              <v-btn
                class="mr-4"
                color="primary"
                small
                :data-test="`select_${item.id}`"
                @click="select(item)">
                {{ $t('common.add') }}
              </v-btn>
            </template>
          </v-data-table-a11y>
        </div>
      </v-col>
    </v-row>
  </rc-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcDialog, VDataTableA11y } from '@libs/component-lib/components';
import { DataTableHeader } from 'vuetify';
import _debounce from 'lodash/debounce';
import { Status } from '@libs/shared-lib/types';
import { IAssessmentResponseCreateRequest, AssociationType, IAssessmentFormEntity } from '@libs/entities-lib/assessment-template';
import helpers from '@/ui/helpers/helpers';
import { useAssessmentFormStore } from '@/pinia/assessment-form/assessment-form';
import { useAssessmentResponseStore } from '@/pinia/assessment-response/assessment-response';
import { EFilterKeyType } from '@libs/component-lib/types';
import helper from '@libs/shared-lib/helpers/helpers';
import { IProgramEntity } from '@libs/entities-lib/program';
import { useProgramStore } from '@/pinia/program/program';

const DEBOUNCE_RATE = 500;
const debouncedSearch = _debounce((context) => {
  context.doSearch();
}, DEBOUNCE_RATE);

export default Vue.extend({
  name: 'AddCaseFileAssessment',

  components: {
    RcDialog,
    VDataTableA11y,
  },

  props: {
    show: {
      type: Boolean,
      required: true,
    },
    caseFileId: {
      type: String,
      required: true,
    },
    eventId: {
      type: String,
      required: true,
    },
    excludedIds: {
      type: Array as () => string[],
      default: null,
    },
  },

  data() {
    return {
      search: '',
      searchResultIds: [] as Array<string>,
      loading: false,
      programs: [] as IProgramEntity[],
    };
  },

  computed: {
    headers(): Array<DataTableHeader> {
      return [
        {
          text: this.$t('assessmentTemplate.name') as string,
          value: 'name',
          sortable: false,
          width: '50%',
        },
        {
          text: this.$t('assessmentTemplate.program') as string,
          value: 'program',
          sortable: false,
          width: '50%',
        },
        {
          text: this.$t('common.buttons.add') as string,
          class: 'rc-transparent-text',
          value: 'select',
          sortable: false,
        },
      ];
    },

    items() : Array<IAssessmentFormEntity> {
      return useAssessmentFormStore().getByIds(this.searchResultIds, true);
    },
  },

  watch: {
    search() {
      debouncedSearch(this);
    },
  },

  async created() {
    this.programs = await useProgramStore().fetchAllIncludingInactive({ eventId: this.eventId });
    await this.doSearch();
  },

  methods: {
    getProgramName(item: IAssessmentFormEntity) {
      return this.$m(this.programs.find((x) => x.id === item.programId)?.name);
    },

    close() {
      this.$emit('update:show', false);
    },

    async doSearch() {
      const assessments = await useAssessmentFormStore().search({ params: {
        filter: {
          'Entity/EventId': { value: this.eventId, type: EFilterKeyType.Guid },
          'Entity/Status': helper.getEnumKeyText(Status, Status.Active),
          not: { 'Entity/Id': { in: this.excludedIds || [] } },
          ...helpers.toQuickSearchSql(this.search),
        },
        top: 50,
        orderBy: `Entity/Name/Translation/${this.$i18n.locale}`,
      },
      includeInactiveItems: false });
      this.searchResultIds = assessments.ids;
    },

    async select(item: IAssessmentFormEntity) {
      const response: IAssessmentResponseCreateRequest = {
        assessmentFormId: item.id, association: { id: this.caseFileId, type: AssociationType.CaseFile },
      };

      const result = await useAssessmentResponseStore().create(response);

      if (result) {
        this.$toasted.global.success(this.$t('assessment.create.success'));
        this.close();
      }
    },
  },
});
</script>
