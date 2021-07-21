<template>
  <validation-observer ref="form" v-slot="{ failed, dirty }" slim>
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
                  :show-members="isEditMode"
                  :show-search="isEditMode"
                  :disable-add-members="!isEditMode" />
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
  ETeamStatus, ETeamType, ITeamEvent, Team, ITeam, ITeamMemberData,
} from '@/entities/team';
import { EEventStatus, IEventEntity } from '@/entities/event';
import TeamMembersTable from '@/ui/views/pages/teams/components/TeamMembersTable.vue';
import {
  RcConfirmationDialog,
  RcPageContent,
  VAutocompleteWithValidation,
  VTextFieldWithValidation,
} from '@crctech/component-library';
import routes from '@/constants/routes';
import { MAX_LENGTH_MD } from '@/constants/validations';
import StatusSelect from '@/ui/shared-components/StatusSelect.vue';
import { VForm } from '@/types';
import { IUserAccountCombined } from '@/entities/user-account';
import _isEqual from 'lodash/isEqual';
import _sortBy from 'lodash/sortBy';
import handleUniqueNameSubmitError from '@/ui/mixins/handleUniqueNameSubmitError';

export default mixins(handleUniqueNameSubmitError).extend({

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
      primaryContactQuery: '',
      userAccounts: [] as IUserAccountCombined[],
      primaryContactUsers: [] as ITeamMemberData[],
      currentPrimaryContact: null as ITeamMemberData,
      map: [null, 'standard', 'adhoc'],
      statuses: [ETeamStatus.Active, ETeamStatus.Inactive],
      showCancelConfirmationDialog: false,
      showEventDeleteConfirmationDialog: false,
      minimumContactQueryLength: 1,
      eventsAfterRemoval: null as ITeamEvent[],
      team: null as ITeam,
      isLoading: true,
      availableEvents: [] as ITeamEvent[],
      original: {
        name: null,
        events: null as ITeamEvent[],
        primaryContact: null as ITeamMemberData,
      },
    };
  },

  computed: {
    deleteEventConfirmationMessage(): TranslateResult {
      if (this.eventsAfterRemoval) {
        const removedEvent = _difference(this.team.events, this.eventsAfterRemoval);
        const name = this.$m((removedEvent[0] as ITeamEvent)?.name);
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
    changed(): boolean {
      return !_isEqual(this.original, {
        name: this.team.name,
        status: this.team.status,
        events: this.teamType === 'standard' ? _sortBy(this.team.events, ['id']) : this.team.events[0],
        primaryContact: (this.currentPrimaryContact || {}).emailAddress,
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
    await this.fetchEvents();
    await this.fetchUserAccounts();
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
      this.$data.original = _cloneDeep({
        name: this.team.name,
        status: this.team.status,
        events: this.teamType === 'standard' ? _sortBy(this.team.events, ['id']) : this.team.events[0],
        primaryContact: (this.currentPrimaryContact || {}).emailAddress,
      });
    },
    async fetchEvents() {
      await this.$storage.event.actions.search();
    },
    getAvailableEvents() {
      const eventsByStatus:IEventEntity[] = this.$storage.event.getters.eventsByStatus([EEventStatus.Open, EEventStatus.OnHold]);
      if (eventsByStatus) {
        const activeEvents: ITeamEvent[] = eventsByStatus.map((e: IEventEntity) => ({
          id: e.id,
          name: e.name,
        }));

        let existingInactiveEvents = [] as ITeamEvent[];
        if (this.isEditMode) {
          existingInactiveEvents = this.team.events.filter((ev: ITeamEvent) => !activeEvents.find((e) => e.id === ev.id));
        }
        this.availableEvents = [...existingInactiveEvents, ...activeEvents];
      }
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

    isSubmitDisabled(isFailed: boolean, isChanged:boolean) {
      return isFailed || (this.isEditMode && !isChanged);
    },

    async loadTeam() {
      const teamId = this.id;
      if (teamId) {
        await this.$storage.team.actions.getTeam(teamId);
        this.team = _cloneDeep(this.$storage.team.getters.team());
        this.currentPrimaryContact = this.team.getPrimaryContact();
        if (this.currentPrimaryContact) {
          this.primaryContactQuery = this.currentPrimaryContact.displayName;
        }
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

    onStatusChange(status: ETeamStatus) {
      this.team.status = status;
    },

    async searchPrimaryContacts() {
      const query = this.primaryContactQuery;

      if (query && query.length >= this.minimumContactQueryLength) {
        const userMatches:IUserAccountCombined[] = this.$storage.userAccount.getters.getByCriteria(query, false, ['displayName']);
        this.primaryContactUsers = userMatches.map(
          (u) => ({ ...u.entity, ...u.metadata, isPrimaryContact: u.entity.id === this.currentPrimaryContact?.id }),
        );
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

    setPrimaryContact(appUser: ITeamMemberData) {
      this.currentPrimaryContact = appUser;
    },

    setEvents(events: ITeamEvent | ITeamEvent[]) {
      this.team.setEvents(events);
    },

    async submit() {
      const isValid = await (this.$refs.form as VForm).validate();
      if (!isValid) return;

      this.setPrimaryContactTeam();

      if (!this.isEditMode) {
        await this.submitCreateTeam();
      } else {
        await this.submitEditTeam();
        this.getAvailableEvents();
      }
      this.setOriginalData();
    },

    setPrimaryContactTeam() {
      this.team.setPrimaryContact(
        {
          ...this.currentPrimaryContact,
          isPrimaryContact: true,
        },
      );
    },

    async submitCreateTeam() {
      try {
        const res = await this.$storage.team.actions.createTeam(this.team);

        this.team = _cloneDeep(res);

        const message: TranslateResult = this.team.teamType === ETeamType.Standard
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
      } catch (errors) {
        this.handleSubmitError(errors);
      }
    },

    prepareCreateTeam() {
      this.team = new Team();
      this.team.teamType = this.teamType === 'standard' ? ETeamType.Standard : ETeamType.AdHoc;
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
