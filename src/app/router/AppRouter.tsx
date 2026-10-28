import { Navigate, Route, Routes } from 'react-router-dom';

import { Home, NotFound } from '@/pages';

import { LangGuard } from './LangGuard';

const AppRouter = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/en" replace />} />
    <Route path="/:lang" element={<LangGuard />}>
      <Route index element={<Home />} />
    </Route>
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export { AppRouter };
