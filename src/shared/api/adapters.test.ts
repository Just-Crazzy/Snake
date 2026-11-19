import { describe, expect, it } from 'vitest';

import { contentAdapters } from './adapters';

const steps = { step_1: 'first', step_2: 'second' };

const adaptTitle = (title: string) => contentAdapters.multiply?.([{ title, steps }])?.[0].title;

describe('contentAdapters.multiply', () => {
  it('turns a snake_case key into a title', () => {
    expect(adaptTitle('multiply_with_us')).toBe('Multiply With Us');
  });

  it('capitalizes a single-word key', () => {
    expect(adaptTitle('growth')).toBe('Growth');
  });

  it('keeps strings that are not snake_case keys', () => {
    expect(adaptTitle('multiply with us')).toBe('multiply with us');
    expect(adaptTitle('Multiply_With_Us')).toBe('Multiply_With_Us');
    expect(adaptTitle('step_2')).toBe('step_2');
  });

  it('converts every item and keeps the rest of its fields', () => {
    const result = contentAdapters.multiply?.([
      { title: 'multiply_with_us', steps },
      { title: 'growth', steps },
    ]);

    expect(result).toEqual([
      { title: 'Multiply With Us', steps },
      { title: 'Growth', steps },
    ]);
  });
});
