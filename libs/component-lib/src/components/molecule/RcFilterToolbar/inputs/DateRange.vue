<template>
  <v-container
    fluid
    class="pa-0">
    <v-row>
      <v-col
        class="py-0"
        cols="6">
        <div class="flex-grow-1">
          <v-menu
            v-model="menuStart"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            min-width="290px">
            <template #activator="{ on }">
              <v-text-field
                prepend-inner-icon="mdi-calendar"
                :data-test="`filterToolbar__input-${id}-dateRange-start`"
                outlined
                readonly
                clearable
                :label="startLabel"
                :rules="[rules.startRequired]"
                :value="inputFrom"
                v-on="on"
                @click:clear="clearStart" />
            </template>

            <v-date-picker
              v-model="pickerStart"
              :data-test="`filterToolbar__input-${id}-dateRange-start-date-picker`"
              :locale="locale"
              :max="pickerEnd"
              @change="menuStart = false" />
          </v-menu>
        </div>
      </v-col>

      <v-col
        class="py-0"
        cols="6">
        <div class="flex-grow-1">
          <v-menu
            v-model="menuEnd"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            min-width="290px">
            <template #activator="{ on }">
              <v-text-field
                prepend-inner-icon="mdi-calendar"
                :data-test="`filterToolbar__input-${id}-dateRange-end`"
                outlined
                readonly
                clearable
                :label="endLabel"
                :value="inputTo"
                :rules="[rules.endRequired]"
                v-on="on"
                @click:clear="clearEnd" />
            </template>

            <v-date-picker
              v-model="pickerEnd"
              :data-test="`filterToolbar__input-${id}-dateRange-end-date-picker`"
              :locale="locale"
              :min="pickerStart"
              @change="menuEnd = false" />
          </v-menu>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import {
  format, parse,
} from 'date-fns';
import { IFilterToolbarLabels } from '@libs/component-lib/types';
import { DEFAULT_DATE, ISO_FORMAT } from '@libs/component-lib/components/molecule/RcFilterToolbar/inputs/constants';

export default Vue.extend({
  name: 'DateRange',

  props: {
    // Take start and end as the input. Could be used via v-model.
    value: {
      type: Array as () => Array<string>,
      default: () => [DEFAULT_DATE, DEFAULT_DATE],
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
    labels: {
      type: Object as () => IFilterToolbarLabels,
      default: null,
    },
    // Denotes the Placeholder string for start date.
    startLabel: {
      type: String,
      default: 'From',
    },
    // Denotes the Placeholder string for start date.
    endLabel: {
      type: String,
      default: 'To',
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
      menuEnd: false,
      pickerStart: this.value[0],
      pickerEnd: this.value[1],
    };
  },

  computed: {
    rules() {
      return {
        startRequired: (value: string) => {
          if (this.pickerEnd && !value && this.labels) {
            return this.labels.formRequiredField;
          }

          return true;
        },

        endRequired: (value: string) => {
          if (this.pickerStart && !value && this.labels) {
            return this.labels.formRequiredField;
          }

          return true;
        },
      };
    },

    inputFrom(): string {
      if (!this.value[0]) {
        return '';
      }

      const start = this.displayFormat
        ? this.formatDate(this.value[0], this.displayFormat)
        : this.value[0];

      return start;
    },

    inputTo(): string {
      if (!this.value[1]) {
        return '';
      }

      const end = this.displayFormat
        ? this.formatDate(this.value[1], this.displayFormat)
        : this.value[1];

      return end;
    },
  },

  watch: {
    menuStart(isOpen) {
      if (!isOpen) {
        this.closeMenu();
      }
    },
    menuEnd(isOpen) {
      if (!isOpen) {
        this.closeMenu();
      }
    },
    value(newValue) {
      this.pickerStart = newValue[0];
      this.pickerEnd = newValue[1];
    },
  },
  methods: {
    formatDate(date: string, fmt: string): string {
      return format(parse(date, ISO_FORMAT, new Date()), fmt);
    },
    clearStart() {
      this.pickerStart = '';
      this.emitRange();
    },
    clearEnd() {
      this.pickerEnd = '';
      this.emitRange();
    },
    closeMenu() {
      this.emitRange();
      this.$emit('menu-closed');
    },
    emitRange() {
      this.$emit('input', [this.pickerStart, this.pickerEnd]);
    },
    reset() {
      this.pickerStart = '';
      this.pickerEnd = '';
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
