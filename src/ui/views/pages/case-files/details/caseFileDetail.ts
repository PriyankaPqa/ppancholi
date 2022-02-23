import Vue from 'vue';
import { ICaseFileCombined } from '@/entities/case-file';

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

    readonly(): boolean {
      return this.caseFile?.readonly && !this.$hasLevel('level6');
    },
  },
});
