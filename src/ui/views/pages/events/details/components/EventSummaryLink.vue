<template>
  <div class="registration-link">
    <div class="d-flex align-center ma-0 px-1 pb-2">
      <v-icon
        size="24"
        class="ml-3 mr-2"
        color="secondary">
        mdi-folder-plus
      </v-icon>
      <span class="rc-body12">{{ $t('eventSummary.registrationLink') }}: </span>
      <a
        :class="{'rc-link12 fw-bold mx-1 text-no-wrap': true}"
        data-test="event-summary-registration-link"
        :href="registrationUrl">
        {{ registrationUrl }}
      </a>
      <v-tooltip :open-delay="TOOLTIP_DELAY" bottom>
        <template #activator="{ on }">
          <v-btn
            data-test="event-summary-copy-link-btn"
            icon
            v-on="on"
            @click="copyRegistrationLink()">
            <v-icon size="16" color="grey darken-2">
              mdi-content-copy
            </v-icon>
          </v-btn>
        </template>
        <span>
          {{ $t('eventSummary.copyLinkTooltip') }}
        </span>
      </v-tooltip>
      <!-- <v-tooltip :open-delay="TOOLTIP_DELAY" bottom>
          <template v-slot:activator="{ on }">
            <v-btn
              data-test="event-summary-share-link-btn"
              icon
              v-on="on">
              <v-icon size="16" color="grey darken-2">
                mdi-share-variant
              </v-icon>
            </v-btn>
          </template>
          <span>
            {{ $t('eventSummary.shareLinkTooltip') }}
          </span>
        </v-tooltip> -->
      <v-spacer />
      <v-switch
        v-if="showSwitchBtn && !updatingSelfRegistration"
        :input-value="event.selfRegistrationEnabled"
        class="mt-0 pt-0 mr-2"
        data-test="event-summary-toggle-self-registration"
        hide-details
        @change="toggleSelfRegistration()" />
      <v-switch
        v-if="showSwitchBtn && updatingSelfRegistration"
        class="mt-0 pt-0 mr-2"
        hide-details
        :loading="true" />
    </div>
    <v-divider />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import _cloneDeep from 'lodash/cloneDeep';
import helpers from '@/ui/helpers';
import { TOOLTIP_DELAY } from '@/ui/constants';
import { localStorageKeys } from '@/constants/localStorage';
import { EEventStatus, Event } from '@/entities/event';

export default Vue.extend({
  name: 'EventSummaryLink',
  components: {
  },
  props: {
    event: {
      type: Event,
      required: true,
    },
  },

  data() {
    return {
      TOOLTIP_DELAY,
      updatingSelfRegistration: false,
      prefixRegistrationLink: localStorage.getItem(localStorageKeys.prefixRegistrationLink.name),
    };
  },

  computed: {
    registrationUrl(): string {
      return `${this.prefixRegistrationLink}${this.$m(this.event.registrationLink)}`;
    },

    showSwitchBtn() {
      if (!this.event.schedule) return false;
      return this.event.schedule.status === EEventStatus.Open && this.$hasLevel('level6');
    },
  },

  methods: {

    copyRegistrationLink() {
      helpers.copyToClipBoard(this.registrationUrl);
      this.$toasted.global.success(this.$t('eventSummary.copyLinkSuccessful'));
    },

    toggleSelfRegistration(isEnabled: boolean) {
      // The switch component doesn't update its inner state properly when it receives new state from props
      // so it needs to be recreated on state change
      this.updatingSelfRegistration = true;
      const updatedEvent = _cloneDeep(this.event);
      updatedEvent.selfRegistrationEnabled = isEnabled;
      // Call action to update event.selfRegistrationEnabled
      setTimeout(() => {
        this.updatingSelfRegistration = false;
      });
    },
  },
});
</script>

<style scoped>
.registration-link {
  margin-top: -6px;
  margin-left: -16px;
  margin-right: -16px;
}

.disabled-url {
  color: var(--v-grey-lighten1) !important;
  pointer-events: none;
}
</style>
