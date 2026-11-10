import { contentAdapters } from './adapters';
import { request } from './request';

import type { Lang } from '@/shared/config';

type Section = 'benefits' | 'multiply' | 'tasks';

type BenefitsContent = {
  title: string;
  description: string;
  benefits: string[];
};

type MultiplyItem = {
  title: string;
  steps: {
    step_1: string;
    step_2: string;
  };
};

type TasksContent = {
  description: string;
  tiles: {
    title: string;
    text: string;
  }[];
};

type ContentMap = {
  benefits: BenefitsContent;
  multiply: MultiplyItem[];
  tasks: TasksContent;
};

const getContent = async <S extends Section>(lang: Lang, section: S) => {
  const data = await request<ContentMap[S]>(`/${lang}/${section}`);
  const adapt = contentAdapters[section];

  return adapt ? adapt(data) : data;
};

export { getContent };
export type { ContentMap, Section };
