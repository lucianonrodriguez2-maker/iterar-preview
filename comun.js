/* ITERAR — utilidades compartidas por los mockups.
   - Datos de EJEMPLO para el tablero de demostración (siempre rotulados como ejemplo en pantalla).
   - Indicadores públicos REALES (dólar oficial e inflación mensual) leídos en vivo de sus fuentes.
     Si la fuente no responde se muestra "sin conexión", nunca un número inventado. */
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

  const DIAGNOSTICO_URL = 'https://discovery-emprendedores.vercel.app/negocio-diagnostico.html';

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

  root.COMUN = { EJEMPLO, DIAGNOSTICO_URL, indicadores, linea, logo };
})(window);
