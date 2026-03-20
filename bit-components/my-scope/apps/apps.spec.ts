import { apps } from './apps.js';

it('renders with the correct text', () => {
  expect(apps()).toEqual('hello world');
});
