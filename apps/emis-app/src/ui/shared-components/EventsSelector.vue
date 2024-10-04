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
import helper from '@libs/shared-lib/helpers/helpers';
import { EEventStatus, IEventSummary } from '@libs/entities-lib/event';

import deepmerge from 'deepmerge';
import Routes from '@/constants/routes';
import { UserRoles } from '@libs/entities-lib/user';

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
      type: Array as () => Array<IEventSummary>,
      default: () => [] as Array<IEventSummary>,
    },
    disableEventDelete: {
      type: Boolean,
      default: false,
    },
    excludedEvent: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      events: this.forceEvents as Array<IEventSummary>,
      selectedItem: this.value,
      loading: false,
      search: '',
      initialNumberOfItems: 6,
      limitResults: 6,
      visualDelay: 500,
    };
  },

  computed: {
    isOnRegistrationPage(): boolean {
      return this.$route.name === Routes.registration.home.name;
    },
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
    getTextEvent(item: IEventSummary): string {
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
      const searchParam = helpers.toQuickSearchSql(querySearch, `Name/Translation/${this.$i18n.locale}`);

      let filter = {
        Schedule: {
          Status: helper.getEnumKeyText(EEventStatus, EEventStatus.Open),
        },
        ...searchParam,
      } as Record<any, any>;

      if (this.fetchAllEvents) {
        filter = { ...searchParam };
      }

      if (this.isOnRegistrationPage && this.$hasRole(UserRoles.level0)) {
        filter.RegistrationsForL0UsersEnabled = true;
      }

      const params = {
        orderBy: 'Schedule/OpenDate desc',
        filter,
        top,
      };

      const res = await this.$services.events.searchEventSummaries(params);

      const resultData = res?.value;
      this.events = resultData;
      if (this.excludedEvent && resultData) {
        this.events = resultData.filter((event) => event.id !== this.excludedEvent);
      }
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
      // we include events you do not have access to here since this is a search by id and maybe for some reason
      // we have data that relates to an event without access
      const res = await this.$services.events.searchEventSummaries({
        filter: `Id in(${(newIds as string[]).join(',')})`,
        top: 999,
      }, true);
      if (res?.value) {
        this.events = deepmerge(res?.value, this.events);
      }
      await helpers.timeout(this.visualDelay);
      this.loading = false;
    },
  },

});
</script>
