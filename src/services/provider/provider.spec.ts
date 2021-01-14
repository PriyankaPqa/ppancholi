import { provider } from './index';
import { EventsService } from '../events';

jest.mock('../events');

describe('Provider', () => {
  it('should instantiate EventsService', () => {
    provider();
    expect(EventsService.prototype.constructor).toBeCalled();
  });
});
