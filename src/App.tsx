import { Navigate, Route, Routes } from 'react-router-dom';

import { Layout } from './components/Layout';
import { ComplexityTrainerPage } from './pages/ComplexityTrainerPage';
import { PatternVisualizerPage } from './pages/PatternVisualizerPage';
import { StudyLabPage } from './pages/StudyLabPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<PatternVisualizerPage />} />
        <Route path="/study-lab" element={<StudyLabPage />} />
        <Route path="/complexity-trainer" element={<ComplexityTrainerPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
