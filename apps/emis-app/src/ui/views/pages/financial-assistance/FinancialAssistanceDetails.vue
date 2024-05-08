<template>
  <div>
    <div v-if="loading" class="pa-4">
      <v-skeleton-loader class="mb-4" tile type="table-heading" />
      <v-skeleton-loader tile type="list-item-avatar" />
      <v-skeleton-loader tile type="list-item" />
      <v-skeleton-loader tile type="list-item" />
      <v-skeleton-loader tile type="list-item" />
      <v-skeleton-loader tile type="list-item" />
      <v-skeleton-loader tile type="list-item" />
    </div>

    <div v-else-if="error">
      <error-panel>
        {{ $t('financialAssistance.errors.notFound') }}
      </error-panel>
    </div>

    <template v-else>
      <div class="flex-row justify-space-between pa-4 pb-0">
        <status-chip status-name="Status" :status="status" />

        <v-btn icon data-test="financialDetails__editBtn" :aria-label="$t('common.edit')" @click="goToEdit()">
          <v-icon>
            mdi-pencil
          </v-icon>
        </v-btn>
      </div>

      <rc-page-content :title="title" content-padding="0" show-search @search="search = $event">
        <div class="mx-8 mt-12">
          <span class="rc-body14"> {{ $t('financialAssistance.program') }}: {{ programName }} </span>
        </div>

        <div class="rc-heading-5 mx-8 mb-4">
          {{ name }}
        </div>

        <div v-if="faTable && faTable.useForLodging" class="rc-body14 mx-8 mb-4">
          <span class="rc-body14 fw-bold">
            {{ $t('common.set_as') }}
          </span>
          {{ $t('common.lodging') }}
        </div>

        <rc-nested-table :headers="headers" :items="filteredItems" collapsible item-sub-item="subItems" data-test="financialDetails__table">
          <template #[`item.item`]="{ item }">
            <span class="rc-body14 fw-bold">
              {{ $m(item.mainCategory.name) }}
            </span>

            <tooltip-financial-assistance-category
              v-if="item.mainCategory && $m(item.mainCategory.description)"
              :label="$m(item.mainCategory.description)" />
          </template>

          <template #[`sub-item.subItem`]="{ item }">
            <span class="rc-body14">
              {{ item.subCategory ? $m(item.subCategory.name) : $t('common.default') }}
            </span>

            <tooltip-financial-assistance-category
              v-if="item.subCategory && $m(item.subCategory.description)"
              :label="$m(item.subCategory.description)" />
          </template>

          <template #[`sub-item.maximum`]="{ item }">
            <span class="rc-body14">
              {{ $formatCurrency(item.maximumAmount, true) }}
            </span>
          </template>

          <template #[`sub-item.amountType`]="{ item }">
            <span class="rc-body14">
              {{ getAmountType(item) }}
            </span>
          </template>

          <template #[`sub-item.documentationRequired`]="{ item }">
            <span class="rc-body14">
              {{ item.documentationRequired ? $t('common.yes') : $t('common.no') }}
            </span>
          </template>

          <template #[`sub-item.frequency`]="{ item }">
            <span class="rc-body14">
              {{ getFrequency(item) }}
            </span>
          </template>
        </rc-nested-table>

        <div class="pa-8" />

        <template #actions>
          <v-btn color="primary" data-test="back-to-financial-assistance-btn" @click="back()">
            {{ $t('financialAssistance.back') }}
          </v-btn>
        </template>
      </rc-page-content>
    </template>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { TranslateResult } from 'vue-i18n';
import { RcNestedTable, RcPageContent } from '@libs/component-lib/components';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import {
  EFinancialAmountModes,
  EFinancialFrequency,
  IFinancialAssistanceTableEntity,
  IFinancialAssistanceTableItem,
  IFinancialAssistanceTableSubItem,
} from '@libs/entities-lib/financial-assistance';
import routes from '@/constants/routes';
import { Status } from '@libs/entities-lib/base';
import { useProgramStore } from '@/pinia/program/program';
import { IProgramEntity } from '@libs/entities-lib/program';
import { useFinancialAssistancePaymentStore } from '@/pinia/financial-assistance-payment/financial-assistance-payment';
import { useFinancialAssistanceStore } from '@/pinia/financial-assistance/financial-assistance';
import { INestedTableHeader } from './create-edit/INestedTableHeader';
import TooltipFinancialAssistanceCategory from './create-edit/TooltipFinancialAssistanceCategory.vue';
import ErrorPanel from './create-edit/ErrorPanel.vue';

export default Vue.extend({
  name: 'FinancialAssistanceDetails',

  components: {
    RcPageContent,
    ErrorPanel,
    StatusChip,
    RcNestedTable,
    TooltipFinancialAssistanceCategory,
  },

  data() {
    return {
      search: '',
      loading: false,
      error: false,
      faTable: null as IFinancialAssistanceTableEntity,
    };
  },

  computed: {
    title(): TranslateResult {
      return this.$t('financialAssistance.tableDetails');
    },

    status(): Status {
      return useFinancialAssistanceStore().status;
    },

    name(): string {
      return useFinancialAssistanceStore().getName(this.$i18n.locale);
    },

    programName(): string {
      const program = useFinancialAssistanceStore().program;
      return this.$m(program?.name);
    },

    items(): IFinancialAssistanceTableItem[] {
      return useFinancialAssistanceStore().mainItems;
    },

    /**
     * Filter the list of sub-items based on the search parameter
     */
    filteredItems(): Array<IFinancialAssistanceTableItem> {
      if (this.search) {
        const items = this.items.map((item: IFinancialAssistanceTableItem) => ({
          ...item,
          subItems: item.subItems.filter((subItem: IFinancialAssistanceTableSubItem) => {
            // If the subItem is a 'default' type the name field is blank so we need to inject 'Default'
            const name = subItem.subCategory?.name ? this.$m(subItem.subCategory.name) : this.$m({ translation: { en: 'Default', fr: 'Défaut' } });

            return name.toLowerCase().indexOf(this.search.toLowerCase()) > -1;
          }),
        }));

        return items.filter((item: IFinancialAssistanceTableItem) => {
          if (item.subItems.length) {
            return true;
          }

          const name = this.$m(item.mainCategory.name);

          return name.toLowerCase().indexOf(this.search.toLowerCase()) > -1;
        });
      }

      return this.items;
    },

    /**
     * Table header config for the RcNestedTable
     */
    headers(): Array<INestedTableHeader> {
      return [
        {
          text: this.$t('financialAssistance.nestedTable.headers.item') as string,
          value: 'item',
          cols: 2,
          align: 'left',
        },
        {
          text: this.$t('financialAssistance.nestedTable.headers.subItem') as string,
          value: 'subItem',
          cols: 2,
          align: 'left',
        },
        {
          text: this.$t('financialAssistance.nestedTable.headers.maximum') as string,
          value: 'maximum',
          cols: 2,
          align: 'left',
        },
        {
          text: this.$t('financialAssistance.nestedTable.headers.amountType') as string,
          value: 'amountType',
          cols: 2,
          align: 'left',
        },
        {
          text: this.$t('financialAssistance.nestedTable.headers.documentationRequired') as string,
          value: 'documentationRequired',
          cols: 2,
          align: 'left',
        },
        {
          text: this.$t('financialAssistance.nestedTable.headers.frequency') as string,
          value: 'frequency',
          cols: 2,
          align: 'left',
        },
      ];
    },
  },

  async created() {
    useFinancialAssistanceStore().resetExtensionState();

    const id = this.$route.params.faId;

    if (!id) {
      this.error = true;
      this.loading = false;
      return;
    }

    const timeout = setTimeout(() => {
      this.loading = true;
    }, 300);

    const res = await useFinancialAssistanceStore().fetch(this.$route.params.faId);
    const categories = await useFinancialAssistancePaymentStore().fetchFinancialAssistanceCategories();
    const program = await useProgramStore().fetch({ id: res.programId, eventId: res.eventId }) as IProgramEntity;
    this.faTable = res;
    useFinancialAssistanceStore().setFinancialAssistance({
      fa: res, categories, newProgram: program, removeInactiveItems: true,
    });

    if (!res) {
      this.error = true;
      return;
    }

    clearTimeout(timeout);
    this.loading = false;
  },

  methods: {
    getAmountType(subItem: IFinancialAssistanceTableSubItem): TranslateResult {
      return this.$t(`enums.financialAmountModes.${EFinancialAmountModes[subItem.amountType]}`);
    },

    getFrequency(subItem: IFinancialAssistanceTableSubItem): TranslateResult {
      return this.$t(`enums.financialFrequency.${EFinancialFrequency[subItem.frequency]}`);
    },

    /**
     * Redirect to the edit page when the edit button is clicked
     */
    goToEdit() {
      this.$router.push({
        name: routes.events.financialAssistance.edit.name,
        params: {
          faId: this.$route.params.faId,
        },
      });
    },

    back(): void {
      this.$router.replace({ name: routes.events.financialAssistance.home.name });
    },
  },
});
</script>

<style scoped lang="scss">
::v-deep .rcnestedtable__parentRow {
  .rcnestedtable__row:last-child {
    border-bottom: none;
    margin-bottom: 0px;
  }
}
</style>
