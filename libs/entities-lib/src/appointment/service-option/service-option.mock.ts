import { mockListOption } from '../../user-account';
import { mockBaseData } from '../../base';
import { IServiceOption } from './service-option.types';

export const mockServiceOption = (force? : Partial<IServiceOption>): IServiceOption => ({
  ...mockBaseData(),
  type: { optionItemId: 'id', specifiedOther: '' },
  appointmentModalities: [mockListOption()],
  ...force,
});
