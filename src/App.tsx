import { Container } from "@mui/material";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import Header from "./components/Header";
import { CaseTimelinePage } from "./pages/CaseTimelinePage";
import { CaseEditPage } from "./pages/CaseEditPage";
import { CaseListPage } from "./pages/CaseListPage";

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Header />
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Routes>
          <Route path="/" element={<CaseListPage />} />
          <Route path="/case/:id" element={<CaseTimelinePage />} />
          <Route path="/case/:id/edit" element={<CaseEditPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Container>
    </BrowserRouter>
  );
}

export default App;
