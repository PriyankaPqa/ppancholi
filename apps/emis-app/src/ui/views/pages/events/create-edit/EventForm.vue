<template>
  <v-container>
    <validation-observer ref="form">
      <v-row justify="center">
        <v-col cols="12" xl="8" lg="9" md="11" sm="12">
          <language-tabs :language="languageMode" @click="setLanguageMode" />

          <v-row>
            <v-col cols="8">
              <v-text-field-with-validation
                v-model="localEvent.name.translation[languageMode]"
                data-test="event-name"
                :label="`${$t('event.event_name')} *`"
                :hint="$t('event.event_name.hint')"
                persistent-hint
                :rules="rules.name"
                :disabled="inputDisabled"
                @input="resetAsUnique()" />
            </v-col>

            <v-col cols="4">
              <v-select-with-validation
                v-model="localEvent.responseDetails.responseLevel"
                data-test="event-level"
                attach
                :label="`${$t('event.response_level')} *`"
                :items="responseLevels"
                :disabled="inputDisabled"
                :rules="rules.responseDetails.responseLevel" />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="6" md="6" sm="12">
              <v-select-with-validation
                v-model="localEvent.location.province"
                data-test="event-province"
                attach
                :label="`${$t('event.province')} *`"
                :items="canadianProvinces"
                :rules="rules.location.province"
                :disabled="inputDisabled"
                @input="clearRegionAndOtherProvince" />
            </v-col>

            <v-col v-if="otherProvinceSelected" cols="6" md="6" sm="12">
              <rc-autosuggest
                v-model="provinceOther"
                :items="otherProvincesSorted"
                data-test="event-province-other"
                attach="event-province-other"
                :label="`${$t('event.other')} *`"
                :rules="rules.location.provinceOther"
                :disabled="inputDisabled"
                :item-text="(item) => item.provinceOther.translation[languageMode]" />
            </v-col>

            <v-col cols="6" md="6" sm="12">
              <rc-autosuggest
                v-model="region"
                :items="regionsSorted"
                data-test="event-region"
                attach="event-region"
                :label="$t('event.region')"
                :disabled="!localEvent.location.province || inputDisabled"
                clearable
                :rules="rules.location.region"
                :item-text="(item) => item.region.translation[languageMode]" />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="6" md="6" sm="12">
              <v-select-with-validation
                v-model="eventType"
                data-test="event-type"
                attach
                :label="`${$t('event.type')} *`"
                :items="eventTypesSorted"
                :item-text="(item) => $m(item.name)"
                return-object
                :rules="rules.responseDetails.eventType"
                :disabled="inputDisabled"
                @change="localEvent.responseDetails.eventType.optionItemId = $event.id" />
            </v-col>

            <v-col v-if="eventType && eventType.isOther" cols="6" md="6" sm="12">
              <v-text-field-with-validation
                v-model="localEvent.responseDetails.eventType.specifiedOther"
                data-test="event-type-specified-other"
                autocomplete="nope"
                :label="`${$t('common.pleaseSpecify')} *`"
                :disabled="inputDisabled"
                :rules="rules.responseDetails.eventTypeOther" />
            </v-col>

            <v-col cols="6" md="6" sm="12">
              <rc-phone-with-validation
                :value="assistanceNumber"
                :rules="rules.responseDetails.assistanceNumber"
                outlined
                :label="`${$t('event.number')} *`"
                data-test="event-phone"
                :disabled="inputDisabled"
                @focusout="setAssistanceNumber($event)" />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="6" md="6" sm="12">
              <v-date-field-with-validation
                v-model="localEvent.responseDetails.dateReported"
                :data-test="'event-reported-date'"
                readonly
                :rules="rules.responseDetails.dateReported"
                :label="`${$t('event.date_reported')} *`"
                :disabled="inputDisabled"
                :max="today" />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <div class="grey-container py-4 px-8">
                <p class="rc-body16 fw-bold">
                  {{ $t('event.status') }}
                </p>

                <div :class="['event_status mb-0', statusColor]">
                  <div>
                    <span
                      data-test="event-status-text"
                      class="fw-medium text-uppercase mr-2">{{ isStatusOpen ? $t('event.status.open') : $t('event.status.onHold') }}</span>
                    <span v-if="isStatusOpen" data-test="event-status-open-date">{{ $t('event.start_on_a_date') }}
                      {{ getLocalStringDate(event.schedule.timestamp, 'EventSchedule.scheduledOpenDate', 'MMM d, yyyy') }}</span>
                  </div>

                  <v-switch
                    v-model="isStatusOpen"
                    data-test="event-switch-status"
                    class="pt-0 mt-0"
                    hide-details
                    color="white"
                    :disabled="inputDisabled"
                    flat />
                </div>

                <div class="mt-4">
                  <v-text-field-with-validation
                    v-if="showReOpenInput"
                    v-model="localEvent.schedule.updateReason"
                    data-test="reopen-reason"
                    background-color="white"
                    autocomplete="nope"
                    :label="`${$t('event.reOpenReason')} *`"
                    :disabled="inputDisabled"
                    :rules="rules.schedule.reOpenReason" />
                </div>
              </div>
            </v-col>
          </v-row>
          <div v-if="$hasLevel(UserRoles.level6)">
            <v-row data-test="custom-consent">
              <v-col cols="12">
                <div class="grey-container py-4 px-8">
                  <p class="rc-body16 fw-bold">
                    {{ $t('eventSummary.eventConsent') }}
                  </p>
                  <v-divider class="my-4" />
                  <div class="d-flex justify-space-between">
                    <div class="fw-bold">
                      {{ consentStatement }}
                    </div>
                    <v-btn class="primary" :disabled="inputDisabled" @click="onSectionAdd(EEventSummarySections.EventConsent)">
                      {{ $t('eventSummary.selectEventConsent') }}
                    </v-btn>
                  </div>
                </div>
              </v-col>
            </v-row>
          </div>

          <div v-if="$hasFeature(FeatureKeys.AuthenticationPhaseII)" data-test="event-tier-section">
            <v-row>
              <v-col cols="12">
                <div class="grey-container py-4 px-8">
                  <p class="rc-body16 fw-bold">
                    {{ $t('eventSummary.authentication') }}
                  </p>
                  <v-divider class="my-4" />
                  <div class="d-flex justify-space-between">
                    <div class="fw-bold">
                      {{ $t('eventSummary.authentication.tier1') }}
                    </div>
                    <v-switch
                      v-model="tier1Enabled"
                      class="mt-0 ml-auto mr-3 pt-0"
                      flat
                      :disabled="inputDisabled"
                      data-test="event-tier-1"
                      hide-details />
                  </div>
                  <v-divider class="my-4" />
                  <div class="d-flex justify-space-between">
                    <div class="fw-bold">
                      {{ $t('eventSummary.authentication.tier2') }}
                    </div>
                    <v-switch
                      v-model="tier2Enabled"
                      class="mt-0 ml-auto mr-3 pt-0"
                      flat
                      :disabled="inputDisabled"
                      data-test="event-tier-2"
                      hide-details />
                  </div>
                </div>
              </v-col>
            </v-row>
          </div>

          <v-row>
            <v-col cols="12">
              <div class="grey-container py-4 px-8">
                <div class="registration__link">
                  <div class="rc-body16 fw-bold">
                    {{ $t('event.registration_link') }}
                  </div>

                  <rc-tooltip bottom>
                    <template #activator="{ on }">
                      <v-btn data-test="copy-link-btn" icon bottom v-on="on" @click="copyRegistrationLink">
                        <v-icon size="24" color="grey darken-2">
                          mdi-content-copy
                        </v-icon>
                      </v-btn>
                    </template>
                    <span>{{ $t('eventSummary.copyLinkTooltip') }}</span>
                  </rc-tooltip>
                </div>
                <v-row>
                  <v-col cols="12" xl="12" lg="12">
                    <v-text-field
                      :value="registrationLink"
                      background-color="white"
                      disabled
                      outlined
                      data-test="event-registration-path"
                      :prefix="prefixRegistrationLink"
                      :label="`${$t('event.registration_link')}`" />
                  </v-col>
                </v-row>
              </div>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <events-selector
                fetch-all-events
                async-mode
                :value="localEvent.relatedEventIds"
                item-value="id"
                :label="$t('event.create.related_events.label')"
                data-test="event-related-events"
                multiple
                :disabled="inputDisabled"
                :excluded-event="event.id"
                @change="setRelatedEvents($event)"
                @delete="setRelatedEvents($event)" />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-text-area-with-validation
                v-model="localEvent.description.translation[languageMode]"
                data-test="event-description"
                full-width
                :label="$t('event.description')"
                :rules="rules.description"
                clearable
                @click:clear="clearDescription()" />
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <component
        :is="currentDialog.component"
        v-if="currentDialog"
        :id="currentDialog.id"
        :event="localEvent"
        :is-edit-mode="currentDialog.isEditMode"
        @close="currentDialog = null" />
    </validation-observer>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import {
  VSelectWithValidation,
  VTextFieldWithValidation,
  VDateFieldWithValidation,
  VTextAreaWithValidation,
  RcPhoneWithValidation,
  RcAutosuggest,
  RcTooltip,
} from '@libs/component-lib/components';
import libHelpers from '@libs/entities-lib/helpers';
import LanguageTabs from '@/ui/shared-components/LanguageTabs.vue';
import helpers from '@/ui/helpers/helpers';
import utils from '@libs/entities-lib/utils';
import { ECanadaProvinces, IMultilingual } from '@libs/shared-lib/types';
import {
  EResponseLevel,
  EEventStatus,
  EventEntity,
  IEventLocation,
} from '@libs/entities-lib/event';
import { MAX_LENGTH_LG, MAX_LENGTH_MD } from '@libs/shared-lib/constants/validations';
import { IOptionItem } from '@libs/entities-lib/optionItem';
import EventsSelector from '@/ui/shared-components/EventsSelector.vue';
import { useEventStore } from '@/pinia/event/event';
import { useTenantSettingsStore } from '@/pinia/tenant-settings/tenant-settings';
import { UserRoles } from '@libs/entities-lib/user';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';
import { TranslateResult } from 'vue-i18n';
import { EEventSummarySections } from '@/types';
import { format } from 'date-fns';
import { DialogData, EDialogComponent } from '../details/components/DialogComponents';
import EventConsentSelectionDialog from '../details/components/EventConsentSelectionDialog.vue';

export default Vue.extend({
  name: 'EventForm',

  components: {
    LanguageTabs,
    VSelectWithValidation,
    VTextFieldWithValidation,
    VDateFieldWithValidation,
    VTextAreaWithValidation,
    RcPhoneWithValidation,
    RcAutosuggest,
    RcTooltip,
    EventsSelector,
    EventConsentSelectionDialog,
  },

  props: {
    isEditMode: {
      type: Boolean,
      required: true,
    },

    event: {
      type: Object as () => EventEntity,
      required: true,
    },

    isNameUnique: {
      type: Boolean,
      required: true,
    },

    isDirty: {
      type: Boolean,
      required: true,
    },
  },

  data() {
    const { getLocalStringDate } = helpers;
    let localEvent;
    if (this.isEditMode) {
      localEvent = new EventEntity(this.event);
    } else {
      localEvent = new EventEntity();
    }

    const assistanceNumber = {
      number: '',
      countryCode: '',
      e164Number: '',
    };

    if (this.isEditMode) {
      localEvent.responseDetails.dateReported = getLocalStringDate(localEvent.responseDetails.dateReported, 'EventResponseDetails.dateReported');

      if (localEvent.schedule.scheduledOpenDate) {
        localEvent.schedule.scheduledOpenDate = getLocalStringDate(localEvent.schedule.scheduledOpenDate, 'EventSchedule.scheduledOpenDate');
      }

      if (localEvent.schedule.scheduledCloseDate) {
        localEvent.schedule.scheduledCloseDate = getLocalStringDate(localEvent.schedule.scheduledCloseDate, 'EventSchedule.scheduledCloseDate');
      }

      if (localEvent && localEvent.responseDetails.assistanceNumber) {
        assistanceNumber.number = localEvent.responseDetails.assistanceNumber;
      }
    }

    return {
      localEvent,
      assistanceNumber,
      eventType: null,
      initialEventType: null,
      languageMode: 'en',
      FeatureKeys,
      otherProvinces: [] as IEventLocation[],
      regions: [] as IEventLocation[],
      initialStatus: localEvent.schedule.status,
      initialOpenDate: localEvent.schedule.scheduledOpenDate,
      initialCloseDate: localEvent.schedule.scheduledCloseDate,
      getLocalStringDate,
      newRegion: { translation: {} } as IMultilingual,
      newProvince: { translation: {} } as IMultilingual,
      currentDialog: null as DialogData,
      EEventSummarySections,
      UserRoles,
    };
  },

  computed: {
    tier1Enabled: {
      get(): boolean {
        return !this.localEvent?.authenticationTier1disabled;
      },

      set(value: boolean) {
        this.localEvent.authenticationTier1disabled = !value;
        this.$emit('update:is-dirty', true);
      },
    },

    tier2Enabled: {
      get(): boolean {
        return !this.localEvent?.authenticationTier2disabled;
      },

      set(value: boolean) {
        this.localEvent.authenticationTier2disabled = !value;
        this.$emit('update:is-dirty', true);
      },
    },

    consentStatement(): TranslateResult {
      const statement = (useTenantSettingsStore().currentTenantSettings.consentStatements || []).find((x) => x.id === this.event?.consentStatementId);
      return statement?.name ? this.$m(statement.name) : this.$t('eventSummary.defaultConsentName');
    },

    inputDisabled(): boolean {
      return !this.$hasLevel(UserRoles.level6);
    },

    isStatusOpen: {
      get(): boolean {
        return this.localEvent.schedule.status === EEventStatus.Open;
      },

      set(isOpen: boolean): void {
        this.localEvent.schedule.status = isOpen ? EEventStatus.Open : EEventStatus.OnHold;

        if (this.isEditMode) {
          this.localEvent.schedule.scheduledOpenDate = isOpen ? format(new Date(), 'yyyy-MM-dd') : this.initialOpenDate;
          if (!isOpen) {
            this.localEvent.schedule.scheduledCloseDate = this.initialCloseDate;
          }
        } else {
          this.localEvent.schedule.scheduledOpenDate = isOpen ? format(new Date(), 'yyyy-MM-dd') : null;
          if (!isOpen) {
            this.localEvent.schedule.scheduledCloseDate = null;
          }
        }

        this.$emit('update:is-dirty', true);
      },
    },

    otherProvinceSelected(): boolean {
      return this.localEvent?.location?.province === ECanadaProvinces.OT;
    },

    provinceOther: {
      get(): string {
        return this.localEvent.location.provinceOther.translation[this.languageMode];
      },

      set(value: string | IEventLocation) {
        if (typeof value === 'string') {
          const valueInItems = this.otherProvincesSorted.find((r) => r.provinceOther.translation[this.languageMode] === value);
          if (!valueInItems) {
            this.newProvince.translation[this.languageMode] = value;
            this.localEvent.location.provinceOther = { ...this.newProvince };
          } else {
            this.newProvince = { translation: {} };
            this.localEvent.location.provinceOther = { ...valueInItems.provinceOther };
          }
        } else {
          this.localEvent.location.provinceOther = { ...value.provinceOther };
        }
      },
    },

    otherProvincesSorted(): Array<IEventLocation> {
      return helpers.sortMultilingualArray(this.otherProvinces, 'provinceOther');
    },

    region: {
      get(): string {
        return this.localEvent.location.region.translation ? this.localEvent.location.region.translation[this.languageMode] : '';
      },

      set(value: string | IEventLocation) {
        if (typeof value === 'string') {
          const valueInItems = this.regionsSorted.find((r) => r.region.translation[this.languageMode] === value);
          if (!valueInItems) {
            this.newRegion.translation[this.languageMode] = value;
            this.localEvent.location.region = { ...this.newRegion };
          } else {
            this.newRegion = { translation: {} };
            this.localEvent.location.region = { ...valueInItems.region };
          }
        } else {
          this.localEvent.location.region = { ...value?.region };
        }
      },
    },

    regionsSorted(): Array<IEventLocation> {
      if (!this.localEvent.location.province) {
        return [];
      }

      if (!this.regions) {
        return [];
      }

      const sorted = helpers.sortMultilingualArray(this.regions, 'region');
      const filtered = sorted.filter((i) => i.province === this.localEvent.location.province);

      return filtered;
    },

    canadianProvinces(): Record<string, unknown>[] {
      const provinces = helpers.enumToTranslatedCollection(ECanadaProvinces, 'common.provinces');
      const index = provinces.findIndex((e) => e.value === ECanadaProvinces.OT);

      // Put the "Other" option at the bottom of the list
      return [
        ...provinces.slice(0, index),
        ...provinces.slice(index + 1),
        provinces[index],
      ];
    },

    responseLevels(): Record<string, unknown>[] {
      return helpers.enumToTranslatedCollection(EResponseLevel, 'event.response_level');
    },

    eventTypesSorted(): Array<IOptionItem> {
      return useEventStore().getEventTypes(true, this.localEvent.responseDetails?.eventType?.optionItemId);
    },

    rules(): Record<string, unknown> {
      return {
        location: {
          province: {
            required: true,
          },
          provinceOther: {
            required: true,
            max: MAX_LENGTH_MD,
          },
          region: {
            max: MAX_LENGTH_MD,
          },
        },
        name: {
          required: true,
          max: MAX_LENGTH_MD,
          customValidator: { isValid: this.isNameUnique, messageKey: 'validations.alreadyExists' },
        },
        responseDetails: {
          responseLevel: {
            required: true,
          },
          eventType: {
            required: true,
          },
          eventTypeOther: {
            required: true,
          },
          assistanceNumber: {
            phoneRequired: true,
            phone: true,
          },
          dateReported: {
            required: true,
            mustBeBeforeOrSame: { X: this.event.responseDetails.dateReported, Y: this.today },
          },
        },
        schedule: {
          scheduledOpenDate: {
            ...this.scheduledOpenDateRule,
          },
          scheduledCloseDate: {
            ...this.scheduledCloseDateRule,
          },
          reOpenReason: {
            required: true,
          },
        },
        description: {
          max: MAX_LENGTH_LG,
        },
      };
    },

    scheduledOpenDateRule(): Record<string, unknown> {
      if (this.localEvent.schedule.scheduledOpenDate && this.localEvent.schedule.scheduledCloseDate) {
        return {
          mustBeBeforeOrSame: { X: this.localEvent.schedule.scheduledOpenDate, Y: this.localEvent.schedule.scheduledCloseDate },
        };
      }
      return null;
    },

    scheduledCloseDateRule(): Record<string, unknown> {
      if (this.localEvent.schedule.scheduledOpenDate && this.localEvent.schedule.scheduledCloseDate) {
        return {
          mustBeAfterOrSame: { X: this.localEvent.schedule.scheduledCloseDate, Y: this.localEvent.schedule.scheduledOpenDate },
        };
      }
      return null;
    },

    statusColor(): string {
      if (this.isStatusOpen) {
        return 'status_success white--text';
      }
      return 'status_green_pale black--text';
    },

    prefixRegistrationLink(): string {
      const prefix = useTenantSettingsStore().currentTenantSettings;
      if (!prefix?.registrationDomain) {
        return null;
      }
      const urlStart = `https://${prefix.registrationDomain.translation[this.languageMode]}`;
      return `${urlStart}/${this.languageMode}/registration/`;
    },

    registrationLink(): string {
      if (this.isEditMode) {
        return this.localEvent.registrationLink.translation[this.languageMode];
      }

      const link = libHelpers.encodeUrl(this.localEvent.name.translation[this.languageMode]);

      return link;
    },

    showReOpenInput(): boolean {
      return this.isEditMode
        && this.initialStatus === EEventStatus.OnHold
        && this.localEvent.schedule.status === EEventStatus.Open
        && this.localEvent.hasBeenOpen;
    },

    today(): string {
      return this.getLocalStringDate(new Date(), 'local');
    },
  },

  watch: {
    localEvent: {
      handler(newEvent) {
        this.$emit('update:event', newEvent);
      },
      deep: true,
    },

    eventType() {
      if (!this.eventType || !this.eventType.isOther) {
        this.localEvent.responseDetails.eventType.specifiedOther = '';
      }
    },

    provinceOther(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.localEvent.location.region = utils.initMultilingualAttributes();
      }
    },
  },

  async created() {
    if (!this.isEditMode) {
      this.localEvent.responseDetails.dateReported = this.today;
    }

    await useEventStore().fetchEventTypes();
    this.otherProvinces = await useEventStore().fetchOtherProvinces();
    this.regions = await useEventStore().fetchRegions();

    if (this.localEvent && this.localEvent.responseDetails.eventType.optionItemId) {
      this.eventType = this.eventTypesSorted.find((e) => e.id === this.localEvent.responseDetails.eventType.optionItemId);
    }

    // Set the default event type
    if (!this.isEditMode) {
      const defaultEventType = this.eventTypesSorted.find((t) => t.isDefault);

      if (defaultEventType) {
        this.localEvent.responseDetails.eventType.optionItemId = defaultEventType.id;
        this.eventType = defaultEventType;
      }
    }
  },

  methods: {
    copyRegistrationLink() {
      helpers.copyToClipBoard(`${this.prefixRegistrationLink}${this.registrationLink}`);
      this.$toasted.global.success(this.$t('eventSummary.copyLinkSuccessful'));
    },

    setLanguageMode(lang: string) {
      this.languageMode = lang;
      this.localEvent.fillEmptyMultilingualAttributes();
    },

    setAssistanceNumber(p: { number: string; countryCode: string; e164Number: string }) {
      this.assistanceNumber = p;
      this.localEvent.responseDetails.assistanceNumber = p.e164Number;
    },

    setRelatedEvents(eventsIds: Array<string>) {
      this.localEvent.relatedEventIds = eventsIds;
      this.$emit('update:is-dirty', true);
    },

    clearRegionAndOtherProvince() {
      this.localEvent.location.provinceOther = utils.initMultilingualAttributes();
      this.localEvent.location.region = utils.initMultilingualAttributes();
    },

    resetAsUnique() {
      if (!this.isNameUnique) {
        this.$emit('update:is-name-unique', true);
      }
    },

    clearDescription() {
      this.localEvent.description = utils.initMultilingualAttributes();
    },

    onSectionAdd(section: EEventSummarySections) {
      // set the current dialog data to the component corresponding to the section to add
      this.currentDialog = {
        component: EDialogComponent[EEventSummarySections[section]],
        isEditMode: false,
      };
    },
  },
});
</script>

<style scoped lang="scss">
.registration__link {
  display: flex;
  align-items: center;
  width: 100%;

  & > div {
    flex-grow: 2;
  }
}

.event_status {
  display: flex;
  align-items: center;
  padding: 10px;
  justify-content: space-between;
  margin-bottom: 20px;
  border-radius: 7px;
}
</style>
