import Vue from 'vue';
import { ICaseFileActivity } from '@libs/entities-lib/case-file';
import { useCaseFileStore } from '@/pinia/case-file/case-file';
import _debounce from 'lodash/debounce';

export default Vue.extend({
  props: {
    /*
    Case file Id
     */
    id: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      loadingActivity: false,
      caseFileActivities: [] as ICaseFileActivity[],
    };
  },
  methods: {
    async fetchCaseFileActivities() {
      try {
        this.loadingActivity = true;
        const activities: ICaseFileActivity[] = await useCaseFileStore().fetchCaseFileActivities(this.id);
        if (activities) {
          this.caseFileActivities = activities;
        }
      } finally {
        this.loadingActivity = false;
      }
    },

    attachToChanges(on: boolean) {
      if (this.$signalR.connection) {
        if (on) {
          this.$signalR.connection.on('case-file.CaseFileActivityCreated', this.activityChanged);
          this.$signalR.connection.on('case-file.CaseFileActivityUpdated', this.activityChanged);
        } else {
          this.$signalR.connection.off('case-file.CaseFileActivityCreated', this.activityChanged);
          this.$signalR.connection.off('case-file.CaseFileActivityUpdated', this.activityChanged);
        }
      }
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    activityChanged: _debounce(function func(this:any, item: ICaseFileActivity) {
      if (this.id === item?.caseFileId || this.id === item?.id) {
        this.fetchCaseFileActivities();
      }
    }, 1000),
  },
});
