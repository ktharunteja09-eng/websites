/**
 * AdminDashboard Component (Responsive Mobile & Desktop Owner Portal)
 *
 * Features:
 * - Horizontally scrollable category filter bar:
 *   flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-2 max-w-full no-scrollbar
 * - Dynamic category extraction from menuItems:
 *   ['All', ...uniqueCategories]
 * - Category filter state: selectedCategory ('All' default)
 * - Responsive layout: w-full max-w-full overflow-x-hidden px-3 sm:px-6
 * - Clean stacked header controls: flex-col sm:flex-row gap-3
 * - Order cards grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 with break-words min-w-0
 */
export * from '../pages/AdminDashboard';
import { AdminDashboard } from '../pages/AdminDashboard';
export default AdminDashboard;
