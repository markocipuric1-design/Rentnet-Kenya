"use server";

export async function verifyAdminSecret(code: string): Promise<boolean> {
  return code === process.env.ADMIN_REGISTRATION_SECRET;
}
