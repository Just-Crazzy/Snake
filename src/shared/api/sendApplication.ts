type ContactMethod = 'telegram' | 'whatsapp' | 'email';

type ApplicationValues = {
  name: string;
  method: ContactMethod;
  contact: string;
};

const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

const sendApplication = async (values: ApplicationValues): Promise<void> => {
  const response = await fetch(`${API_URL}/form`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    },
    body: JSON.stringify(values),
  });

  if (!response.ok) {
    throw new Error(`Ошибка запроса: ${response.status}`);
  }
};

export { sendApplication };
export type { ApplicationValues, ContactMethod };
