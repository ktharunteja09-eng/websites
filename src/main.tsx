import { ViteReactSSG } from 'vite-react-ssg';
import { routes } from './routes';
import { setupGlobalErrorHandlers } from './utils/errorHandler';
import './index.css';

// Initialize global window error, unhandledrejection, and chunk preload listeners
setupGlobalErrorHandlers();

export const createRoot = ViteReactSSG({ routes });
export const createApp = createRoot;
export default createRoot;

