import { provider } from './index';
import { EventsService } from '../events';
import { AppUsersService } from '../app-users';
import { OptionItemsService } from '../optionItems';
import { TeamsService } from '../teams';

jest.mock('../events');
jest.mock('../app-users');
jest.mock('../optionItems');
jest.mock('../teams');

describe('Provider', () => {
  it('should instantiate EventsService', () => {
    provider();
    expect(EventsService.prototype.constructor).toBeCalled();
  });

  it('should instantiate AppUsersService', () => {
    provider();
    expect(AppUsersService.prototype.constructor).toBeCalled();
  });

  it('should instantiate OptionItemsService', () => {
    provider();
    expect(OptionItemsService.prototype.constructor).toBeCalled();
  });

  it('should instantiate TeamsService', () => {
    provider();
    expect(TeamsService.prototype.constructor).toBeCalled();
  });
});
