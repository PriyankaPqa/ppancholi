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
        :class="{ 'rc-link12 fw-bold mx-1 text-no-wrap': true }"
        data-test="event-summary-registration-link"
        :href="registrationUrl">
        {{ registrationUrl }}
      </a>

      <rc-tooltip bottom>
        <template #activator="{ on }">
          <v-btn
            data-test="event-summary-copy-link-btn"
            icon
            :aria-label="$t('eventSummary.copyLinkTooltip')"
            v-on="on"
            @click="copyRegistrationLink()">
            <v-icon size="16" color="grey darken-2">
              mdi-content-copy
            </v-icon>
          </v-btn>
        </template>
        {{ $t('eventSummary.copyLinkTooltip') }}
      </rc-tooltip>

      <v-spacer />

      <rc-tooltip v-if="$hasLevel(UserRoles.level6) && showSwitchBtn" bottom>
        <template #activator="{ on }">
          <div v-on="on">
            <v-switch
              v-model="selfRegistrationEnabled"
              :loading="updatingSelfRegistration"
              :disabled="updatingSelfRegistration"
              :aria-label="$t('event.self-registration.enable')"
              class="mt-0 pt-0 mr-2"
              data-test="event-summary-toggle-self-registration"
              hide-details
              @change="toggleSelfRegistration($event)" />
          </div>
        </template>
        {{ event.selfRegistrationEnabled ? $t('event.self-registration.disable') : $t('event.self-registration.enable') }}
      </rc-tooltip>
    </div>
    <v-divider />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcTooltip } from '@libs/component-lib/components';
import helpers from '@/ui/helpers/helpers';
import { EEventStatus, IEventEntity } from '@libs/entities-lib/event';
import { useEventStore } from '@/pinia/event/event';
import { useTenantSettingsStore } from '@/pinia/tenant-settings/tenant-settings';
import { UserRoles } from '@libs/entities-lib/user';

export default Vue.extend({
  name: 'EventSummaryLink',

  components: {
    RcTooltip,
  },

  props: {
    event: {
      type: Object as () => IEventEntity,
      required: true,
    },
  },

  data() {
    return {
      updatingSelfRegistration: false,
      selfRegistrationEnabled: this.event.selfRegistrationEnabled,
      UserRoles,
    };
  },

  computed: {
    registrationUrl(): string {
      const prefixRegistrationLink = useTenantSettingsStore().currentTenantSettings;
      if (!prefixRegistrationLink?.registrationDomain) {
        return null;
      }
      const urlStart = `https://${this.$m(prefixRegistrationLink.registrationDomain)}`;
      return `${urlStart}/${this.$i18n.locale}/registration/${this.$m(this.event.registrationLink)}`;
    },

    showSwitchBtn() {
      if (!this.event.schedule) {
        return false;
      }
      return this.event.schedule.status === EEventStatus.Open && this.$hasLevel(UserRoles.level6);
    },
  },

  methods: {
    copyRegistrationLink() {
      helpers.copyToClipBoard(this.registrationUrl);
      this.$toasted.global.success(this.$t('eventSummary.copyLinkSuccessful'));
    },

    async toggleSelfRegistration(selfRegistrationEnabled: boolean) {
      this.updatingSelfRegistration = true;

      const response = await useEventStore().toggleSelfRegistration({
        id: this.event.id,
        selfRegistrationEnabled,
      });

      if (response) {
        if (selfRegistrationEnabled) {
          this.$toasted.global.success(this.$t('eventSummary.registrationLinkEnabled'));
        } else {
          this.$toasted.global.success(this.$t('eventSummary.registrationLinkDisabled'));
        }
        this.selfRegistrationEnabled = selfRegistrationEnabled;
      } else {
        // Return to original value
        this.selfRegistrationEnabled = this.event.selfRegistrationEnabled;
      }

      this.updatingSelfRegistration = false;
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
