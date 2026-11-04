import { request } from './request';

type ContactMethod = 'telegram' | 'whatsapp' | 'email';

type ApplicationValues = {
  name: string;
  method: ContactMethod;
  contact: string;
};

const sendApplication = (values: ApplicationValues) => request('/form', { method: 'POST', body: values });

export { sendApplication };
export type { ApplicationValues, ContactMethod };
