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

const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

const getContent = async <S extends Section>(lang: Lang, section: S): Promise<ContentMap[S]> => {
  const response = await fetch(`${API_URL}/${lang}/${section}`, {
    headers: { 'x-api-key': API_KEY },
  });

  if (!response.ok) {
    throw new Error(`Ошибка запроса: ${response.status}`);
  }

  return response.json() as Promise<ContentMap[S]>;
};

export { getContent };
export type { ContentMap, Section };
