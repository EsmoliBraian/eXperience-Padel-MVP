import { supabase } from '@/lib/supabaseClient'

export async function uploadSlideImage(file: File): Promise<string> {
  const path = `${Date.now()}-${file.name}`
  const { error } = await supabase.storage.from('slides').upload(path, file)
  if (error) throw error
  return supabase.storage.from('slides').getPublicUrl(path).data.publicUrl
}
