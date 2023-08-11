<template>
  <validation-observer ref="form" slim>
    <rc-dialog
      :title="$t('eventSummary.selectExceptionalAuthenticationType')"
      :show="true"
      :cancel-action-label="$t('common.buttons.cancel')"
      :submit-action-label="$t('common.save')"
      :content-only-scrolling="true"
      :persistent="true"
      :max-width="750"
      :min-height="600"
      @cancel="$emit('close')"
      @close="$emit('close')"
      @submit="onSubmit">
      <v-container class="border-row">
        <v-row v-for="item in staticExceptionalAuth" :key="item.id">
          <v-checkbox
            hide-details
            class="mt-0"
            :label="$m(item.name)"
            input-value="true"
            disabled />
        </v-row>
        <v-row v-for="item in items" :key="item.option.id" class="justify-space-between">
          <div>
            <v-checkbox
              v-model="item.selected"
              hide-details
              class="mt-0"
              :label="$m(item.option.name)"
              @change="() => { item.max = null }" />
          </div>
          <div>
            <v-text-field-with-validation v-model="item.max" :label="$t('eventSummary.exceptionalAuthenticationType.max')" :disabled="!item.selected" type="number" />
          </div>
        </v-row>
      </v-container>
    </rc-dialog>
  </validation-observer>
</template>

<script lang='ts'>
import Vue from 'vue';
import {
  RcDialog, VTextFieldWithValidation,
} from '@libs/component-lib/components';

import { IEventEntity } from '@libs/entities-lib/event';
import { useEventStore } from '@/pinia/event/event';
import { IOptionItem } from '@libs/entities-lib/optionItem';

export default Vue.extend({

  name: 'EventExceptionalAuthenticationDialog',

  components: {
    RcDialog,
    VTextFieldWithValidation,
  },

  props: {
    event: {
      type: Object as () => IEventEntity,
      required: true,
    },
  },

  data() {
    return {
      items: [] as { option: IOptionItem, selected?: boolean, max?: number }[],
    };
  },

  computed: {
    sortedExceptionalAuth(): Array<IOptionItem> {
      return useEventStore().getExceptionalAuthenticationTypes(true, this.event.exceptionalAuthenticationTypes.map((x) => x.exceptionalAuthenticationTypeId))
      .filter((x) => !x.isDefault && !x.isOther);
    },
    staticExceptionalAuth(): Array<IOptionItem> {
      return useEventStore().getExceptionalAuthenticationTypes(true).filter((x) => x.isDefault || x.isOther);
    },
  },

  created() {
    this.items = this.sortedExceptionalAuth.map((o) => ({
      option: o,
      selected: this.event.exceptionalAuthenticationTypes.find((e) => e.exceptionalAuthenticationTypeId === o.id) != null,
      max: this.event.exceptionalAuthenticationTypes.find((e) => e.exceptionalAuthenticationTypeId === o.id)?.maxNumberOfUsages,
    }));
  },

  methods: {
    async onSubmit() {
      await useEventStore().updateExceptionalAuthenticationType({
        eventId: this.event.id,
        types: this.items.filter((x) => x.selected).map((x) => ({ exceptionalAuthenticationTypeId: x.option.id, maxNumberOfUsages: x.max })),
      });
      this.$emit('close');
    },
  },
});

</script>

<style scoped lang="scss">
.border-row > * {
  padding: 8px;
  border-bottom: 1px solid var(--v-grey-lighten2);
}

::v-deep .v-text-field__details {
  min-height: 0 !important;
  margin-bottom: 0 !important;
}
</style>
