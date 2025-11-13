import { Metadata } from 'next';
import Pagination from '@/app/ui/invoices/pagination';
import Search from '@/app/ui/search';
import Table from '@/app/ui/invoices/table';
import { CreateInvoice } from '@/app/ui/invoices/buttons';
import { lusitana } from '@/app/ui/fonts';
import { Suspense } from 'react';
import { InvoicesTableSkeleton } from '@/app/ui/skeletons';
import { fetchInvoicesPages } from '@/app/lib/data';

// Meta page specific metadata
export const metadata: Metadata = {
  title: 'Invoices',
};

// We use the 'any' type here to bypass the strict and non-standard 'PageProps'
// constraint that is causing the Vercel build to fail.
export default async function Page({
  searchParams,
}: any) {
  // === TEMPORARY CODE TO TEST error.tsx ===
  // NOTE: This line MUST remain commented out for a successful deployment.
  // Uncomment it *after* deployment to manually trigger the error page.
  // throw new Error('Forced Error to Test error.tsx');
  // =========================================

  // We cast the searchParams object here to restore type safety within the function
  const params = searchParams as
    | {
        query?: string;
        page?: string;
      }
    | undefined;

  const query = params?.query || '';
  const currentPage = Number(params?.page) || 1;

  const totalPages = await fetchInvoicesPages(query);

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Invoices</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Search invoices..." />
        <CreateInvoice />
      </div>
      <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}>
        <Table query={query} currentPage={currentPage} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
