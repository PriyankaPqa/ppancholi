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

      <v-spacer />

      <v-switch
        v-if="$hasLevel('level6') && showSwitchBtn"
        :input-value="event.selfRegistrationEnabled"
        :loading="updatingSelfRegistration"
        :disabled="updatingSelfRegistration"
        class="mt-0 pt-0 mr-2"
        data-test="event-summary-toggle-self-registration"
        hide-details
        @change="toggleSelfRegistration($event)" />
    </div>
    <v-divider />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import helpers from '@/ui/helpers';
import { TOOLTIP_DELAY } from '@/ui/constants';
import { localStorageKeys } from '@/constants/localStorage';
import { EEventStatus, Event } from '@/entities/event';

export default Vue.extend({
  name: 'EventSummaryLink',

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
      return `${this.prefixRegistrationLink}/${this.$i18n.locale}/registration/${this.$m(this.event.registrationLink)}`;
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

    async toggleSelfRegistration(selfRegistrationEnabled: boolean) {
      this.updatingSelfRegistration = true;

      try {
        await this.$storage.event.actions.toggleSelfRegistration({
          id: this.event.id,
          selfRegistrationEnabled,
        });
      } catch {
        return;
      } finally {
        this.updatingSelfRegistration = false;
      }

      if (selfRegistrationEnabled) {
        this.$toasted.global.success(this.$t('eventSummary.registrationLinkEnabled'));
      } else {
        this.$toasted.global.success(this.$t('eventSummary.registrationLinkDisabled'));
      }
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
