-- ==========================================================================
-- MIGRATION: label QR scan + progress-update anonim
-- Jalankan di Supabase SQL Editor (satu kali, aman kalau diulang).
-- ==========================================================================

-- 1) Kolom baru untuk log perpindahan status
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS status_history jsonb NOT NULL DEFAULT '[]'::jsonb;

-- 2) Fungsi RPC: majukan status berdasar tracking_token, tanpa perlu login.
--    Aman karena:
--      - Hanya menerima token, tidak menerima kolom sembarang.
--      - Transisi hanya maju satu langkah di alur Diterima→...→Selesai.
--      - Tidak pernah mengubah pembayaran, total, harga, dll.
CREATE OR REPLACE FUNCTION public.advance_order_status(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row  public.orders%ROWTYPE;
  v_flow text[] := ARRAY['Diterima','Mencuci','Mengeringkan','Menyetrika','Selesai'];
  v_idx  int;
  v_next text;
  v_now  timestamptz := now();
  v_hist jsonb;
BEGIN
  IF p_token IS NULL OR length(p_token) < 6 THEN
    RETURN jsonb_build_object('error','bad_token');
  END IF;

  SELECT * INTO v_row FROM public.orders WHERE tracking_token = p_token LIMIT 1;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error','not_found');
  END IF;

  v_idx := array_position(v_flow, v_row.status);
  IF v_idx IS NULL THEN
    -- status di luar alur (misal 'Diambil') — tidak boleh maju
    RETURN jsonb_build_object('error','not_in_flow','current',v_row.status);
  END IF;
  IF v_idx >= array_length(v_flow, 1) THEN
    -- sudah di ujung (Selesai)
    RETURN jsonb_build_object('error','already_final','current',v_row.status);
  END IF;

  v_next := v_flow[v_idx + 1];
  v_hist := COALESCE(v_row.status_history, '[]'::jsonb)
            || jsonb_build_array(jsonb_build_object(
                 'status', v_next,
                 'at',     v_now,
                 'from',   v_row.status
               ));

  UPDATE public.orders
     SET status = v_next,
         status_history = v_hist
   WHERE tracking_token = p_token;

  RETURN jsonb_build_object(
    'ok',     true,
    'status', v_next,
    'at',     v_now,
    'name',   v_row.name,
    'phone',  v_row.phone,
    'id',     v_row.id,
    'history', v_hist
  );
END;
$$;

-- 3) Anon boleh eksekusi RPC ini (tidak boleh UPDATE langsung ke tabel orders)
GRANT EXECUTE ON FUNCTION public.advance_order_status(text) TO anon, authenticated;
