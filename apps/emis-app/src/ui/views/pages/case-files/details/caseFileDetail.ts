import Vue from 'vue';
import { ICaseFileCombined } from '@/entities/case-file';
import { EEventStatus, IEventCombined } from '@/entities/event';

export default Vue.extend({
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  computed: {

    caseFileId(): string {
      return this.id;
    },

    caseFile(): ICaseFileCombined {
      return this.$storage.caseFile.getters.get(this.caseFileId);
    },

    event(): IEventCombined {
      if (!this.caseFile?.entity?.eventId) {
        return null;
      }
      return this.$storage.event.getters.get(this.caseFile.entity.eventId);
    },

    readonly(): boolean {
      return (this.caseFile?.readonly || this.event?.entity?.schedule?.status !== +EEventStatus.Open) && !this.$hasLevel('level6');
    },
  },
});
