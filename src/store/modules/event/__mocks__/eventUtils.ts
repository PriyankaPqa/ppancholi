import { mockEventsSearchData } from '@/entities/event';

export const mapEventDataToSearchData = jest.fn(() => mockEventsSearchData()[0]);
