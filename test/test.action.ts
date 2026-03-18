import { createAction, success } from '../src/actions';

interface TestData {
  name: string;
  email: string;
}

export const testAction = createAction<TestData>(async data => {
  console.log('Test action executed with data:', data);
  success('Test action completed successfully!');
}, 'testAction');
