import { useEventStore } from '@/pinia/event/event';
import { useCaseFileStore } from '@/pinia/case-file/case-file';

export function initializeStores() {
  useEventStore();
  useCaseFileStore();
}
