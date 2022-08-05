import { BaseModule } from '@/store/modules/base';

import { IUserAccountMetadata } from '@libs/entities-lib/user-account';

export class UserAccountMetadataModule extends BaseModule<IUserAccountMetadata, uuid> {}
