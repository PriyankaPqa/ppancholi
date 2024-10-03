// Mixin used to fetch an household and rebuild the object so it can be used by UI components
// In registration and also in household profile

import Vue from 'vue';
import { IHouseholdEntity } from '@libs/entities-lib/household';
import { IEventGenericLocation, IEventSummary } from '@libs/entities-lib/event';
import { CaseFileStatus, ICaseFileEntity } from '@libs/entities-lib/case-file';
import { useRegistrationStore } from '@/pinia/registration/registration';
import { useHouseholdStore } from '@/pinia/household/household';
import { IHouseholdCreateData } from '@libs/entities-lib/household-create';

export default Vue.extend({
  props: {
    id: {
      type: String,
      default: null,
    },
  },

  data() {
    return {
      caseFiles: null as ICaseFileEntity[],
      /*
      * Events to which the user has access. For most users this access is limited by
      * membership in teams assigned to events. This access cannot be inferred from the
      * data, so there are separate requests for "my" and "all" events.
      */
      myEvents: null as IEventSummary[],
      shelterLocations: [] as IEventGenericLocation[],
      otherShelterLocations: [] as IEventGenericLocation[],
    };
  },

  computed: {
    activeCaseFiles():ICaseFileEntity[] {
      if (this.caseFiles) {
        return this.caseFiles.filter((c) => c.caseFileStatus === CaseFileStatus.Open || c.caseFileStatus === CaseFileStatus.Inactive);
      }
      return [];
    },
  },

  methods: {
    async fetchHouseholdCreate(id: string) {
      const householdRes = await useHouseholdStore().fetch(id);
      const householdCreateData = await this.buildHouseholdCreateData(householdRes);
      return householdCreateData;
    },

    /**
     * @param {string} [id] Optional. Id of the household for which to fetch the case files.
     * To pass if the method is not called in a component that needs the case files saved in its state, it only needs the data returned from this call.
     * @returns {Promise<ICaseFileEntity[]>} Case files related to a household
     */
    async fetchCaseFiles(id?:string): Promise<ICaseFileEntity[]> {
      const results = await this.$services.caseFiles.getAllCaseFilesRelatedToHouseholdId(id || this.id);
      if (results) {
        // If no argument was passed, the mixin is used with state properties (caseFiles, myEvents), so the payload of this call is saved in the state
        if (!id) {
          this.caseFiles = results;
        }
        return results;
      }
      return null;
    },

    /**
     * @param {string} [caseFiles] Optional. Case files for which to fetch the events to which the user has access.
     * To pass if the method is not called in a component that needs the events saved in its state, it only needs the data returned from this call.
     * @returns {Promise<IEventSummary[]>} Case files related to a household
     */
    async fetchMyEvents(caseFiles?: ICaseFileEntity[]): Promise<IEventSummary[]> {
      const cf = caseFiles || this.caseFiles;
      if (cf?.length) {
        const eventIds = cf.map((f) => f.eventId);
        const results = await this.$services.events.searchEventSummariesById(eventIds);
        if (!caseFiles) {
          this.myEvents = results?.value;
        }
        return results?.value;
      }
      return [];
    },

    /**
     * @param {string} [householdId] Optional. Id of the household for which we fetch the shelter locations.
     * To pass if the mixin is not used in a component that stores the case files and myEvents in the state (eg. for household move).
     * @returns {Promise<IEventGenericLocation[]>} Shelter location data for the active case files of the household, for events to which the user has access.
     * They are usually fetched to be displayed in the shelter dropdown for the household member's temporary address
     */
    async fetchShelterLocations(householdId?: string): Promise<IEventGenericLocation[]> {
      let events = this.myEvents;
      if (!this.myEvents && householdId) {
        const caseFiles: ICaseFileEntity[] = await this.fetchCaseFiles(householdId);
        if (caseFiles) {
          const activeCaseFiles = caseFiles.filter((c) => c.caseFileStatus === CaseFileStatus.Open || c.caseFileStatus === CaseFileStatus.Inactive);
          events = await this.fetchMyEvents(activeCaseFiles);
        }
      }

      const shelters = [] as IEventGenericLocation[];
      if (events?.length) {
        events.forEach((e) => {
          if (e.shelterLocations) {
            shelters.push(...e.shelterLocations);
          }
        });
      }
      this.shelterLocations = shelters;
      return shelters;
    },

    async buildHouseholdCreateData(
      household: IHouseholdEntity,
    ): Promise<IHouseholdCreateData> {
      const householdCreate = await useRegistrationStore().buildHouseholdCreateData(household, this.shelterLocations);
      return householdCreate;
    },
  },

});
