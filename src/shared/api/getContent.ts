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

const getContent = <S extends Section>(lang: Lang, section: S, signal?: AbortSignal) =>
  request<ContentMap[S]>(`/${lang}/${section}`, { signal });

export { getContent };
export type { ContentMap, Section };
