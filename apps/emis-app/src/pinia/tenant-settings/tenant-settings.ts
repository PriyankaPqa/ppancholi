import { storeFactory } from '@libs/stores-lib/tenant-settings/tenant-settings';
import { httpClient } from '@/services/httpClient';
import { SignalR } from '@/ui/plugins/signal-r';

export const useTenantSettingsStore = () => storeFactory(httpClient, SignalR);
