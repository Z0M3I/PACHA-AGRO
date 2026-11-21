/**
 * Pruebas de extremo a extremo de AgroBolivia (Playwright, Chromium).
 * Requisitos: backend corriendo con el frontend compilado en http://localhost:8000 y SEED_DEMO=true.
 * Uso: node e2e/run.cjs [URL]
 */
const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')

const BASE = process.argv[2] || 'http://localhost:8000'
const OUT = path.join(__dirname, 'output')
fs.mkdirSync(OUT, { recursive: true })
const results = []

async function test(name, fn) {
  const t0 = Date.now()
  try { const info = await fn(); results.push({ name, ok: true, ms: Date.now() - t0, info }); console.log(`✔ ${name}${info ? ' — ' + info : ''}`) }
  catch (e) { results.push({ name, ok: false, ms: Date.now() - t0, error: e.message }); console.log(`✘ ${name}\n   ${e.message.split('\n')[0]}`) }
}
const assert = (c, m) => { if (!c) throw new Error(m) }

;(async () => {
  const browser = await chromium.launch()
  const phone = { viewport: { width: 360, height: 740 }, hasTouch: true, isMobile: true }
  const newPage = async (opts = phone) => {
    const ctx = await browser.newContext(opts)
    const p = await ctx.newPage()
    p.errors = []
    p.on('pageerror', e => p.errors.push(e.message))
    return p
  }
  const btn = (p, name) => p.getByRole('button', { name }).first()
  const login = async (p, phoneNo) => {
    await p.goto(`${BASE}/#/ingresar`)
    await p.fill('input[autocomplete=tel]', phoneNo); await p.fill('input[type=password]', 'demo1234')
    await btn(p, /^Ingresar$/).click(); await p.waitForSelector('text=Comunidad Demo Challapata')
  }

  await test('Inicio: las 4 acciones principales son visibles sin desplazarse (360×740)', async () => {
    const p = await newPage()
    await p.goto(BASE)
    const navTop = (await p.locator('nav[aria-label="Navegación principal"]').boundingBox()).y
    for (const t of ['¿Cuándo puedo sembrar?', '¿Cómo estará el clima?', 'Mi comunidad', 'Consultar por WhatsApp']) {
      const b = await p.getByRole('link', { name: new RegExp(t.replace(/[?¿]/g, '.')) }).first().boundingBox()
      assert(b && b.y + b.height * 0.5 < navTop, `"${t}" no es visible sobre la navegación`)
    }
    await p.screenshot({ path: `${OUT}/inicio-360.png` })
    assert(p.errors.length === 0, p.errors.join(';'))
  })

  await test('Siembra: consulta completa en 7 toques, sin registro', async () => {
    const p = await newPage()
    await p.goto(BASE)
    const t0 = Date.now(); let taps = 0
    const tap = async (l) => { await l.click(); taps++ }
    await tap(p.getByRole('link', { name: /Cuándo puedo sembrar/ }).first())
    for (const t of [/^Oruro$/, /Challapata/, /Quinua/, /Pandela/, /Sí, está húmedo/, /Depende de la lluvia/]) await tap(btn(p, t))
    await p.getByTestId('main-action').waitFor()
    const status = await p.locator('section[aria-live]').first().innerText()
    assert(/favorables|precaución|desfavorables|insuficiente/.test(status), 'sin semáforo')
    assert(await p.locator('text=Fuente:').count() > 0, 'no muestra fuentes')
    assert(await p.getByTestId('sim-badge').count() === 0, 'consulta real no debe tener la etiqueta "Caso simulado"')
    const msg = decodeURIComponent((await p.getByTestId('share-whatsapp').getAttribute('href')).split('text=')[1])
    assert(msg.includes('Quinua en Challapata') && msg.includes('Orientación experimental'), 'mensaje incompleto: ' + msg)
    assert(!msg.includes('Caso simulado'), 'mensaje real no debe decir "Caso simulado"')
    await p.screenshot({ path: `${OUT}/siembra-resultado.png`, fullPage: true })
    return `${taps} toques, ${(Date.now() - t0) / 1000}s automatizado; resultado: ${status.split('\n').find(x => x.trim().length > 3)}`
  })

  await test('Demo: «Probar con quinua en Challapata» sin cuenta ni formulario, etiquetado como simulado', async () => {
    const p = await newPage()
    await p.goto(BASE)
    const link = p.getByTestId('demo-case')
    assert((await link.innerText()).includes('Caso simulado'), 'el acceso no dice "Caso simulado"')
    await link.click()
    await p.getByTestId('main-action').waitFor()
    assert(p.url().endsWith('#/sembrar/demo'), 'ruta inesperada ' + p.url())
    assert(await p.getByTestId('sim-badge').isVisible(), 'falta la etiqueta "Caso simulado" en el resultado')
    const head = (await p.locator('main').innerText()).toLowerCase()  // innerText aplica text-transform
    for (const t of ['Quinua en Challapata', 'Pandela', 'Caso simulado', 'Orientación experimental', 'Lo que más pesa', 'Qué hacer ahora'])
      assert(head.includes(t.toLowerCase()), `falta "${t}" en el resultado`)
    // En 360 px: la acción principal está en la primera pantalla y antes de la lista de criterios
    const act = await p.getByTestId('main-action').boundingBox()
    const list = await p.getByRole('heading', { name: 'Todos los factores' }).boundingBox()
    const navTop = (await p.locator('nav[aria-label="Navegación principal"]').boundingBox()).y
    assert(act.y + act.height <= navTop, `acción principal fuera de la primera pantalla (${act.y + act.height} > ${navTop})`)
    assert(act.y < list.y, 'la acción principal no aparece antes de los criterios')
    const msg = decodeURIComponent((await p.getByTestId('share-whatsapp').getAttribute('href')).split('text=')[1])
    for (const t of ['Quinua en Challapata', 'Resultado:', 'Caso simulado', 'Orientación experimental'])
      assert(msg.includes(t), `mensaje sin "${t}": ${msg}`)
    await p.getByText('Ver el mensaje que se enviará').click()
    assert((await p.getByTestId('share-preview').innerText()) === msg, 'la vista previa no coincide con el mensaje enviado')
    await p.screenshot({ path: `${OUT}/demo-challapata-360.png` })
    // Reproducible: dos consultas seguidas dan el mismo resultado
    const r1 = await p.evaluate(() => fetch('/api/recommendations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ municipality_id: 'or-challapata', crop: 'quinua', variety: 'Pandela', soil_moisture: 'si', irrigation: 'secano', mode: 'simulado' }) }).then(r => r.json()))
    const r2 = await p.evaluate(() => fetch('/api/recommendations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ municipality_id: 'or-challapata', crop: 'quinua', variety: 'Pandela', soil_moisture: 'si', irrigation: 'secano', mode: 'simulado' }) }).then(r => r.json()))
    assert(r1.status === r2.status && r1.key_factor.id === r2.key_factor.id && r1.main_action === r2.main_action, 'resultado no reproducible')
    // Desde la demo se puede pasar a datos reales con las mismas respuestas
    await btn(p, /Consultar con datos reales/).click()
    await p.getByTestId('main-action').waitFor()
    assert(await p.getByTestId('sim-badge').count() === 0, 'tras pasar a datos reales sigue la etiqueta "Caso simulado"')
    const realMsg = decodeURIComponent((await p.getByTestId('share-whatsapp').getAttribute('href')).split('text=')[1])
    assert(!realMsg.includes('Caso simulado') && realMsg.includes('Orientación experimental'), 'mensaje real incorrecto')
    return `${r1.status} · factor: ${r1.key_factor.label} · acción: ${r1.main_action}`
  })

  await test('Demo: el caso simulado no cambia la ubicación guardada', async () => {
    const p = await newPage()
    await p.addInitScript(() => { if (!sessionStorage.getItem('x')) { localStorage.setItem('agb_municipality', 'lp-el-alto'); sessionStorage.setItem('x', '1') } })
    await p.goto(`${BASE}/#/sembrar/demo`); await p.getByTestId('main-action').waitFor()
    assert(await p.evaluate(() => localStorage.getItem('agb_municipality')) === 'lp-el-alto', 'cambió la ubicación')
  })

  await test('Siembra: cultivo sin reglas muestra "Información insuficiente" sin recomendar', async () => {
    const p = await newPage()
    await p.goto(`${BASE}/#/sembrar`)
    for (const t of [/^Oruro$/, /Challapata/, /Haba/, /Usnayo/, /Sí, está húmedo/, /Tengo riego/]) await btn(p, t).click()
    await p.waitForSelector('text=Información insuficiente')
    assert(await p.locator('text=Todos los factores').count() === 0, 'no debería mostrar criterios')
    assert(await p.locator('text=Faltan datos').count() === 1, 'debe decir que faltan datos')
  })

  await test('Clima: sin pronóstico se explica el problema y se ofrece demostración SIMULADA', async () => {
    const p = await newPage()
    await p.route('**/api/weather?*mode=real', async route => {
      const r = await route.fetch(); const j = await r.json()
      j.forecast = { ...j.forecast, available: false, daily: [], error: 'Prueba: servicio de pronóstico caído.' }
      await route.fulfill({ response: r, json: j })
    })
    await p.addInitScript(() => localStorage.setItem('agb_municipality', 'or-oruro'))
    await p.goto(`${BASE}/#/clima`)
    await p.waitForSelector('text=No hay pronóstico disponible')
    await btn(p, /Ver demostración/).click()
    await btn(p, /Volver a datos reales/).waitFor()  // solo existe en modo simulado (evita carrera con el aviso previo)
    assert(await p.locator('text=SIMULADO').count() > 0, 'falta etiqueta SIMULADO')
    await p.screenshot({ path: `${OUT}/clima-simulado.png`, fullPage: true })
  })

  await test('Clima: error de red muestra mensaje comprensible y botón de reintento', async () => {
    const p = await newPage()
    await p.addInitScript(() => localStorage.setItem('agb_municipality', 'or-oruro'))
    await p.route('**/api/weather*', r => r.abort())
    await p.goto(`${BASE}/#/clima`)
    await p.waitForSelector('text=No hay conexión con AgroBolivia')
    assert(await btn(p, /Intentar de nuevo/).isVisible(), 'sin reintento')
  })

  await test('Registro: valida datos y crea cuenta', async () => {
    const p = await newPage()
    await p.goto(`${BASE}/#/registro`)
    await p.fill('input[autocomplete=name]', 'Ana Choque'); await p.fill('input[autocomplete=tel]', '123'); await p.fill('input[type=password]', 'clave123')
    await btn(p, /Crear cuenta/).click()
    await p.waitForSelector('text=celular de Bolivia')
    const num = '6' + String(Math.floor(Math.random() * 1e7)).padStart(7, '0')
    await p.fill('input[autocomplete=tel]', num); await btn(p, /Crear cuenta/).click()
    await p.waitForSelector('text=Aún no pertenece a ninguna comunidad')
    return `cuenta ${num}`
  })

  await test('Permisos: la agricultora NO puede convocar reuniones ni ver solicitudes', async () => {
    const p = await newPage()
    await login(p, '70000002')
    await p.click('text=Comunidad Demo Challapata'); await p.waitForSelector('text=Planificación de siembra')
    assert(await p.locator('text=Convocar reunión').count() === 0, 've "Convocar reunión"')
    assert(await p.locator('text=Solicitudes').count() === 0, 've "Solicitudes"')
    const r = await p.evaluate(async () => (await fetch('/api/communities/1/meetings', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('agb_token') }, body: JSON.stringify({ title: 'Falsa', place: 'x lugar', starts_at: '2030-01-01T10:00:00' }) })).status)
    assert(r === 403, `API devolvió ${r}`)
    await btn(p, /^✔ Sí$/).click(); await p.waitForSelector('text=Respuesta guardada')
  })

  await test('Reuniones: el representante convoca una reunión y envía recordatorio (simulado)', async () => {
    const p = await newPage()
    await login(p, '70000001')
    await p.click('text=Comunidad Demo Challapata'); await btn(p, /Convocar reunión/).click()
    const d = new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10)
    await p.fill('input[placeholder^="Ej. Planificar"]', 'Prueba e2e de reunión'); await p.fill('input[type=date]', d)
    await p.fill('input[placeholder^="Ej. Sede"]', 'Cancha comunal'); await btn(p, /Guardar/).click()
    await p.waitForSelector('text=Prueba e2e de reunión')
    await p.locator('div', { has: p.locator('text=Prueba e2e de reunión') }).getByRole('button', { name: /Recordar/ }).last().click()
    await p.waitForSelector('text=SIMULADOR (no se enviaron mensajes reales)')
  })

  await test('Reportes: observación queda marcada como comunitaria, no oficial', async () => {
    const p = await newPage()
    await login(p, '70000002')
    await p.click('text=Comunidad Demo Challapata'); await p.getByRole('tab', { name: /Reportes/ }).click()
    await btn(p, /Granizo/).click(); await btn(p, /Enviar reporte/).click()
    await p.waitForSelector('text=No es un aviso oficial')
  })

  await test('WhatsApp: simulador responde y el botón Enviar es visible', async () => {
    const p = await newPage()
    await p.goto(`${BASE}/#/whatsapp`)
    await p.locator('#chat').waitFor()  // la pantalla se carga de forma diferida
    assert(await p.locator('text=no está conectado').count() > 0, 'no avisa que es simulación')
    await p.fill('#chat', '¿Cuándo puedo sembrar quinua en Challapata?')
    const send = btn(p, /^Enviar$/); const b = await send.boundingBox()
    assert(b && b.x + b.width <= 360, 'Enviar fuera de pantalla')
    await send.click(); await p.waitForSelector('text=Quinua en Challapata')
  })

  await test('Aprender: lección con pregunta y fuentes', async () => {
    const p = await newPage()
    await p.goto(`${BASE}/#/aprender/heladas`)
    await btn(p, /despejada/).click(); await p.waitForSelector('text=¡Correcto!')
    assert(await p.locator('text=Fuentes:').count() === 1, 'sin fuentes')
  })

  await test('Adaptación móvil: sin desplazamiento horizontal en todas las pantallas (320 px)', async () => {
    const p = await newPage({ viewport: { width: 320, height: 640 }, isMobile: true })
    const bad = []
    for (const r of ['', 'sembrar', 'clima', 'comunidad', 'whatsapp', 'aprender', 'aprender/granizo', 'ingresar', 'registro']) {
      await p.goto(`${BASE}/#/${r}`); await p.waitForTimeout(600)
      const w = await p.evaluate(() => document.documentElement.scrollWidth)
      if (w > 320) bad.push(`${r || 'inicio'}:${w}`)
    }
    assert(bad.length === 0, `desborde en ${bad.join(', ')}`)
  })

  await test('Conexión lenta (≈400 kbps, 400 ms de latencia): inicio usable', async () => {
    const ctx = await browser.newContext(phone)
    const p = await ctx.newPage()
    const cdp = await ctx.newCDPSession(p)
    await cdp.send('Network.enable')
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 400, downloadThroughput: 400 * 1024 / 8, uploadThroughput: 400 * 1024 / 8 })
    let bytes = 0
    p.on('response', async r => { const l = Number(r.headers()['content-length'] || 0); bytes += l })
    const t0 = Date.now()
    await p.goto(BASE); await p.getByRole('link', { name: /Cuándo puedo sembrar/ }).first().waitFor()
    const ms = Date.now() - t0
    assert(ms < 8000, `tardó ${ms} ms`)
    return `acciones visibles en ${(ms / 1000).toFixed(1)} s`
  })

  await browser.close()
  fs.writeFileSync(path.join(OUT, 'resultados.json'), JSON.stringify(results, null, 2))
  const failed = results.filter(r => !r.ok).length
  console.log(`\n${results.length - failed}/${results.length} pruebas e2e aprobadas`)
  process.exit(failed ? 1 : 0)
})()
