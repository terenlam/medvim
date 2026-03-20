import { api } from './api.js';

it('renders with the correct text', () => {
  expect(api()).toEqual('hello world');
});
