import { storeFactory } from '@libs/stores-lib/tenant-settings/tenant-settings';
import { httpClient } from '@/services/httpClient';

export const useTenantSettingsStore = () => storeFactory(httpClient);
