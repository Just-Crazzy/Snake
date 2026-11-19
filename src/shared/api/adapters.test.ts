import { describe, expect, it } from 'vitest';

import { contentAdapters } from './adapters';

const steps = { step_1: 'first', step_2: 'second' };

describe('contentAdapters.multiply', () => {
  it('turns a snake_case key into a title', () => {
    const result = contentAdapters.multiply?.([{ title: 'multiply_with_us', steps }]);

    expect(result?.[0].title).toBe('Multiply With Us');
  });

  it('capitalizes a single-word key', () => {
    const result = contentAdapters.multiply?.([{ title: 'growth', steps }]);

    expect(result?.[0].title).toBe('Growth');
  });

  it('keeps a title that is already human-readable', () => {
    const result = contentAdapters.multiply?.([{ title: 'Уже готовый заголовок', steps }]);

    expect(result?.[0].title).toBe('Уже готовый заголовок');
  });

  it('does not touch steps', () => {
    const result = contentAdapters.multiply?.([{ title: 'multiply_with_us', steps }]);

    expect(result?.[0].steps).toEqual(steps);
  });
});
