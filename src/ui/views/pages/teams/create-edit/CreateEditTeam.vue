<template>
  <validation-observer ref="form" v-slot="{ failed, dirty, changed }" slim>
    <rc-page-content
      :title="headerTitle"
      :show-add-button="false"
      :show-back-button="true"
      :help-link="$t('zendesk.help_link.teams.create')"
      show-help
      @back="onCancel(dirty || changed)">
      <v-container v-if="isLoading">
        <v-row justify="center">
          <v-col cols="12" lg="10" class="mt-10">
            <v-skeleton-loader class="my-6" type="article" />
            <v-skeleton-loader class="my-6" type="article" />
            <v-skeleton-loader class="my-6" type="article" />
          </v-col>
        </v-row>
      </v-container>
      <v-container v-else>
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
                      :disabled="!isEditMode || !$hasLevel('level5')"
                      @input="onStatusChange($event)" />
                  </validation-provider>
                </div>

                <v-row>
                  <v-col cols="12" md="8">
                    <v-text-field-with-validation
                      v-model="team.name"
                      data-test="team-name"
                      :label="`${$t('teams.form.team_name')}*`"
                      :disabled="!$hasLevel('level5')"
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
                      :disabled="!$hasLevel('level5')"
                      :placeholder="$t('common.inputs.start_typing_to_search')"
                      @change="setPrimaryContact($event)"
                      @keydown.delete="resetPrimaryContact()" />
                  </v-col>
                </v-row>

                <v-row>
                  <v-col cols="12">
                    <v-autocomplete-with-validation
                      return-object
                      data-test="events"
                      :item-text="(item) => $m(item.name)"
                      :label="`${$t('teams.form.event')}${teamType === 'standard' ? '': '*'}`"
                      :items="availableEvents"
                      :value="teamType === 'standard'? team.events: team.events[0]"
                      :multiple="teamType === 'standard'"
                      :rules="rules.event"
                      :disabled="!$hasLevel('level5')"
                      @change="setEvents($event)"
                      @delete="handleRemoveEvent($event)" />
                  </v-col>
                </v-row>

                <v-row>
                  <v-col cols="12" class="firstSection__actions">
                    <v-btn
                      :disabled="!$hasLevel('level5')"
                      data-test="createEditTeam__cancel"
                      @click="onCancel(dirty || changed)">
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
                <team-members-table
                  data-test="team-members-table"
                  :team="team"
                  :is-edit-mode="isEditMode" />
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-container>
    </rc-page-content>

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
  ETeamStatus, ETeamType, Team, ITeamEvent,
} from '@/entities/team';
import { IEvent } from '@/entities/event';
import TeamMembersTable from '@/ui/views/pages/teams/create-edit/TeamMembersTable.vue';
import {
  VTextFieldWithValidation, VAutocompleteWithValidation, RcConfirmationDialog, RcPageContent,
} from '@crctech/component-library';
import routes from '@/constants/routes';
import { MAX_LENGTH_MD } from '@/constants/validations';
import StatusSelect from '@/ui/shared-components/StatusSelect.vue';
import { IMultilingual, VForm } from '@/types';
import { IAppUserData } from '@/entities/app-user';

export default Vue.extend({
  name: 'CreateEditTeam',

  components: {
    RcPageContent,
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
      primaryContactQuery: '',
      primaryContactUsers: [] as IAppUserData[],
      currentPrimaryContact: null as IAppUserData,
      map: [null, 'standard', 'adhoc'],
      statuses: [ETeamStatus.Active, ETeamStatus.Inactive],
      showCancelConfirmationDialog: false,
      showEventDeleteConfirmationDialog: false,
      minimumContactQueryLength: 1,
      eventsAfterRemoval: null as ITeamEvent[],
    };
  },

  computed: {
    availableEvents(): {id: string; name: IMultilingual}[] {
      return this.$storage.event.getters.openEvents().map((e) => ({
        id: e.id,
        name: e.name,
      }));
    },
    deleteEventConfirmationMessage(): TranslateResult {
      if (this.eventsAfterRemoval) {
        const removedEvent = _difference(this.team.events, this.eventsAfterRemoval);
        const name = this.$m(removedEvent[0]?.name);
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
      return this.$store.state.team.submitLoading;
    },

    isLoading(): boolean {
      return this.$store.state.team.getLoading;
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

    teamTitle(): TranslateResult {
      if (this.map.indexOf(this.teamType) === ETeamType.Standard) {
        return this.$t('teams.types.standard');
      }
      return this.$t('teams.types.adhoc');
    },

    team(): Team {
      return this.$storage.team.getters.team();
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
      this.$storage.team.mutations.resetTeam();
      this.team.teamType = this.teamType === 'standard' ? ETeamType.Standard : ETeamType.AdHoc;
      this.team.status = ETeamStatus.Active;
    } else {
      await this.loadTeam();
    }
  },

  methods: {

    async fetchEvents() {
      await this.$storage.event.actions.fetchEvents();
    },

    handleRemoveEvent(leftEvents: ITeamEvent[]) {
      this.eventsAfterRemoval = leftEvents;
      this.showEventDeleteConfirmationDialog = true;
    },

    handleRemoveEventConfirmation(confirm: boolean) {
      const newEvents = confirm ? this.eventsAfterRemoval : [...this.team.events];
      this.team.setEvents(newEvents);
      this.showEventDeleteConfirmationDialog = false;
    },

    handleSubmitError(e: Error) {
      // Temporary custom check until an error handling system is put in place
      if (Array.isArray(e) && e[0].includes('already exists')) {
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
        await this.$storage.team.actions.getTeam(teamId);

        this.currentPrimaryContact = this.team.getPrimaryContact();
        if (this.currentPrimaryContact) {
          this.primaryContactQuery = this.currentPrimaryContact.displayName;
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
        this.primaryContactUsers = this.$storage.appUser.getters.searchAppUser(query, false, ['displayName']);
      } else {
        this.primaryContactUsers = [];
      }
    },

    resetPrimaryContact() {
      this.currentPrimaryContact = null;
    },

    resetFormValidation() {
      (this.$refs.form as VForm).reset();
    },

    setPrimaryContact(appUser: IAppUserData) {
      this.currentPrimaryContact = appUser;
    },

    setEvents(events: IEvent | IEvent[]) {
      this.team.setEvents(events);
    },

    async submit() {
      const isValid = await (this.$refs.form as VForm).validate();
      if (!isValid) return;
      this.team.setPrimaryContact(this.currentPrimaryContact);
      if (!this.isEditMode) {
        await this.submitCreateTeam();
      } else {
        await this.submitEditTeam();
      }
    },

    async submitCreateTeam() {
      try {
        await this.$storage.team.actions.createTeam(this.team);

        const message:TranslateResult = this.team.teamType === ETeamType.Standard
          ? this.$t('teams.standard_team_created')
          : this.$t('teams.adhoc_team_created');

        this.$toasted.global.success(message);

        await this.$router.replace({ name: routes.teams.edit.name, params: { id: this.team.id, teamType: this.teamType } });

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
