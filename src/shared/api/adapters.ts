import type { ContentMap, Section } from './getContent';

type ContentAdapters = {
  [S in Section]?: (data: ContentMap[S]) => ContentMap[S];
};

const KEY_PATTERN = /^[a-z]+(_[a-z]+)*$/;

const keyToTitle = (value: string) => {
  if (!KEY_PATTERN.test(value)) return value;

  return value
    .split('_')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
};

const contentAdapters: ContentAdapters = {
  multiply: (items) => items.map((item) => ({ ...item, title: keyToTitle(item.title) })),
};

export { contentAdapters };
