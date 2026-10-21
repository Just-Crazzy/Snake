import './App.scss'; // eslint-disable-line

import { StrictMode } from 'react';

import { BrowserRouter } from 'react-router-dom';

import { createRoot } from 'react-dom/client';

import { AppRouter } from '@/app/router';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  </StrictMode>
);
