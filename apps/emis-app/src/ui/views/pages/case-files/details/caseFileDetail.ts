import Vue from 'vue';
import { CaseFileStatus, ICaseFileEntity, ICaseFileMetadata } from '@libs/entities-lib/case-file';
import { EEventStatus, IEventEntity } from '@libs/entities-lib/event';
import { useEventStore } from '@/pinia/event/event';
import { useCaseFileMetadataStore, useCaseFileStore } from '@/pinia/case-file/case-file';

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

    caseFile(): ICaseFileEntity {
      return useCaseFileStore().getById(this.caseFileId);
    },

    caseFileMetadata(): ICaseFileMetadata {
      return useCaseFileMetadataStore().getById(this.caseFileId);
    },

    event(): IEventEntity {
      if (!this.caseFile?.eventId) {
        return null;
      }
      return useEventStore().getById(this.caseFile.eventId);
    },

    readonly(): boolean {
      return (this.caseFile.caseFileStatus !== CaseFileStatus.Open || this.event?.schedule?.status !== +EEventStatus.Open) && !this.$hasLevel('level6');
    },
  },
});
