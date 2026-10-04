import { ViteReactSSG } from 'vite-react-ssg';
import { routes } from './routes';
import './index.css';

export const createRoot = ViteReactSSG({ routes });
export const createApp = createRoot;
export default createRoot;
