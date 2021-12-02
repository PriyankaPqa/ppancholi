<template>
  <validation-observer ref="form" v-slot="{ failed, dirty }" slim>
    <rc-page-content
      :title="headerTitle"
      :show-add-button="false"
      :show-back-button="true"
      :help-link="$t('zendesk.help_link.teams.create')"
      :show-help="false"
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
                      status-name="Status"
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
                      :item-value="(item) => item.id"
                      :label="`${$t('teams.form.event')}${teamType === 'standard' ? '': '*'}`"
                      :items="availableEvents"
                      :value="teamType === 'standard'? team.eventIds: team.eventIds[0]"
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
                      :disabled="isSubmitDisabled(failed, changed)"
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
                  :team-id="team.id"
                  :show-members="isEditMode"
                  :show-search="isEditMode"
                  :disable-add-members="!isEditMode" />
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-container>
    </rc-page-content>

    <rc-dialog
      v-if="showErrorDialog"
      max-width="750"
      :show-submit="false"
      :cancel-action-label="$t('common.buttons.ok')"
      data-test="createEditTeam__ErrorDialog"
      :show.sync="showErrorDialog"
      :title="$t('errors.team.has-activefile')"
      @cancel="showErrorDialog = false"
      @close="showErrorDialog = false">
      <div class="rc-body14">
        {{ $t('errors.team-has-active-case-file') }}
      </div>
    </rc-dialog>

    <rc-confirmation-dialog
      v-if="showCancelConfirmationDialog"
      data-test="createEditTeam__confirmCancelDialog"
      :show.sync="showCancelConfirmationDialog"
      :title="$t('confirmCancelDialog.title')"
      :messages="$t('confirmCancelDialog.message')"
      @submit="goBack()"
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
import mixins from 'vue-typed-mixins';
import { NavigationGuardNext, Route } from 'vue-router';
import { TranslateResult } from 'vue-i18n';
import _difference from 'lodash/difference';
import _cloneDeep from 'lodash/cloneDeep';
import {
  RcConfirmationDialog,
  RcDialog,
  RcPageContent,
  VAutocompleteWithValidation,
  VTextFieldWithValidation,
} from '@crctech/component-library';
import _isEqual from 'lodash/isEqual';
import _sortBy from 'lodash/sortBy';
import {
  TeamType, ITeamEvent, TeamEntity, ITeamEntity,
} from '@/entities/team';
import { EEventStatus, IEventCombined, IEventEntity } from '@/entities/event';
import TeamMembersTable from '@/ui/views/pages/teams/components/TeamMembersTable.vue';
import routes from '@/constants/routes';
import { MAX_LENGTH_MD } from '@/constants/validations';
import StatusSelect from '@/ui/shared-components/StatusSelect.vue';
import { VForm } from '@/types';
import { IUserAccountCombined } from '@/entities/user-account';
import handleUniqueNameSubmitError from '@/ui/mixins/handleUniqueNameSubmitError';
import { Status } from '@/entities/base';

interface UserTeamMember {
  isPrimaryContact: boolean,
  displayName: string,
  id: string,
  email: string,
}

export default mixins(handleUniqueNameSubmitError).extend({

  name: 'CreateEditTeam',

  components: {
    RcPageContent,
    VTextFieldWithValidation,
    VAutocompleteWithValidation,
    TeamMembersTable,
    StatusSelect,
    RcDialog,
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
      primaryContactQuery: '',
      userAccounts: [] as IUserAccountCombined[],
      primaryContactUsers: [] as UserTeamMember[],
      currentPrimaryContact: null as UserTeamMember,
      map: [null, 'standard', 'adhoc'],
      statuses: [Status.Active, Status.Inactive],
      showCancelConfirmationDialog: false,
      showEventDeleteConfirmationDialog: false,
      minimumContactQueryLength: 1,
      eventsAfterRemoval: null as string[],
      team: null as ITeamEntity,
      isLoading: true,
      availableEvents: [] as ITeamEvent[],
      original: {
        name: null as string,
        status: null as Status,
        events: null as string | string[],
        primaryContact: null as string,
      },
      showErrorDialog: false,
      isSubmitting: false,
    };
  },

  computed: {
    deleteEventConfirmationMessage(): TranslateResult {
      if (this.eventsAfterRemoval) {
        const removedEvent = _difference(this.team.eventIds, this.eventsAfterRemoval);
        const name = this.$m((this.availableEvents.find((e: ITeamEvent) => e.id === removedEvent[0]))?.name);
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
      if (this.map.indexOf(this.teamType) === TeamType.Standard) {
        return this.$t('teams.types.standard');
      }
      return this.$t('teams.types.adhoc');
    },

    changed(): boolean {
      return !_isEqual(this.original, {
        name: this.team.name,
        status: this.team.status,
        events: this.teamType === 'standard' ? _sortBy(this.team.eventIds) : this.team.eventIds[0],
        primaryContact: (this.currentPrimaryContact || {}).email,
      });
    },
  },

  watch: {
    primaryContactQuery() {
      this.searchPrimaryContacts();
    },
  },

  async mounted() {
    this.isLoading = true;
    await Promise.all([this.fetchEvents(), this.fetchUserAccounts()]);
    if (!this.isEditMode) {
      this.prepareCreateTeam();
    } else {
      await this.loadTeam();
    }
    this.getAvailableEvents();
    this.setOriginalData();
    this.isLoading = false;
  },

  methods: {
    setOriginalData() {
      this.original = _cloneDeep({
        name: this.team.name,
        status: this.team.status,
        events: this.teamType === 'standard' ? _sortBy(this.team.eventIds) : this.team.eventIds[0],
        primaryContact: (this.currentPrimaryContact || {}).email,
      });
    },

    async fetchEvents() {
      await this.$storage.event.actions.fetchAllIncludingInactive();
    },

    getAvailableEvents() {
      const allEvents:IEventEntity[] = this.$storage.event.getters.getAll().map((e: IEventCombined) => e.entity);
      const eventsByStatus:IEventEntity[] = this.$storage.event.getters.eventsByStatus([EEventStatus.Open, EEventStatus.OnHold]);
      if (eventsByStatus) {
        const activeEvents: ITeamEvent[] = eventsByStatus.map((e: IEventEntity) => ({
          id: e.id,
          name: e.name,
        }));

        let existingInactiveEvents = [] as ITeamEvent[];
        if (this.isEditMode) {
          const selectedEvents = allEvents.filter((e) => this.team.eventIds.indexOf(e.id) > -1);
          existingInactiveEvents = selectedEvents.filter((ev: ITeamEvent) => !activeEvents.find((e) => e.id === ev.id));
        }
        this.availableEvents = [...existingInactiveEvents, ...activeEvents];
      }
    },

    handleRemoveEvent(leftEvents: (ITeamEvent | string)[]) {
      this.eventsAfterRemoval = leftEvents.map((x) => (typeof x === 'string' ? x : x.id));
      this.showEventDeleteConfirmationDialog = true;
    },

    handleRemoveEventConfirmation(confirm: boolean) {
      const newEvents = confirm ? this.eventsAfterRemoval : [...this.team.eventIds];
      this.team.setEventIds(newEvents);
      this.showEventDeleteConfirmationDialog = false;
    },

    isSubmitDisabled(isFailed: boolean, isChanged:boolean) {
      return isFailed || (this.isEditMode && !isChanged);
    },

    async loadTeam() {
      const teamId = this.id;
      if (teamId) {
        await this.$storage.team.actions.fetch(teamId);
        this.loadTeamFromState();
      }
    },

    loadTeamFromState() {
      this.team = new TeamEntity(_cloneDeep(this.$storage.team.getters.get(this.id).entity));
      this.currentPrimaryContact = !this.team.getPrimaryContact() ? null
        : this.mapToTeamMember(this.$storage.userAccount.getters.get(this.team.getPrimaryContact().id), true);
      if (this.currentPrimaryContact) {
        this.primaryContactQuery = this.currentPrimaryContact.displayName;
      }
    },

    goBack() {
      const backRouteName = this.$route.params.from ? this.$route.params.from : routes.teams.home.name;
      this.$router.push({ name: backRouteName });
    },

    async onCancel(isChanged: boolean) {
      if (isChanged) {
        this.showCancelConfirmationDialog = true;
      } else {
        this.goBack();
      }
    },

    onStatusChange(status: Status) {
      this.team.status = status;
    },

    async searchPrimaryContacts() {
      const query = this.primaryContactQuery;

      if (query && query.length >= this.minimumContactQueryLength) {
        const userMatches:IUserAccountCombined[] = this.$storage.userAccount.getters.getByCriteria(query, false, ['displayName']);
        this.primaryContactUsers = _sortBy(userMatches.map(
          (u) => this.mapToTeamMember(u, u.entity.id === this.currentPrimaryContact?.id),
        ), 'displayName');
      } else {
        this.primaryContactUsers = [];
      }
    },

    mapToTeamMember(u: IUserAccountCombined, isPrimaryContact: boolean): UserTeamMember {
      return {
        id: u.entity.id,
        email: u.metadata.emailAddress || u.metadata.userPrincipalName,
        displayName: u.metadata.displayName,
        isPrimaryContact,
      };
    },

    resetPrimaryContact() {
      this.currentPrimaryContact = null;
    },

    resetFormValidation() {
      (this.$refs.form as VForm).reset();
    },

    setPrimaryContact(appUser: UserTeamMember) {
      this.currentPrimaryContact = appUser;
    },

    setEvents(events: (ITeamEvent | string) | (ITeamEvent | string)[]) {
      const ids = (Array.isArray(events) ? events : [events]).map((x) => (typeof x === 'string' ? x : x.id));
      this.team.setEventIds(ids);
    },

    async submit() {
      const isValid = await (this.$refs.form as VForm).validate();
      if (!isValid) {
        return;
      }

      this.setPrimaryContactTeam();
      if (!this.isEditMode) {
        await this.submitCreateTeam();
      } else {
        await this.submitEditTeam();
        this.getAvailableEvents();
      }
    },

    setPrimaryContactTeam() {
      this.team.setPrimaryContact(
        {
          id: this.currentPrimaryContact.id,
          isPrimaryContact: true,
        },
      );
    },

    async submitCreateTeam() {
      try {
        this.isSubmitting = true;
        const res = await this.$storage.team.actions.createTeam(this.team);

        this.team = new TeamEntity(_cloneDeep(res));

        const message: TranslateResult = this.team.teamType === TeamType.Standard
          ? this.$t('teams.standard_team_created')
          : this.$t('teams.adhoc_team_created');

        this.$toasted.global.success(message);

        await this.$router.replace({ name: routes.teams.edit.name, params: { id: this.team.id, teamType: this.teamType } });

        this.resetFormValidation();
        this.setOriginalData();
      } catch (e) {
        this.handleSubmitError(e);
      } finally {
        this.isSubmitting = false;
      }
    },

    async submitEditTeam() {
      try {
        this.isSubmitting = true;
        await this.$storage.team.actions.editTeam(this.team);
        this.$toasted.global.success(this.$t('teams.team_updated'));
        this.resetFormValidation();
        this.setOriginalData();
      } catch (errors) {
        if (errors.length > 0 && errors[0].code === 'errors.team-has-active-case-file') {
          this.showErrorDialog = true;
        } else {
          this.handleSubmitError(errors);
        }
        this.loadTeamFromState();
      } finally {
        this.isSubmitting = false;
      }
    },

    prepareCreateTeam() {
      this.team = new TeamEntity();
      this.team.status = Status.Active;
      this.team.teamType = this.teamType === 'standard' ? TeamType.Standard : TeamType.AdHoc;
    },

    async fetchUserAccounts() {
      this.userAccounts = await this.$storage.userAccount.actions.fetchAll();
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
