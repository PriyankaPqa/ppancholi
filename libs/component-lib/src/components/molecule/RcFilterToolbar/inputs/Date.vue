<template>
  <div class="flex-right">
    <v-menu
      v-model="menuStart"
      :close-on-content-click="false"
      transition="scale-transition"
      offset-y
      min-width="290px">
      <template #activator="{ on }">
        <v-text-field
          prepend-inner-icon="mdi-calendar"
          :data-test="`filterToolbar__input-${id}-date-input`"
          outlined
          readonly
          clearable
          :label="label"
          :value="inputFrom"
          v-on="on"
          @click:clear="emitRange" />
      </template>

      <v-date-picker
        v-model="pickerStart"
        :data-test="`filterToolbar__input-${id}-date-datePicker`"
        :locale="locale"
        @change="menuStart = false" />
    </v-menu>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import {
  format, parse,
} from 'date-fns';
import { DEFAULT_DATE, ISO_FORMAT } from '@libs/component-lib/components/molecule/RcFilterToolbar/inputs/constants';

export default Vue.extend({
  name: 'Date',

  props: {
    // Take start and end as the input. Could be used via v-model.
    value: {
      type: String,
      default: () => DEFAULT_DATE,
    },
    id: {
      type: String,
      required: true,
    },
    // Locale
    locale: {
      type: String,
      default: 'en-us',
    },
    // Denotes the Placeholder string for entire control.
    label: {
      type: String,
      default: 'On Date',
    },
    // Formats the dates values in requested format
    displayFormat: {
      type: String,
      default: null,
    },
  },

  data() {
    return {
      menuStart: false,
      pickerStart: this.value,
    };
  },
  computed: {
    inputFrom(): string {
      if (!this.value) {
        return '';
      }

      const start = this.displayFormat
        ? this.formatDate(this.value, this.displayFormat)
        : this.value;

      return start;
    },
  },
  watch: {
    menuStart(isOpen) {
      if (!isOpen) {
        this.closeMenu();
      }
    },
  },
  methods: {
    formatDate(date: string, fmt: string): string {
      return format(parse(date, ISO_FORMAT, new Date()), fmt);
    },
    closeMenu() {
      this.emitRange();
      this.$emit('menu-closed');
    },
    emitRange() {
      this.$emit('input', this.pickerStart);
    },
    reset() {
      this.pickerStart = '';
      this.emitRange();
    },
  },
});
</script>

<style scoped lang="scss">
.flex-right {
  flex: 1;
}
</style>
