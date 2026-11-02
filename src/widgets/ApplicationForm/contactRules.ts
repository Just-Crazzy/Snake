import type { ContactMethod } from '@/shared/api';

type ContactRule = {
  pattern: RegExp;
  message: string;
  placeholder: string;
};

const DEFAULT_PLACEHOLDER = 'Your Contact*';

const contactMethods: { value: ContactMethod; label: string }[] = [
  { value: 'telegram', label: 'Telegram' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'Email' },
];

const contactRules: Record<ContactMethod, ContactRule> = {
  telegram: {
    pattern: /^@[a-zA-Z0-9_]{5,32}$/,
    message: 'Username must start with @, e.g. @john_dev',
    placeholder: '@username*',
  },
  whatsapp: {
    pattern: /^\+\d{10,15}$/,
    message: 'Phone must look like +420123456789',
    placeholder: '+420123456789*',
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Enter a valid email',
    placeholder: 'name@mail.com*',
  },
};

const getContactPlaceholder = (method: ContactMethod | undefined) => {
  if (!method) {
    return DEFAULT_PLACEHOLDER;
  }

  return contactRules[method].placeholder;
};

const validateContact = (value: string, method: ContactMethod | undefined) => {
  if (!method) {
    return true;
  }

  const rule = contactRules[method];

  return rule.pattern.test(value) || rule.message;
};

export { contactMethods, getContactPlaceholder, validateContact };
