import 'reflect-metadata';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ApplicationContext } from '@abdokouta/ts-application';
import { ContainerProvider } from '@abdokouta/ts-container-react';
import { AppModule } from '@/modules/app.module';
import App from './App';
import '@/styles/globals.css';

/**
 * Bootstrap the DI container, then render the React app.
 *
 * ApplicationContext.create() scans the module tree, resolves all
 * providers, and calls onModuleInit() lifecycle hooks.
 * The resulting context is passed to ContainerProvider so all
 * components can use useInject() to resolve services.
 */
async function bootstrap() {
  const app = await ApplicationContext.create(AppModule);

  // Make it available on window for debugging
  if (import.meta.env.DEV) {
    (window as any).__APP_CONTEXT__ = app;
  }

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
      <ContainerProvider context={app}>
        <App />
      </ContainerProvider>
    </BrowserRouter>
  );
}

bootstrap().catch(console.error);
