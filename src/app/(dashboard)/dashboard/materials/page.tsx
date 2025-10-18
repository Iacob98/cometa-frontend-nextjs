import { redirect } from 'next/navigation';

/**
 * Materials Page - Redirect to Inventory
 *
 * This page has been consolidated with the inventory page.
 * All materials management features are now available at /dashboard/materials/inventory
 *
 * @redirect /dashboard/materials/inventory
 */
export default function MaterialsPage() {
  redirect('/dashboard/materials/inventory');
}
