// Substitui a API window.storage (só existe dentro do Claude.ai) por uma
// versão apoiada numa base de dados Supabase gratuita — assim, um clube que
// preencha o boletim no seu computador e o Gabinete Técnico no computador da
// associação veem e gravam exatamente os mesmos dados. Mantém a mesma forma
// (assíncrona, mesmos nomes) para o resto do código (App.jsx) não precisar
// de nenhuma alteração.
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./supabase-config.js";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const TABELA = "storage_kv";

if (typeof window !== "undefined") {
  window.storage = {
    async get(key) {
      const { data, error } = await supabase.from(TABELA).select("value").eq("key", key).maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return { key, value: data.value, shared: true };
    },
    async set(key, value) {
      const { error } = await supabase.from(TABELA).upsert({ key, value, updated_at: new Date().toISOString() });
      if (error) throw error;
      return { key, value, shared: true };
    },
    async delete(key) {
      const { data } = await supabase.from(TABELA).select("key").eq("key", key).maybeSingle();
      const existed = !!data;
      const { error } = await supabase.from(TABELA).delete().eq("key", key);
      if (error) throw error;
      return { key, deleted: existed, shared: true };
    },
    async list(prefix) {
      let query = supabase.from(TABELA).select("key");
      if (prefix) query = query.like("key", `${prefix}%`);
      const { data, error } = await query;
      if (error) throw error;
      return { keys: (data || []).map((d) => d.key), prefix, shared: true };
    },
  };
}
