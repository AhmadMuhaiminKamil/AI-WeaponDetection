import supabase from './supabase'

// ── Types ──────────────────────────────────────────────────────────────────

export type WeaponClass = 'pistol' | 'knife' | 'no_weapon'

export interface DetectionRecord {
  id: string
  user_id: string
  class: WeaponClass
  confidence: number
  inference_time_ms: number
  weapon_detected: boolean
  detection_count: number
  result_image: string | null   // storage path: "{user_id}/{filename}"
  created_at: string
}

export interface DetectionPayload {
  class: WeaponClass
  confidence: number
  inference_time_ms: number
  weapon_detected: boolean
  detection_count: number
  result_image_file?: File      // file gambar hasil deteksi (opsional)
}

export interface DetectionStats {
  total_detections: number
  pistol_count: number
  knife_count: number
  no_weapon_count: number
  avg_inference_time_ms: number
  weapon_detection_rate: number
}

// ── Storage helpers ────────────────────────────────────────────────────────

const BUCKET = 'detection-results'

/**
 * Upload gambar hasil deteksi ke Supabase Storage.
 * Path: {user_id}/{timestamp}-{random}.jpg
 * Returns storage path (disimpan di kolom result_image).
 */
export async function uploadResultImage(
  userId: string,
  file: File
): Promise<string | null> {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const path = `${userId}/${filename}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type })

  if (error) {
    console.error('[uploadResultImage]', error.message)
    return null
  }
  return path
}

/**
 * Dapatkan signed URL (berlaku 1 jam) dari storage path.
 * Gunakan ini untuk menampilkan gambar di frontend.
 */
export async function getResultImageUrl(path: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 60) // 1 jam

  if (error || !data) {
    console.error('[getResultImageUrl]', error?.message)
    return null
  }
  return data.signedUrl
}

/**
 * Hapus gambar dari storage.
 */
export async function deleteResultImage(path: string): Promise<boolean> {
  const { error } = await supabase.storage.from(BUCKET).remove([path])
  if (error) {
    console.error('[deleteResultImage]', error.message)
    return false
  }
  return true
}

// ── Detection CRUD ─────────────────────────────────────────────────────────

/**
 * Simpan satu hasil deteksi (+ upload gambar jika ada).
 * Otomatis mengisi user_id dari sesi aktif.
 */
export async function saveDetection(
  payload: DetectionPayload
): Promise<DetectionRecord | null> {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    console.error('[saveDetection] Tidak ada sesi aktif')
    return null
  }

  // Upload gambar kalau ada
  let imagePath: string | null = null
  if (payload.result_image_file) {
    imagePath = await uploadResultImage(user.id, payload.result_image_file)
  }

  const { data, error } = await supabase
    .from('detection_history')
    .insert({
      user_id:          user.id,
      class:            payload.class,
      confidence:       payload.confidence,
      inference_time_ms: payload.inference_time_ms,
      weapon_detected:  payload.weapon_detected,
      detection_count:  payload.detection_count,
      result_image:     imagePath,
    })
    .select()
    .single()

  if (error) {
    console.error('[saveDetection]', error.message)
    return null
  }
  return data
}

/**
 * Ambil semua history deteksi user yang sedang login.
 * Sorted terbaru dulu, limit opsional (default 50).
 */
export async function getDetectionHistory(
  limit = 50
): Promise<DetectionRecord[]> {
  const { data, error } = await supabase
    .from('detection_history')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[getDetectionHistory]', error.message)
    return []
  }
  return data ?? []
}

/**
 * Ambil statistik deteksi dari view detection_stats.
 * Fallback: hitung manual dari detection_history kalau view belum ada.
 */
export async function getDetectionStats(): Promise<DetectionStats | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Coba pakai view dulu
  const { data: viewData, error: viewError } = await supabase
    .from('detection_stats')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!viewError && viewData) {
    return {
      total_detections:     viewData.total_detections,
      pistol_count:         viewData.pistol_count,
      knife_count:          viewData.knife_count,
      no_weapon_count:      viewData.no_weapon_count,
      avg_inference_time_ms: viewData.avg_inference_time_ms,
      weapon_detection_rate: viewData.weapon_detection_rate,
    }
  }

  // Fallback: hitung manual
  const { data, error } = await supabase
    .from('detection_history')
    .select('class, confidence, inference_time_ms, weapon_detected')

  if (error || !data) return null

  const total = data.length
  const pistol = data.filter(d => d.class === 'pistol').length
  const knife = data.filter(d => d.class === 'knife').length
  const noWeapon = data.filter(d => !d.weapon_detected).length
  const avgMs = total > 0
    ? Math.round(data.reduce((s, d) => s + d.inference_time_ms, 0) / total * 100) / 100
    : 0
  const rate = total > 0
    ? Math.round((data.filter(d => d.weapon_detected).length / total) * 1000) / 10
    : 0

  return {
    total_detections:      total,
    pistol_count:          pistol,
    knife_count:           knife,
    no_weapon_count:       noWeapon,
    avg_inference_time_ms: avgMs,
    weapon_detection_rate: rate,
  }
}

/**
 * Hapus satu record deteksi (beserta gambarnya di storage).
 */
export async function deleteDetection(id: string): Promise<boolean> {
  // Ambil path gambar dulu
  const { data } = await supabase
    .from('detection_history')
    .select('result_image')
    .eq('id', id)
    .single()

  // Hapus record
  const { error } = await supabase
    .from('detection_history')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('[deleteDetection]', error.message)
    return false
  }

  // Hapus gambar dari storage kalau ada
  if (data?.result_image) {
    await deleteResultImage(data.result_image)
  }

  return true
}

/**
 * Hapus semua history deteksi milik user aktif.
 * Berguna untuk tombol "Reset" di dashboard.
 */
export async function clearAllDetections(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  // Ambil semua path gambar
  const { data: records } = await supabase
    .from('detection_history')
    .select('result_image')
    .eq('user_id', user.id)
    .not('result_image', 'is', null)

  // Hapus semua records
  const { error } = await supabase
    .from('detection_history')
    .delete()
    .eq('user_id', user.id)

  if (error) {
    console.error('[clearAllDetections]', error.message)
    return false
  }

  // Hapus semua gambar dari storage
  if (records && records.length > 0) {
    const paths = records.map(r => r.result_image).filter(Boolean) as string[]
    if (paths.length > 0) {
      await supabase.storage.from(BUCKET).remove(paths)
    }
  }

  return true
}