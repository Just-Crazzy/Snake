import type { Page } from '@playwright/test';

type FormRequest = {
  name: string;
  method: string;
  contact: string;
};

const CONTENT_URL = /\/(en|ru)\/(benefits|multiply|tasks)$/;
const FORM_URL = /\/form$/;

const content = {
  benefits: {
    title: 'Benefits title',
    description: 'Benefits description',
    benefits: ['First benefit', 'Second benefit', 'Third benefit'],
  },
  multiply: [
    { title: 'for_media_buyers', steps: { step_1: 'Buyers step one', step_2: 'Buyers step two' } },
    { title: 'for_businesses', steps: { step_1: 'Business step one', step_2: 'Business step two' } },
    { title: 'for_partners', steps: { step_1: 'Partners step one', step_2: 'Partners step two' } },
  ],
  tasks: {
    description: 'Tasks description',
    tiles: [
      { title: 'Tile one', text: 'Tile one text' },
      { title: 'Tile two', text: 'Tile two text' },
      { title: 'Tile three', text: 'Tile three text' },
      { title: 'Tile four', text: 'Tile four text' },
      { title: 'Tile five', text: 'Tile five text' },
    ],
  },
};

type Section = keyof typeof content;

const mockContent = async (page: Page) => {
  await page.route(CONTENT_URL, (route) => {
    const section = new URL(route.request().url()).pathname.split('/').pop() as Section;

    return route.fulfill({ json: content[section] });
  });
};

const mockForm = async (page: Page, status = 200) => {
  const requests: FormRequest[] = [];

  await page.route(FORM_URL, (route) => {
    requests.push(route.request().postDataJSON() as FormRequest);

    return route.fulfill({ status, body: '' });
  });

  return requests;
};

export { mockContent, mockForm };
export type { FormRequest };
