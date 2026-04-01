import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // server-only
)

// Upload a receipt and return its public URL
export async function uploadReceipt(
  userId: string,
  file: Buffer,
  mimeType: string,
  filename: string
): Promise<string> {
  const path = `${userId}/${Date.now()}-${filename}`
  const { error } = await supabase.storage
    .from('receipts')
    .upload(path, file, { contentType: mimeType, upsert: false })
  if (error) throw error

  const { data } = supabase.storage.from('receipts').getPublicUrl(path)
  return data.publicUrl
}

// Delete a receipt by its URL path
export async function deleteReceipt(url: string): Promise<void> {
  const path = url.split('/receipts/')[1]
  if (!path) return
  await supabase.storage.from('receipts').remove([path])
}
