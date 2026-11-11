import type { ContactMethod } from '@/shared/api';

type ContactRule = {
  pattern: RegExp;
  message: string;
  placeholder: string;
};

const contactMethods: { value: ContactMethod; label: string }[] = [
  { value: 'telegram', label: 'Telegram' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'Email' },
];

const contactRules: Record<ContactMethod, ContactRule> = {
  telegram: {
    pattern: /^@[a-zA-Z0-9_]{5,32}$/,
    message: 'form.contact.errors.telegram',
    placeholder: '@username*',
  },
  whatsapp: {
    pattern: /^\+\d{10,15}$/,
    message: 'form.contact.errors.whatsapp',
    placeholder: '+420123456789*',
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'form.contact.errors.email',
    placeholder: 'name@mail.com*',
  },
};

const getContactPlaceholder = (method: ContactMethod | undefined) =>
  method ? contactRules[method].placeholder : undefined;

const validateContact = (value: string, method: ContactMethod | undefined) => {
  if (!method) {
    return true;
  }

  const rule = contactRules[method];

  return rule.pattern.test(value) || rule.message;
};

export { contactMethods, getContactPlaceholder, validateContact };
