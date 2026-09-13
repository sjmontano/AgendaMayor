import { XMLParser } from 'fast-xml-parser';

/**
 * Integración con el portal UNIMAYOR (Joomla, sin API JSON pública).
 * Fuente: feed RSS de la categoría Eventos (catid=9).
 *
 * Estrategia: el backend (server-side, con caché) consume el RSS y el
 * admin importa los items como EVENTO tipo OFICIAL. Nunca desde el cliente.
 */

const RSS_EVENTOS_URL =
  'https://www.unimayor.edu.co/index.php/component/content/category/9-eventos?Itemid=508&format=feed&type=rss';

export interface EventoExterno {
  titulo: string;
  urlOrigen: string;
  descripcionTexto: string;
  imagen: string | null;
  lugar: string | null;
  publicadoEn: string | null;
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function primeraImagen(html: string): string | null {
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (!m) return null;
  const src = m[1];
  if (src.startsWith('http')) return src;
  if (src.startsWith('/')) return `https://www.unimayor.edu.co${src}`;
  return src;
}

function extraerLugar(html: string): string | null {
  const m = html.match(/<strong>\s*Lugar:?\s*<\/strong>\s*([^<]+)/i);
  return m ? stripHtml(m[1]).slice(0, 100) : null;
}

/**
 * Descarga y normaliza el RSS de eventos de UNIMAYOR.
 */
export async function obtenerEventosUnimayor(): Promise<EventoExterno[]> {
  const res = await fetch(RSS_EVENTOS_URL, {
    headers: { 'User-Agent': 'AgendaMayor/1.0 (+https://unimayor.edu.co)' },
    next: { revalidate: 3600 }, // caché 1h: el portal no tiene API, no saturarlo
  });

  if (!res.ok) {
    throw new Error(`RSS UNIMAYOR respondió ${res.status}`);
  }

  const xml = await res.text();
  return parseRssEventos(xml);
}

/**
 * Parsea el XML del RSS a eventos normalizados (función pura, testeable).
 */
export function parseRssEventos(xml: string): EventoExterno[] {
  const parser = new XMLParser({ ignoreAttributes: false });
  const doc = parser.parse(xml);
  const items = doc?.rss?.channel?.item ?? [];
  const lista = Array.isArray(items) ? items : [items];

  return lista
    .map((it: Record<string, unknown>) => {
      const descripcionHtml = String(it.description ?? "");
      return {
        titulo: stripHtml(String(it.title ?? "")).slice(0, 200),
        urlOrigen: String(it.link ?? ""),
        descripcionTexto: stripHtml(descripcionHtml).slice(0, 2000),
        imagen: primeraImagen(descripcionHtml),
        lugar: extraerLugar(descripcionHtml),
        publicadoEn: it.pubDate ? String(it.pubDate) : null,
      };
    })
    .filter((e: EventoExterno) => e.titulo.length > 0);
}
