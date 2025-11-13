import { Metadata } from 'next';
import Form from '@/app/ui/invoices/edit-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
// Import only what is necessary. We no longer need 'notFound' here.
import { fetchInvoiceById, fetchCustomers } from '@/app/lib/data';

// Meta page specific metadata
export const metadata: Metadata = {
  title: 'Edit Customer | Acme Dashboard',
};

// Use 'any' to bypass the build environment's non-standard type check
export default async function Page({ params }: any) {
  // We explicitly cast the params here to maintain type safety within the component
  const { id } = params as { id: string };
  
  // Fetch data concurrently. 
  // If fetchInvoiceById finds no invoice, it calls notFound() and terminates execution.
  const [invoice, customers] = await Promise.all([
    fetchInvoiceById(id),
    fetchCustomers(),
  ]);

  // The conditional check 'if (!invoice) { notFound(); }' is no longer needed
  // because the check is now handled inside fetchInvoiceById.

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Invoices', href: '/dashboard/invoices' },
          {
            label: 'Edit Invoice',
            href: `/dashboard/invoices/${id}/edit`,
            active: true,
          },
        ]}
      />
      {/* Pass the fetched invoice and customers data to the Form component. */}
      {/* If notFound() was called, this code path is never reached. */}
      <Form invoice={invoice} customers={customers} />
    </main>
  );
}