import { Status } from '@libs/shared-lib/types';
import { mockListOption } from '../../user-account';
import { mockBaseData } from '../../base';
import { IServiceOption } from './service-option.types';

export const mockServiceOption = (force? : Partial<IServiceOption>): IServiceOption => ({
  ...mockBaseData(),
  serviceOptionType: { optionItemId: 'id', specifiedOther: '' },
  appointmentModalities: [mockListOption()],
  serviceOptionStatus: Status.Active,
  ...force,
});
