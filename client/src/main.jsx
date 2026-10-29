import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AppProvider } from './context/AppContext.jsx';
import { NotifyProvider } from './context/NotifyContext.jsx';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AppProvider>
      <NotifyProvider>
        <App />
      </NotifyProvider>
    </AppProvider>
  </BrowserRouter>,
);
