<template>
  <v-autocomplete-with-validation
    v-model="selectedItem"
    background-color="white"
    cache-items
    outlined
    :search-input.sync="search"
    :return-object="returnObject"
    :items="events"
    :item-text="getTextEvent"
    :item-value="itemValue"
    :placeholder="$t(placeholder)"
    :loading="loading"
    async-mode
    :attach="true"
    :label="label"
    :data-test="dataTest"
    :disable-chip-delete="disableEventDelete"
    v-bind="$attrs"
    clearable
    @change="$emit('change', $event)"
    @delete="$emit('delete', $event)" />
</template>

<script lang="ts">
import Vue from 'vue';
import { VAutocompleteWithValidation } from '@libs/component-lib/components';
import _debounce from 'lodash/debounce';
import helpers from '@/ui/helpers/helpers';
import {
  EEventStatus, IEventMainInfo,
} from '@libs/entities-lib/event';

import {
  IEvent, RegistrationEvent, IEventData,
} from '@libs/entities-lib/registration-event';
import deepmerge from 'deepmerge';

export default Vue.extend({
  name: 'EventsSelector',
  components: {
    VAutocompleteWithValidation,
  },

  props: {
    /**
     * The selected value(s) of the dropdown
     */
    value: {
      type: [Object, Array, String, Number],
      default: () => [] as unknown[],
    },
    label: {
      type: [String],
      required: true,
    },
    dataTest: {
      type: String,
      required: true,
    },
    placeholder: {
      type: String,
      default: 'events.selector.placeholder',
    },
    fetchAllEvents: {
      type: Boolean,
      default: false,
    },
    returnObject: {
      type: Boolean,
      default: false,
    },
    itemValue: { // Won't have effect if returnObject is true
      type: String,
      default: '',
    },
    forceEvents: { // So we can do additional manipulation on the search results. To be used with @fetch:done on external component
      type: Array as () => Array<IEvent>,
      default: () => [] as Array<IEvent>,
    },
    disableEventDelete: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      events: this.forceEvents as Array<IEvent>,
      selectedItem: this.value,
      loading: false,
      search: '',
      initialNumberOfItems: 6,
      limitResults: 6,
      visualDelay: 500,
    };
  },

  watch: {
    selectedItem(newVal) {
      this.$emit('input', newVal);
    },

    value(newVal) {
      this.selectedItem = newVal;
    },

    search(newVal) {
      newVal && newVal !== this.selectedItem && this.debounceSearch(newVal);
    },

    forceEvents(newVal) {
      this.events = newVal;
    },
  },

  async mounted() {
    await this.fetchEvents('', this.initialNumberOfItems);
    // Need to fetch selected item if they are not in the initial fetch
    await this.fetchEventsByIds(this.selectedItem);
  },

  methods: {
    // Mandatory to have it here instead of arrow function otherwise it does not work. Known bug in vuetify
    getTextEvent(item: IEvent): string {
      if (item?.name) {
        return this.$m(item.name);
      }
      return '';
    },
    // eslint-disable-next-line
    debounceSearch: _debounce(function func(this: any, query: string) {
      this.fetchEvents(query, this.limitResults);
    }, 500),

    async fetchEvents(querySearch = '', top: number) {
      this.loading = true;
      const searchParam = helpers.toQuickSearch(querySearch);

      let filter = {
        Entity: {
          Schedule: {
            Status: EEventStatus.Open,
          },
        },
      };

      if (this.fetchAllEvents) {
        filter = null;
      }

      const res = await this.$services.events.searchMyEvents({
        search: searchParam,
        searchFields: `Entity/Name/Translation/${this.$i18n.locale}`,
        orderBy: 'Entity/Schedule/OpenDate desc',
        queryType: 'full',
        searchMode: 'all',
        filter,
        top,
      });
      this.events = res?.value.map((e: IEventMainInfo) => new RegistrationEvent(e.entity as unknown as IEventData));
      this.$emit('fetch:done', this.events);

      await helpers.timeout(this.visualDelay);
      this.loading = false;
    },

    async fetchEventsByIds(param: Array<string> | string | Record<string, unknown>) {
      let newIds = param;
      if (Array.isArray(param) && param.length === 0) {
        return;
      }

      if (!Array.isArray(param)) {
        if (param) {
          newIds = [param as string];
        } else {
          return;
        }
      }

      if (typeof param === 'object' && (param as { id: string }).id) {
        newIds = [(param as { id: string }).id];
      }

      this.loading = true;
      const res = await this.$services.events.searchMyEvents({
        filter: { Entity: { Id: { searchIn_az: newIds } } },
        top: 999,
      });
      const data = res?.value.map((e: IEventMainInfo) => new RegistrationEvent(e.entity as unknown as IEventData));
      if (data) {
        this.events = deepmerge(data, this.events);
      }
      await helpers.timeout(this.visualDelay);
      this.loading = false;
    },
  },

});
</script>
