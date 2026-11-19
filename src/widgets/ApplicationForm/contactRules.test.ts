import { describe, expect, it } from 'vitest';

import { validateContact } from './contactRules';

type Case = { value: string; reason: string };

describe('validateContact', () => {
  it('skips the check while no method is selected', () => {
    expect(validateContact('anything', undefined)).toBe(true);
  });

  describe('telegram', () => {
    const valid: Case[] = [
      { value: '@abcde', reason: 'minimum length' },
      { value: '@user_name_1', reason: 'letters, digits and underscore' },
      { value: `@${'a'.repeat(32)}`, reason: 'maximum length' },
    ];

    const invalid: Case[] = [
      { value: 'username', reason: 'no @' },
      { value: '@abcd', reason: 'too short' },
      { value: `@${'a'.repeat(33)}`, reason: 'too long' },
      { value: '@user-name', reason: 'forbidden character' },
      { value: 'x@username', reason: 'text before @' },
      { value: '@username!', reason: 'text after the name' },
    ];

    it.each(valid)('accepts $value ($reason)', ({ value }) => {
      expect(validateContact(value, 'telegram')).toBe(true);
    });

    it.each(invalid)('rejects $value ($reason)', ({ value }) => {
      expect(validateContact(value, 'telegram')).toBe('form.contact.errors.telegram');
    });
  });

  describe('whatsapp', () => {
    const valid: Case[] = [
      { value: '+1234567890', reason: 'minimum length' },
      { value: '+420123456789', reason: 'regular number' },
      { value: `+${'1'.repeat(15)}`, reason: 'maximum length' },
    ];

    const invalid: Case[] = [
      { value: '1234567890', reason: 'no +' },
      { value: '+123456789', reason: 'too short' },
      { value: `+${'1'.repeat(16)}`, reason: 'too long' },
      { value: '+420 123 456 789', reason: 'spaces' },
      { value: 'x+1234567890', reason: 'text before +' },
      { value: '+1234567890x', reason: 'text after the number' },
    ];

    it.each(valid)('accepts $value ($reason)', ({ value }) => {
      expect(validateContact(value, 'whatsapp')).toBe(true);
    });

    it.each(invalid)('rejects $value ($reason)', ({ value }) => {
      expect(validateContact(value, 'whatsapp')).toBe('form.contact.errors.whatsapp');
    });
  });

  describe('email', () => {
    const valid: Case[] = [
      { value: 'name@mail.com', reason: 'regular address' },
      { value: 'first.last@sub.domain.org', reason: 'dots and subdomain' },
    ];

    const invalid: Case[] = [
      { value: 'name@mail', reason: 'no domain zone' },
      { value: 'name@@mail.com', reason: 'two @' },
      { value: 'name mail@mail.com', reason: 'space inside' },
      { value: '@mail.com', reason: 'no name' },
      { value: 'name@', reason: 'no domain' },
      { value: ' name@mail.com', reason: 'leading space' },
      { value: 'name@mail.com ', reason: 'trailing space' },
    ];

    it.each(valid)('accepts $value ($reason)', ({ value }) => {
      expect(validateContact(value, 'email')).toBe(true);
    });

    it.each(invalid)('rejects $value ($reason)', ({ value }) => {
      expect(validateContact(value, 'email')).toBe('form.contact.errors.email');
    });
  });
});
