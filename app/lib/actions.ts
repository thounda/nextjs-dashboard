"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import postgres from "postgres";

// Initialize the database connection using the environment variable
const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

// Define the primary schema for invoices
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  // z.coerce.number() attempts to change the value to a number.
  // This is where we receive the raw decimal amount from the form.
  amount: z.coerce.number(),
  status: z.enum(["pending", "paid"]),
  date: z.string(),
});

// Schema tailored for creating a new invoice (omitting 'id' and 'date')
const CreateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  // If form validation fails, return early with errors
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }

  const { customerId, amount, status } = validatedFields.data;

  // CRITICAL FIX: Round the amount after multiplying by 100 to prevent 
  // floating-point precision errors before saving to the 'int4' (integer) column.
  const amountInCents = Math.round(amount * 100);
  const date = new Date().toISOString().split('T')[0];

  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    console.error(error);
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }

  // Clear the client-side cache and redirect the user
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

// Schema tailored for updating an invoice (omitting 'id' and 'date')
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function updateInvoice(id: string, formData: FormData) {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  // If form validation fails, return early with errors
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }

  const { customerId, amount, status } = validatedFields.data;

  // CRITICAL FIX: Apply rounding for update operation as well.
  const amountInCents = Math.round(amount * 100);

  try {
    await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;
  } catch (error) {
    console.error(error);
    return { message: 'Database Error: Failed to Update Invoice.' };
  }

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function deleteInvoice(id: string) {
  try {
    // Correct logic: Delete the invoice from the database
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    // Revalidate the path to update the UI after deletion
    revalidatePath("/dashboard/invoices");
  } catch (error) {
    console.error(error);
    return { message: 'Database Error: Failed to Delete Invoice.' };
  }
}
