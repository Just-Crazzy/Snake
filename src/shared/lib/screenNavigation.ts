const SCREEN_REQUEST = 'screen:request';

type ScreenRequestDetail = {
  id: string;
};

const requestScreen = (id: string) => {
  const event = new CustomEvent<ScreenRequestDetail>(SCREEN_REQUEST, {
    detail: { id },
    cancelable: true,
  });

  if (window.dispatchEvent(event)) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }
};

export { requestScreen, SCREEN_REQUEST };
export type { ScreenRequestDetail };
