import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css"; // Стили
import App from "./App";
import { FiltersProvider } from "./components/FiltersContext"; // Импорт FiltersProvider
import reportWebVitals from "./reportWebVitals"; // Для метрик производительности (опционально)

// Обёртываем приложение в FiltersProvider
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <FiltersProvider> {/* Провайдер фильтров */}
      <App />
    </FiltersProvider>
  </React.StrictMode>
);
