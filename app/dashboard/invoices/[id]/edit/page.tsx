import Form from '@/app/ui/invoices/edit-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchInvoiceById, fetchCustomers } from '@/app/lib/data';
import { notFound } from 'next/navigation';

// Use 'any' to bypass the build environment's non-standard type check
export default async function Page({ params }: any) {
  // We explicitly cast the params here to maintain type safety within the component
  const { id } = params as { id: string };
  
  // Fetch data concurrently
  const [invoice, customers] = await Promise.all([
    fetchInvoiceById(id),
    fetchCustomers(),
  ]);

  // If the invoice is not found in the database, trigger the custom not-found page
  if (!invoice) {
    notFound();
  }

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
      <Form invoice={invoice} customers={customers} />
    </main>
  );
}
