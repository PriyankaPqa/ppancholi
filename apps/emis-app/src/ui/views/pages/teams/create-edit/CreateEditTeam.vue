<template>
  <validation-observer ref="form" v-slot="{ failed, dirty }" slim>
    <rc-page-content
      :title="headerTitle"
      :show-add-button="false"
      :show-back-button="true"
      content-padding="0"
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
        <v-row justify="center" class="my-4">
          <v-col md="10" sm="12">
            <v-row class="firstSection">
              <v-col md="9" sm="12">
                <div class="flex flex-row mb-4">
                  <div data-test="team-title" class="rc-heading-5 mr-3">
                    {{ teamTitle }}
                  </div>
                  <validation-provider
                    name="status"
                    tag="div">
                    <status-select
                      data-test="team-status"
                      :value="team.status"
                      :statuses="statuses"
                      status-name="Status"
                      :disabled="!isEditMode || !$hasLevel(UserRoles.level5)"
                      @input="onStatusChange($event)" />
                  </validation-provider>
                </div>

                <div v-if="hasCheckBoxes" class="mb-4 d-flex flex-column">
                  <div v-if="$hasFeature($featureKeys.TaskManagement)">
                    <v-checkbox-with-validation
                      v-if="teamType === 'adhoc'"
                      v-model="team.isEscalation"
                      :label="$t('teams.set_escalation_team')"
                      data-test="team-isEscalation-checkbox"
                      :disabled="!$hasLevel(UserRoles.level5)" />

                    <v-checkbox-with-validation
                      v-model="team.isAssignable"
                      :disabled="team.isEscalation || !$hasLevel(UserRoles.level5)"
                      :label="$t('teams.set_assignable_team')"
                      data-test="team-isAssignable-checkbox"
                      class="team-checkbox" />
                  </div>

                  <div v-if="$hasFeature($featureKeys.Lodging)">
                    <v-checkbox-with-validation
                      v-model="team.useForLodging"
                      :disabled="!$hasLevel(UserRoles.level5)"
                      :label="$t('teams.set_useForLodging')"
                      data-test="team-useForLodging-checkbox"
                      class="team-checkbox" />
                  </div>

                  <div v-if="$hasFeature($featureKeys.AppointmentBooking)">
                    <v-checkbox-with-validation
                      v-model="team.useForAppointments"
                      :label="$t('teams.set_appointments_team')"
                      data-test="team-isAppointmentBooking-checkbox"
                      :disabled="!$hasLevel(UserRoles.level5)"
                      class="team-checkbox" />
                  </div>
                </div>

                <v-row>
                  <v-col cols="12" md="8">
                    <v-text-field-with-validation
                      v-model="team.name"
                      data-test="team-name"
                      :label="`${$t('teams.form.team_name')}*`"
                      :disabled="!$hasLevel(UserRoles.level5)"
                      :rules="rules.name"
                      @input="resetAsUnique()" />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-autocomplete-with-validation
                      data-test="team-contact"
                      :label="`${$t('teams.form.primary_contact')}${canBeEmpty ? '' : '*'}`"
                      :items="userAccountFilter.users"
                      item-text="text"
                      :item-value="(item) => item && item.value"
                      :search-input.sync="userAccountFilter.query"
                      :value="currentPrimaryContact && currentPrimaryContact.id"
                      :rules="rules.primaryContact"
                      hide-no-data
                      hide-selected
                      return-object
                      no-filter
                      :disabled="!$hasLevel(UserRoles.level5)"
                      :placeholder="$t('common.inputs.start_typing_to_search')"
                      @change="setPrimaryContact($event)"
                      @update:search-input="onUserAutoCompleteUpdate({ filterKey: 'primaryContact', search: $event })"
                      @keydown.delete="resetPrimaryContact()" />
                  </v-col>
                </v-row>

                <v-row class="mt-0">
                  <v-col cols="12" class="pt-1 pb-0">
                    <events-selector
                      async-mode
                      fetch-all-events
                      :value="teamType === 'standard' ? team.eventIds : team.eventIds[0]"
                      :multiple="teamType === 'standard'"
                      :disabled="!$hasLevel(UserRoles.level5)"
                      :disable-event-delete="!$hasLevel(UserRoles.level5)"
                      item-value="id"
                      :rules="rules.event"
                      return-object
                      data-test="events"
                      :label="`${$t('teams.form.event')}${teamType === 'standard' ? '' : '*'}`"
                      :force-events="availableEvents"
                      @change="setEvents($event)"
                      @delete="handleRemoveEvent($event)" />
                  </v-col>
                </v-row>

                <v-row class="mt-0">
                  <v-col cols="12" class="firstSection__actions">
                    <v-btn
                      :disabled="!$hasLevel(UserRoles.level5)"
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
            <v-row class="mt-6">
              <v-col v-if="!$hasFeature($featureKeys.AppointmentBooking) || !original.useForAppointments" class="pa-0">
                <team-members-table
                  data-test="team-members-table"
                  :team-id="team.id"
                  :show-members="isEditMode"
                  :show-search="isEditMode"
                  :disable-add-members="!allowAddMembers"
                  :primary-contact="submittedPrimaryContactUser"
                  :team-members-data.sync="teamMembers"
                  @reloadTeam="reloadTeam" />
              </v-col>
              <v-col v-else class="pt-0">
                <rc-tabs class="mb-4">
                  <rc-tab
                    v-for="tab in tabs"
                    :key="tab"
                    :label="$t(`team.tab.title--${SelectedTab[tab]}`)"
                    :data-test="`team.tab.title--${SelectedTab[tab]}`"
                    :disabled="!teamMembers.length"
                    :active="selectedTab === tab"
                    @click="selectedTab = tab" />
                </rc-tabs>
                <team-members-table
                  v-if="selectedTab === SelectedTab.TeamMembers"
                  data-test="team-members-table"
                  :team-id="team.id"
                  :show-members="isEditMode"
                  :show-search="isEditMode"
                  :disable-add-members="!allowAddMembers"
                  :primary-contact="submittedPrimaryContactUser"
                  :team-members-data.sync="teamMembers"
                  @reloadTeam="reloadTeam" />
                <team-assign-service-options
                  v-if="selectedTab === SelectedTab.AssignServiceOptions"
                  :team-id="team.id"
                  data-test="assign-service-options-table"
                  :events="eventsForServiceOptionAssignment"
                  :team-members="teamMembers" />
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
        {{ errorMessage }}
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
  RcConfirmationDialog, RcDialog, RcPageContent, VAutocompleteWithValidation,
  VCheckboxWithValidation, VTextFieldWithValidation, RcTab, RcTabs,
} from '@libs/component-lib/components';
import _isEqual from 'lodash/isEqual';
import _sortBy from 'lodash/sortBy';
import {
  TeamType, TeamEntity, ITeamEntity,
  ITeamMemberAsUser,
} from '@libs/entities-lib/team';
import { EEventStatus, IEventEntity } from '@libs/entities-lib/event';
import TeamMembersTable from '@/ui/views/pages/teams/components/TeamMembersTable.vue';
import routes from '@/constants/routes';
import { MAX_LENGTH_MD } from '@libs/shared-lib/constants/validations';
import StatusSelect from '@/ui/shared-components/StatusSelect.vue';
import { VForm, IServerError, IDropdownItem, Status } from '@libs/shared-lib/types';
import {
  IUserAccountCombined, IUserAccountEntity, IUserAccountMetadata, IdParams as IdParamsUserAccount,
} from '@libs/entities-lib/user-account';
import handleUniqueNameSubmitError from '@/ui/mixins/handleUniqueNameSubmitError';
import { IError } from '@libs/services-lib/http-client';
import EventsSelector from '@/ui/shared-components/EventsSelector.vue';
import UserAccountsFilter from '@/ui/mixins/userAccountsFilter';
import { useEventStore } from '@/pinia/event/event';
import { CombinedStoreFactory } from '@libs/stores-lib/base/combinedStoreFactory';
import { useUserAccountMetadataStore, useUserAccountStore } from '@/pinia/user-account/user-account';
import { useTeamStore } from '@/pinia/team/team';
import { UserRoles } from '@libs/entities-lib/user';
import TeamAssignServiceOptions from '../components/TeamAssignServiceOptions.vue';
import { SelectedTab } from '../details/TeamDetails.vue';

interface UserTeamMember {
  isPrimaryContact: boolean,
  displayName: string,
  id: string,
  email: string,
}

export default mixins(handleUniqueNameSubmitError, UserAccountsFilter).extend({

  name: 'CreateEditTeam',

  components: {
    EventsSelector,
    RcPageContent,
    VTextFieldWithValidation,
    VAutocompleteWithValidation,
    TeamMembersTable,
    StatusSelect,
    RcDialog,
    RcConfirmationDialog,
    VCheckboxWithValidation,
    TeamAssignServiceOptions,
    RcTab,
    RcTabs,
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
      UserRoles,
      combinedUserAccountStore: new CombinedStoreFactory<IUserAccountEntity, IUserAccountMetadata, IdParamsUserAccount>(useUserAccountStore(), useUserAccountMetadataStore()),
      userAccounts: [] as IUserAccountCombined[],
      currentPrimaryContact: null as UserTeamMember,
      submittedPrimaryContactUser: null as IUserAccountCombined,
      map: [null, 'standard', 'adhoc'],
      statuses: [Status.Active, Status.Inactive],
      showCancelConfirmationDialog: false,
      showEventDeleteConfirmationDialog: false,
      minimumContactQueryLength: 1,
      eventsAfterRemoval: null as string[],
      team: null as ITeamEntity,
      isLoading: true,
      availableEvents: [] as IEventEntity[],
      original: {
        name: null as string,
        status: null as Status,
        events: null as string | string[],
        primaryContact: null as string,
        isEscalation: null as boolean,
        isAssignable: null as boolean,
        useForLodging: null as boolean,
        useForAppointments: null as boolean,
      },
      showErrorDialog: false,
      errorMessage: '' as TranslateResult,
      isSubmitting: false,
      tabs: [SelectedTab.TeamMembers, SelectedTab.AssignServiceOptions],
      SelectedTab,
      selectedTab: SelectedTab.TeamMembers,
      teamMembers: [] as ITeamMemberAsUser[],
    };
  },

  computed: {
    userAccountFilter() {
      return this.userAccountFilterState.default;
    },

    deleteEventConfirmationMessage(): TranslateResult {
      if (this.eventsAfterRemoval) {
        const removedEvent = _difference(this.team.eventIds, this.eventsAfterRemoval);
        const name = this.$m((this.availableEvents.find((e) => e.id === removedEvent[0]))?.name);
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
          required: !this.canBeEmpty,
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
        isEscalation: this.team.isEscalation,
        isAssignable: this.team.isAssignable,
        useForLodging: this.team.useForLodging,
        useForAppointments: this.team.useForAppointments,
      });
    },

    allowAddMembers():boolean {
      return this.isEditMode && !!this.team.teamMembers.length;
    },

    canBeEmpty(): boolean {
      return this.isEditMode && this.team.status === Status.Inactive && !this.original.primaryContact;
    },

    hasCheckBoxes(): boolean {
      return this.$hasFeature(this.$featureKeys.TaskManagement) || this.$hasFeature(this.$featureKeys.Lodging)
      || this.$hasFeature(this.$featureKeys.AppointmentBooking);
    },

    eventsForServiceOptionAssignment(): IEventEntity[] {
      return this.availableEvents.filter((e) => this.original.events.includes(e.id));
    },
  },

  watch: {
    'team.isEscalation': {
      handler(newValue, oldValue) {
        if (newValue && newValue !== oldValue && oldValue !== undefined) {
          this.team.isAssignable = true;
        }
      },
    },
  },

  async mounted() {
    this.isLoading = true;
    if (!this.isEditMode) {
      this.prepareCreateTeam();
    } else {
      await this.loadTeam();
    }
    await this.getAvailableEvents();
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
        isEscalation: this.team.isEscalation,
        isAssignable: this.team.isAssignable,
        useForLodging: this.team.useForLodging,
        useForAppointments: this.team.useForAppointments,
      });
    },

    async getAvailableEvents() {
      await useEventStore().fetchByIds(this.team?.eventIds, true);
      const allEvents = useEventStore().getAll();
      const activeEvents = useEventStore().getEventsByStatus([EEventStatus.Open, EEventStatus.OnHold]);
      const availableEvents = allEvents.filter((e) => this.team.eventIds.indexOf(e.id) > -1);
      this.availableEvents = availableEvents.concat(activeEvents);
    },

    handleRemoveEvent(leftEvents: (IEventEntity | string)[]) {
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
        await useTeamStore().fetch(teamId);
        await this.loadTeamFromState();
      }
    },

    async reloadTeam() {
      await this.loadTeam();
      this.setOriginalData();
    },

    async loadTeamFromState(errors? : IError[]) {
      // Doesn't reload the state of the team if the error is an existing team name
      if (Array.isArray(errors) && errors.findIndex((error) => error.code === 'errors.an-entity-with-this-name-already-exists') >= 0) {
        return;
      }

      const storeTeam = _cloneDeep(useTeamStore().getById(this.id));
      this.team = new TeamEntity(storeTeam);
      if (this.team.getPrimaryContact()) {
        const primaryContactUser = await this.fetchUsersByIds([this.team.getPrimaryContact().id]);
        if (primaryContactUser?.length) {
          this.currentPrimaryContact = this.mapToTeamMember(primaryContactUser[0].entity, primaryContactUser[0].metadata, true);
          this.userAccountFilter.users = [{ value: this.currentPrimaryContact.id, text: this.currentPrimaryContact.displayName }];
        }
      } else {
        this.currentPrimaryContact = null;
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

    mapToTeamMember(u: IUserAccountEntity, um: IUserAccountMetadata, isPrimaryContact: boolean): UserTeamMember {
      return {
        id: u.id,
        email: um.emailAddress || um.userPrincipalName,
        displayName: um.displayName,
        isPrimaryContact,
      };
    },

    resetPrimaryContact() {
      this.currentPrimaryContact = null;
    },

    resetFormValidation() {
      (this.$refs.form as VForm).reset();
    },

    setPrimaryContact(appUser: IDropdownItem) {
      if (appUser?.value) {
        const user = useUserAccountStore().getById(appUser.value);
        const userMetadata = useUserAccountMetadataStore().getById(appUser.value);
        this.currentPrimaryContact = this.mapToTeamMember(user, userMetadata, true);
      }
    },

    setEvents(events: (IEventEntity | string) | (IEventEntity | string)[]) {
      if (!events) {
        this.team.setEventIds([]);
        return;
      }
      const ids = (Array.isArray(events) ? events : [events]).map((x) => (typeof x === 'string' ? x : x.id));
      this.team.setEventIds(ids);
    },

    async submit() {
      const isValid = await (this.$refs.form as VForm).validate();
      if (!isValid) {
        return;
      }

      if (this.currentPrimaryContact) {
        this.setPrimaryContactTeam();
      }

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
      this.submittedPrimaryContactUser = this.combinedUserAccountStore.getById(this.currentPrimaryContact.id);
    },

    async submitCreateTeam() {
      try {
        this.isSubmitting = true;
        const res = await useTeamStore().createTeam(this.team);

        this.team = new TeamEntity(_cloneDeep(res));

        const message: TranslateResult = this.team.teamType === TeamType.Standard
          ? this.$t('teams.standard_team_created')
          : this.$t('teams.adhoc_team_created');

        this.$toasted.global.success(message);

        await this.$router.replace({ name: routes.teams.edit.name, params: { id: this.team.id, teamType: this.teamType } });

        this.resetFormValidation();
        this.setOriginalData();
      } catch (e) {
        const errorData = (e as IServerError).response?.data?.errors;
        if (errorData && errorData.length > 0) {
          this.errorMessage = this.$t(errorData[0].code);
          this.showErrorDialog = true;
        } else {
          this.$appInsights.trackTrace('Team create error', { error: errorData });
          this.handleSubmitError(e);
        }
      } finally {
        this.isSubmitting = false;
      }
    },

    async submitEditTeam() {
      try {
        this.isSubmitting = true;
        await useTeamStore().editTeam(this.team);
        this.$toasted.global.success(this.$t('teams.team_updated'));
        this.resetFormValidation();
        this.setOriginalData();
      } catch (e) {
        const errorData = (e as IServerError).response?.data?.errors;
        if (errorData && errorData.length > 0) {
          this.errorMessage = this.$t(errorData[0].code);
          this.showErrorDialog = true;
        } else {
          this.$appInsights.trackTrace('Team edit error', { error: errorData });
          this.handleSubmitError(e);
        }
        this.loadTeamFromState(errorData);
      } finally {
        this.isSubmitting = false;
      }
    },

    prepareCreateTeam() {
      this.team = new TeamEntity();
      this.team.status = Status.Active;
      this.team.teamType = this.teamType === 'standard' ? TeamType.Standard : TeamType.AdHoc;
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
  padding-top: 8px;
  padding-bottom: 8px;

  &__actions {
    display: flex;
    justify-content: flex-end;

    button {
      margin: 0 0 0 16px;
    }
  }
}

::v-deep .team-checkbox > .v-input.theme--light.v-input--selection-controls.v-input--checkbox {
  margin-top: 0px !important;
}

</style>
