<template>
  <validation-observer ref="form" v-slot="{ failed, dirty, changed }" slim>
    <page-content
      :title="headerTitle"
      :show-add-button="false"
      :show-back-button="true"
      @back="onCancel(dirty || changed)">
      <v-container>
        <v-row justify="center" class="my-8">
          <v-col md="10" sm="12">
            <v-row class="firstSection">
              <v-col md="9" sm="12">
                <div class="flex flex-row mb-4">
                  <h5 data-test="team-title" class="rc-heading-5 mr-3">
                    {{ teamTitle }}
                  </h5>
                  <validation-provider
                    name="status"
                    tag="div">
                    <status-select
                      data-test="team-status"
                      :value="team.status"
                      :statuses="statuses"
                      status-name="ETeamStatus"
                      :disabled="!isEditMode"
                      @input="onStatusChange($event)" />
                  </validation-provider>
                </div>

                <v-row>
                  <v-col cols="12" md="8">
                    <v-text-field-with-validation
                      v-model="team.name"
                      data-test="team-name"
                      :label="`${$t('teams.form.team_name')}*`"
                      :rules="rules.name"
                      @input="resetAsUnique()" />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-autocomplete-with-validation
                      data-test="team-contact"
                      :label="`${$t('teams.form.primary_contact')}*`"
                      :items="primaryContactUsers"
                      item-text="displayName"
                      :search-input.sync="primaryContactQuery"
                      :rules="rules.primaryContact"
                      :value="currentPrimaryContact"
                      hide-no-data
                      hide-selected
                      return-object
                      no-filter
                      :placeholder="$t('common.inputs.start_typing_to_search')"
                      @change="setPrimaryContact($event)"
                      @keydown="resetPrimaryContact()" />
                  </v-col>
                </v-row>

                <v-row>
                  <v-col cols="12">
                    <v-autocomplete-with-validation
                      data-test="events"
                      item-value="id"
                      :item-text="(item) => $m(item.name)"
                      :label="`${$t('teams.form.event')}${teamType === 'standard'?'': '*'}`"
                      :items="availableEvents"
                      :value="teamEventsIds"
                      :multiple="teamType === 'standard'"
                      :rules="rules.event"
                      @change="setEventIds($event)"
                      @delete="handleRemoveEvent($event)" />
                  </v-col>
                </v-row>

                <v-row>
                  <v-col cols="12" class="firstSection__actions">
                    <v-btn data-test="createEditTeam__cancel" @click="onCancel(dirty || changed)">
                      {{ $t('common.buttons.cancel') }}
                    </v-btn>
                    <v-btn
                      color="primary"
                      data-test="createEditTeam__submit"
                      :loading="isSubmitting"
                      :disabled="isSubmitDisabled(failed, dirty || changed)"
                      @click="submit()">
                      {{ submitLabel }}
                    </v-btn>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
            <v-row class="mt-12">
              <v-col class="pa-0">
                <team-members-table :team-members="[]" :is-edit-mode="isEditMode" />
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-container>
    </page-content>

    <rc-confirmation-dialog
      v-if="showCancelConfirmationDialog"
      data-test="createEditTeam__confirmCancelDialog"
      :show.sync="showCancelConfirmationDialog"
      :title="$t('confirmCancelDialog.title')"
      :messages="$t('confirmCancelDialog.message')"
      @submit="navigateToHome()"
      @cancel="showCancelConfirmationDialog = false"
      @close="showCancelConfirmationDialog = false" />

    <rc-confirmation-dialog
      v-if="showEventDeleteConfirmationDialog"
      data-test="createEditTeam__confirmEventDeleteDialog"
      :show.sync="showEventDeleteConfirmationDialog"
      :title="$t('team.event.confirmDeleteDialog.title')"
      :messages="deleteEventConfirmationMessage"
      @submit="handleRemoveEventConfirmation(true)"
      @cancel="handleRemoveEventConfirmation(false)"
      @close="handleRemoveEventConfirmation(false)" />
  </validation-observer>
</template>

<script lang="ts">
import Vue from 'vue';
import { Route, NavigationGuardNext } from 'vue-router';
import { TranslateResult } from 'vue-i18n';
import _difference from 'lodash/difference';

import {
  ETeamStatus, ETeamType, Team, ITeam,
} from '@/entities/team';
import { EEventStatus } from '@/entities/event';
import PageContent from '@/ui/views/components/layout/PageContent.vue';
import TeamMembersTable from '@/ui/views/pages/teams/create-edit/TeamMembersTable.vue';
import {
  VTextFieldWithValidation, VAutocompleteWithValidation, RcConfirmationDialog,
} from '@crctech/component-library';
import routes from '@/constants/routes';
import { MAX_LENGTH_MD } from '@/constants/validations';
import StatusSelect from '@/ui/shared-components/StatusSelect.vue';
import { VForm } from '@/types';
import { IAppUserAzureData } from '@/entities/app-user';

export default Vue.extend({
  name: 'CreateEditTeam',

  components: {
    PageContent,
    VTextFieldWithValidation,
    VAutocompleteWithValidation,
    TeamMembersTable,
    StatusSelect,
    RcConfirmationDialog,
  },

  beforeRouteEnter(to: Route, from: Route, next: NavigationGuardNext) {
    ['standard', 'adhoc'].indexOf(to.params.teamType) === -1 ? next(from) : next();
  },

  props: {
    teamType: {
      type: String,
      required: true,
    },
    id: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      isNameUnique: true,
      team: new Team() as ITeam,
      availableEvents: [],
      primaryContactQuery: '',
      primaryContactUsers: [] as IAppUserAzureData[],
      currentPrimaryContact: null as IAppUserAzureData,
      map: [null, 'standard', 'adhoc'],
      statuses: [ETeamStatus.Active, ETeamStatus.Inactive],
      showCancelConfirmationDialog: false,
      showEventDeleteConfirmationDialog: false,
      minimumContactQueryLength: 2,
      eventsIdsAfterRemoval: null as string[],
    };
  },

  computed: {
    deleteEventConfirmationMessage(): TranslateResult {
      if (this.eventsIdsAfterRemoval) {
        const removedEventId = _difference(this.teamEventsIds, this.eventsIdsAfterRemoval);
        const removedEvent = this.availableEvents?.find((ev) => ev.id === removedEventId[0]);
        const name = this.$m(removedEvent?.name);
        return this.$t('team.event.confirmDeleteDialog.message', { name });
      }
      return '';
    },

    headerTitle(): TranslateResult {
      if (this.isEditMode) {
        return this.$t('teams.edit_team');
      }
      return this.$t('teams.create_new_team');
    },

    isEditMode(): boolean {
      return this.$route.name === routes.teams.edit.name;
    },

    isSubmitting(): boolean {
      return this.$storage.team.getters.loading();
    },

    rules(): Record<string, unknown> {
      return {
        name: {
          required: true,
          max: MAX_LENGTH_MD,
          customValidator: { isValid: this.isNameUnique, messageKey: 'validations.alreadyExists' },
        },
        primaryContact: {
          required: true,
        },
        event: {
          required: this.teamType === 'adhoc',
        },
      };
    },

    submitLabel(): TranslateResult {
      return this.isEditMode ? this.$t('common.save') : this.$t('common.buttons.create');
    },

    teamEventsIds(): string | string[] {
      // For simple dropdown
      if (this.team.teamType === ETeamType.AdHoc) {
        return this.team.eventIds[0];
      }
      // For multiselect dropdown
      return this.team.eventIds;
    },

    teamTitle(): TranslateResult {
      if (this.map.indexOf(this.teamType) === ETeamType.Standard) {
        return this.$t('teams.types.standard');
      }
      return this.$t('teams.types.adhoc');
    },
  },

  watch: {
    primaryContactQuery() {
      this.searchPrimaryContacts();
    },
  },

  async mounted() {
    await this.fetchEvents();
    if (!this.isEditMode) {
      this.team.teamType = this.teamType === 'standard' ? ETeamType.Standard : ETeamType.AdHoc;
      this.team.status = ETeamStatus.Active;
    } else {
      await this.loadTeam();
    }
  },

  methods: {

    async fetchEvents() {
      const res = await this.$storage.event.actions.searchEvents({ filter: { Schedule: { Status: EEventStatus.Open } } });
      this.availableEvents = res?.value;
    },

    handleRemoveEvent(leftEvents: string[]) {
      this.eventsIdsAfterRemoval = leftEvents;
      this.showEventDeleteConfirmationDialog = true;
    },

    handleRemoveEventConfirmation(confirm: boolean) {
      const eventsIds = confirm ? this.eventsIdsAfterRemoval : [...this.team.eventIds];
      this.setEventIds(eventsIds);
      this.showEventDeleteConfirmationDialog = false;
    },

    handleSubmitError(e: Error) {
      // Temporary custom check until an error handling system is put in place
      if (Array.isArray(e) && e.includes('Team name already exists ')) {
        this.isNameUnique = false;
      } else {
        // Handle all other errors
        this.$toasted.global.error(this.$t('error.unexpected_error'));
      }
    },

    isSubmitDisabled(isFailed: boolean, isChanged:boolean) {
      return isFailed || (this.isEditMode && !isChanged);
    },

    async loadTeam() {
      const teamId = this.id;
      if (teamId) {
        this.team = await this.$storage.team.actions.getTeam(teamId);
        const primaryContactData = this.team.getPrimaryContact();
        // Set the primary contact
        if (primaryContactData) {
          const user = this.$storage.appUser.getters.appUserWhere('id', primaryContactData.id);
          this.currentPrimaryContact = {
            id: user.id,
            displayName: user.displayName,
            roles: null,
          };
          this.primaryContactQuery = user.displayName;
        }
      }
    },

    navigateToHome() {
      this.$router.push({ name: routes.teams.home.name });
    },

    async onCancel(isChanged: boolean) {
      if (isChanged) {
        this.showCancelConfirmationDialog = true;
      } else {
        this.navigateToHome();
      }
    },

    onStatusChange(status: ETeamStatus) {
      this.team.status = status;
    },

    resetAsUnique() {
      if (!this.isNameUnique) {
        this.isNameUnique = true;
      }
    },

    async searchPrimaryContacts() {
      const query = this.primaryContactQuery;

      if (query && query.length >= this.minimumContactQueryLength) {
        this.primaryContactUsers = this.$storage.appUser.getters.appUserWithNameContaining(query);
      } else {
        this.primaryContactUsers = [];
      }
    },

    setEventIds(eventId: string | Array<string>) {
      // if single select is used (for adhoc teams)
      if (typeof eventId === 'string') {
        this.team.eventIds = [eventId];
      // if multiple select is used (for standard teams)
      } else {
        this.team.eventIds = eventId;
      }
    },

    resetPrimaryContact() {
      this.currentPrimaryContact = null;
    },

    resetFormValidation() {
      (this.$refs.form as VForm).reset();
    },

    setPrimaryContact(appUser: IAppUserAzureData) {
      this.team.setPrimaryContact(appUser.id);
      this.currentPrimaryContact = appUser;
    },

    async submit() {
      const isValid = await (this.$refs.form as VForm).validate();
      if (!isValid) return;

      if (!this.isEditMode) {
        this.submitCreateTeam();
      } else {
        this.submitEditTeam();
      }
    },

    async submitCreateTeam() {
      try {
        const newTeam = await this.$storage.team.actions.createTeam(this.team);

        const message:TranslateResult = this.team.teamType === ETeamType.Standard
          ? this.$t('teams.standard_team_created')
          : this.$t('teams.adhoc_team_created');
        this.$toasted.global.success(message);

        this.team.id = newTeam.id;
        this.$router.replace({ name: routes.teams.edit.name, params: { id: newTeam.id, teamType: this.teamType } });
        this.resetFormValidation();
      } catch (e) {
        this.handleSubmitError(e);
      }
    },

    async submitEditTeam() {
      try {
        await this.$storage.team.actions.editTeam(this.team);
        this.$toasted.global.success(this.$t('teams.team_updated'));
        this.resetFormValidation();
      } catch (e) {
        this.handleSubmitError(e);
      }
    },

  },
});
</script>

<style scoped lang="scss">

.firstSection {
  display: flex;
  flex-direction: column;
  align-items: center;
  border: solid 1px var(--v-grey-lighten2);
  border-radius: 4px;
  padding-top: 16px;
  padding-bottom: 32px;

  &__actions {
    display: flex;
    justify-content: flex-end;

    button {
      margin: 0 0 0 16px;
    }
  }
}

</style>
