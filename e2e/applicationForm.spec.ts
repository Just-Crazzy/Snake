import { expect, test } from '@playwright/test';

import { mockContent, mockForm } from './mocks.ts';

import type { Page } from '@playwright/test';

const openForm = async (page: Page) => {
  await page.goto('/en');
  await page.getByRole('link', { name: 'Get in touch' }).click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  return dialog;
};

test.beforeEach(async ({ page }) => {
  await mockContent(page);
});

test('пустая форма показывает ошибки и не уходит на сервер', async ({ page }) => {
  const requests = await mockForm(page);
  const dialog = await openForm(page);

  await dialog.getByRole('button', { name: 'Submit' }).click();

  await expect(dialog.getByText('Choose a contact method')).toBeVisible();
  await expect(dialog.getByText('Enter your contact')).toBeVisible();
  expect(requests).toHaveLength(0);
});

test('неверный контакт для выбранного способа показывает подсказку', async ({ page }) => {
  const requests = await mockForm(page);
  const dialog = await openForm(page);
  const contact = dialog.getByLabel('Your contact');

  await dialog.getByLabel('Contact method').selectOption('telegram');
  await expect(contact).toHaveAttribute('placeholder', '@username*');

  await contact.fill('john');
  await dialog.getByRole('button', { name: 'Submit' }).click();

  await expect(dialog.getByText('Username must start with @, e.g. @john_dev')).toBeVisible();
  expect(requests).toHaveLength(0);
});

test('успешная отправка показывает сообщение и закрывается по Done', async ({ page }) => {
  const requests = await mockForm(page);
  const dialog = await openForm(page);

  await dialog.getByLabel('Your Name').fill('John');
  await dialog.getByLabel('Contact method').selectOption('email');
  await dialog.getByLabel('Your contact').fill('john@mail.com');
  await dialog.getByRole('button', { name: 'Submit' }).click();

  await expect(dialog.getByRole('heading', { name: 'We have received your application!' })).toBeVisible();
  expect(requests).toEqual([{ name: 'John', method: 'email', contact: 'john@mail.com' }]);

  await dialog.getByRole('button', { name: 'Done' }).click();
  await expect(dialog).toBeHidden();
});

test('ошибка сервера показывает сообщение и оставляет форму открытой', async ({ page }) => {
  await mockForm(page, 500);
  const dialog = await openForm(page);

  await dialog.getByLabel('Contact method').selectOption('whatsapp');
  await dialog.getByLabel('Your contact').fill('+420123456789');
  await dialog.getByRole('button', { name: 'Submit' }).click();

  await expect(dialog.getByText('Something went wrong. Please try again later')).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Submit' })).toBeEnabled();
});
