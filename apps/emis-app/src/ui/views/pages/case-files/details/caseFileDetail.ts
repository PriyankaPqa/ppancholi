import Vue from 'vue';
import { ICaseFileCombined } from '@libs/entities-lib/case-file';
import { EEventStatus, IEventEntity } from '@libs/entities-lib/event';
import { useEventStore } from '@/pinia/event/event';

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

    event(): IEventEntity {
      if (!this.caseFile?.entity?.eventId) {
        return null;
      }
      return useEventStore().getById(this.caseFile.entity.eventId);
    },

    readonly(): boolean {
      return (this.caseFile?.readonly || this.event?.schedule?.status !== +EEventStatus.Open) && !this.$hasLevel('level6');
    },
  },
});
