import { describe, it, expect } from "vitest";
import { parseRssEventos } from "@/lib/integraciones/unimayor-rss";

const XML_MUESTRA = `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0"><channel><title>UNIMAYOR</title>
<item>
  <title>Feria Ambiental UNIMAYOR: Campus Verde.</title>
  <link>https://www.unimayor.edu.co/component/content/article/392?catid=9</link>
  <description><![CDATA[<p><img src="https://www.unimayor.edu.co/images/feria.webp" /></p><p><strong>Lugar:</strong> Sede Bicentenario.</p>]]></description>
  <pubDate>Fri, 28 Aug 2026 21:11:42 -0500</pubDate>
</item>
<item><title></title><link>https://x</link></item>
</channel></rss>`;

describe("parseRssEventos", () => {
  it("normaliza items con imagen y lugar", () => {
    const eventos = parseRssEventos(XML_MUESTRA);
    expect(eventos).toHaveLength(1);
    expect(eventos[0].titulo).toBe("Feria Ambiental UNIMAYOR: Campus Verde.");
    expect(eventos[0].imagen).toBe("https://www.unimayor.edu.co/images/feria.webp");
    expect(eventos[0].lugar).toBe("Sede Bicentenario.");
  });

  it("descarta items sin título", () => {
    const eventos = parseRssEventos(XML_MUESTRA);
    expect(eventos.every((e) => e.titulo.length > 0)).toBe(true);
  });
});
