import { expect, test } from '@playwright/test';

import { mockContent } from './mocks.ts';

test.beforeEach(async ({ page }) => {
  await mockContent(page);
});

test('корень перенаправляет на английскую версию', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveURL(/\/en$/);
  await expect(page.getByRole('link', { name: 'Get in touch' })).toBeVisible();
});

test('русская версия открывается по /ru', async ({ page }) => {
  await page.goto('/ru');

  await expect(page).toHaveURL(/\/ru$/);
  await expect(page.getByRole('link', { name: 'Связаться' })).toBeVisible();
});

for (const path of ['/de', '/en/unknown']) {
  test(`несуществующий адрес ${path} показывает 404`, async ({ page }) => {
    await page.goto(path);

    await expect(page.getByRole('link', { name: /take me back/ })).toBeVisible();
  });
}

test('кнопка на 404 возвращает на главную', async ({ page }) => {
  await page.goto('/de');
  await page.getByRole('link', { name: /take me back/ }).click();

  await expect(page).toHaveURL(/\/en$/);
});
