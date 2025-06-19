import { createAction, success } from '../src/actions';
export const testAction = createAction('test', async (_, formData) => {
  console.log('Test action executed with data:', formData);
  success('Test action completed successfully!');
});
