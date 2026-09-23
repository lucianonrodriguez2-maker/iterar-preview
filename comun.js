/* ITERAR — utilidades compartidas por las páginas del sitio.
   - Datos de EJEMPLO para el tablero de demostración (siempre rotulados como ejemplo en pantalla).
   - Indicadores públicos REALES (dólar oficial e inflación mensual) leídos en vivo de sus fuentes.
     Si la fuente no responde se muestra "sin conexión", nunca un número inventado.
   - Configuración de contacto y medición: lo que está vacío se oculta o no se carga. */
(function (root) {
  const MESES = ['oct', 'nov', 'dic', 'ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep'];
  // Empresa ficticia, en millones de pesos. Serie fija (no aleatoria) para que el ejemplo sea siempre el mismo.
  const ventas = [182, 190, 231, 176, 171, 198, 205, 214, 209, 226, 221, 238];
  const costos = [131, 138, 163, 131, 126, 142, 149, 158, 157, 171, 172, 181];
  const EJEMPLO = {
    empresa: 'Comercial Ejemplo S.A.',
    meses: MESES, ventas, costos,
    margen: ventas.map((v, i) => Math.round((v - costos[i]) / v * 1000) / 10),
    lineas: [
      { nombre: 'Línea A', margen: 31.2, delta: +0.8 },
      { nombre: 'Línea B', margen: 18.4, delta: -4.1 },
      { nombre: 'Línea C', margen: 26.7, delta: +0.3 }
    ],
    cobranzasPendientes: 64, proyeccion: [244, 251, 259]
  };

  /* ---- Configuración ---- */
  // Diagnóstico propio, con la marca ITERAR (autoevaluación en el mismo sitio).
  const DIAGNOSTICO_URL = 'autoevaluacion.html';
  // Diagnóstico de Matías (otra marca). Queda disponible por si los socios deciden usarlo.
  const DIAGNOSTICO_EXTERNO = 'https://discovery-emprendedores.vercel.app/negocio-diagnostico.html';
  // Número de WhatsApp en formato internacional sin "+", por ejemplo 5491112345678. Vacío = el botón no se muestra.
  const WHATSAPP = '';
  const MAIL = 'hola@iterarconsulting.com.ar';
  // Medición: dominio de Plausible o ID de GA4 (G-XXXX). Vacío = no se carga nada externo.
  const MEDICION = { plausible: '', ga4: '' };

  /* ---- Puerta: pyme o empresa grande (se recuerda en el navegador) ---- */
  const PUERTAS = ['pyme', 'grande'];
  function puerta(nueva) {
    try {
      if (nueva && PUERTAS.includes(nueva)) localStorage.setItem('iterar-puerta', nueva);
      const p = new URLSearchParams(location.search).get('puerta');
      if (p && PUERTAS.includes(p)) { localStorage.setItem('iterar-puerta', p); return p; }
      return localStorage.getItem('iterar-puerta') || 'pyme';
    } catch { return nueva || 'pyme'; }
  }

  /* ---- Medición: un solo punto de entrada. Manda a Plausible o GA4 si están configurados. ---- */
  function cargarMedicion() {
    if (MEDICION.plausible) {
      const s = document.createElement('script'); s.defer = true; s.dataset.domain = MEDICION.plausible; s.src = 'https://plausible.io/js/script.tagged-events.js'; document.head.appendChild(s);
    }
    if (MEDICION.ga4) {
      const s = document.createElement('script'); s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + MEDICION.ga4; document.head.appendChild(s);
      root.dataLayer = root.dataLayer || []; root.gtag = function () { root.dataLayer.push(arguments); }; root.gtag('js', new Date()); root.gtag('config', MEDICION.ga4);
    }
  }
  function medir(evento, params = {}) {
    const p = Object.assign({ pagina: location.pathname.split('/').pop() || 'inicio', puerta: puerta(), celular: innerWidth < 800 }, params);
    try { if (root.plausible) root.plausible(evento, { props: p }); } catch {}
    try { if (root.gtag) root.gtag('event', evento, p); } catch {}
    (root.dataLayer = root.dataLayer || []).push(Object.assign({ event: evento }, p));
    if (location.hostname === 'localhost') console.debug('[medir]', evento, p);
  }

  /* ---- Enlace al diagnóstico con origen y lo marcado en "¿Te suena?" ---- */
  function linkDiagnostico(cta, marcados) {
    const u = new URL(DIAGNOSTICO_URL, location.href);
    u.searchParams.set('origen', 'iterar');
    if (cta) u.searchParams.set('cta', cta);
    u.searchParams.set('puerta', puerta());
    if (marcados && marcados.length) u.searchParams.set('p', marcados.join(','));
    return u.pathname.split('/').pop() + u.search;
  }
  function linkWhatsApp(texto) {
    if (!WHATSAPP) return '';
    return 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(texto || 'Hola, vengo del sitio de ITERAR.');
  }

  async function indicadores() {
    const out = { dolar: null, inflacion: null };
    const get = async (u) => { const r = await fetch(u, { cache: 'no-store' }); if (!r.ok) throw new Error(r.status); return r.json(); };
    await Promise.all([
      get('https://dolarapi.com/v1/dolares/oficial').then(d => { out.dolar = { venta: d.venta, compra: d.compra, fecha: d.fechaActualizacion, fuente: 'dolarapi.com' }; }).catch(() => {}),
      get('https://api.argentinadatos.com/v1/finanzas/indices/inflacion').then(d => { out.inflacion = { serie: d.slice(-12), fuente: 'INDEC vía argentinadatos.com' }; }).catch(() => {})
    ]);
    return out;
  }

  // Polilínea SVG a partir de una serie
  function linea(serie, w, h, min, max, pad = 0) {
    const n = serie.length;
    return serie.map((v, i) => {
      const x = pad + (w - 2 * pad) * (i / (n - 1)), y = h - pad - (h - 2 * pad) * ((v - min) / (max - min));
      return (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
    }).join('');
  }

  function logo(k, extra = '') {
    // Logo elegido: concepto A (vuelta abierta) con el punto en azul, en todas las rutas.
    return `<svg class="logo-mark ${extra}" viewBox="-50 -50 100 100" style="--accent:#2340E8" aria-hidden="true">${root.ITERAR.mark('A')}</svg>`;
  }

  // Une fuentes con "y" / "e" según corresponda ("dolarapi.com e INDEC").
  function unir(lista) {
    if (lista.length < 2) return lista.join('');
    const ult = lista[lista.length - 1];
    const conj = /^h?i/i.test(ult) ? ' e ' : ' y ';
    return lista.slice(0, -1).join(', ') + conj + ult;
  }

  root.COMUN = { EJEMPLO, DIAGNOSTICO_URL, DIAGNOSTICO_EXTERNO, WHATSAPP, MAIL, MEDICION, puerta, cargarMedicion, medir, linkDiagnostico, linkWhatsApp, indicadores, linea, logo, unir };
  cargarMedicion();
})(window);
