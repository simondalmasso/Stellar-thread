# Stellar-thread

**Real Interstellar Messaging & Listening Console**

Stellar-thread es una webapp full-stack y laboratorio DSP verificable para componer mensajes interestelares, preparar propuestas de transmisión, calcular propagación física, procesar observaciones radioastronómicas y revisar candidatos sin fingir conversación instantánea ni respuestas extraterrestres.

## Reality V2

La interfaz tiene cinco áreas primarias: `THREADS`, `UNIVERSE`, `LISTEN`, `LAB` y `MISSION`.

- Ledger persistente en Cloudflare D1 para hilos, mensajes CMP, propuestas, pruebas instrumentales y revisiones humanas.
- Un mensaje permanece `DRAFT`, `ENCODED` o `PROPOSAL_READY` hasta que un operador autorizado registra una `TransmissionProof` válida. Sólo entonces puede pasar a `TRANSMITTED_PROOFED` e `IN_FLIGHT`.
- Propagación calculada con `c = 299.792.458 m/s`, timestamp persistido, distancia catalogada y límites físicos deterministas.
- Vista física con línea de visión, esfera isotrópica o cono direccional. La vista narrativa está marcada `NOT TO SCALE`; ningún glifo visual se presenta como paquete físico.
- Catálogo versionado de seis objetivos cercanos con identificadores Gaia, HIP o SIMBAD, época astrométrica, movimiento propio, velocidad radial cuando está disponible e incertidumbres declaradas.
- Cálculo de punto de puntería futuro por movimiento propio y ensanchamiento de incertidumbre cuando faltan parámetros.
- `CMP-1` funcional con preámbulo, versión, perfil, destino, época, payload, CRC-32, SHA-256 y FEC repetition-3. Cualquier valor de repetición distinto de `3` se rechaza.
- API Cloudflare Worker `/api/v1`, autenticación Bearer separada para operaciones, respuestas 500 saneadas, rate limit básico y SSE etiquetado exclusivamente como `SYNTHETIC TEST STREAM`.
- `cosmic-listener` Python con señales deterministas, STFT, de-Doppler, periodicidad, bursts, rechazo RFI on/off-source, coincidencia multiestación, NPY, SigMF y adaptador opcional `blimpy`.
- Control auténtico y reproducible de Voyager 1 derivado del archivo público de Berkeley SETI/Breakthrough Listen. Está clasificado `HUMAN_TECHNOLOGICAL_CONTROL`, `RECORDED_AUTHENTIC` y `extraterrestrial=false`.
- Moon Relay con fallback de distancia lunar media y contrato de adaptador JPL Horizons para una planificación EME operativa.
- Silence Map sin afirmaciones de cobertura cuando no existen horas de observación verificadas.

## Estado operativo

```text
PERSISTENCE_IMPLEMENTED=D1
PRODUCTION_DEPLOYED=NO
LIVE_OBSERVATORY_CONNECTED=NO
PHYSICAL_TRANSMISSIONS_EXECUTED=NO
RF_GATE=CLOSED
OPTICAL_ACTUATION=ABSENT
AUTHENTIC_DATASET=VOYAGER_1_HUMAN_CONTROL
EXTRATERRESTRIAL_CANDIDATES=0
```

La persistencia D1, migraciones y Worker fueron verificados localmente en CI. El despliegue productivo requiere credenciales Cloudflare, ejecución manual del workflow protegido y aprobación del owner. El software no contiene una ruta pública para controlar SDR TX, amplificadores, transmisores de alta potencia ni láseres.

## Desarrollo reproducible

```bash
npm ci
npx wrangler d1 migrations apply DB --local
npm run dev
```

Worker local:

```bash
npx wrangler dev --local --port 8787 \
  --var OPERATOR_API_TOKEN:<token-local-largo> \
  --var BUILD_SOURCE_SHA:local \
  --var BUILD_TREE_SHA:local \
  --var BUILD_TIME_UTC:2026-08-05T00:00:00.000Z
```

DSP:

```bash
python -m pip install -c listener/constraints.txt -e ./listener
cosmic-listener doctor
cosmic-listener observe --synthetic --duration 4 --output artifacts/candidate.json
```

## Verificación

```bash
npm ci
npm run test:core
npm run typecheck
npm run build
npm run audit:secrets
npm run licenses
npm run test:worker
npm run test:e2e
python -m unittest discover -s listener/tests -p 'test_*.py' -v
```

GitHub Actions verifica en el SHA exacto:

- snapshot de fuente y árbol Git;
- lockfile y `npm ci`;
- tests TypeScript y Python;
- typecheck y build;
- D1 local + Worker integration;
- autorización de endpoints operator-only;
- Playwright desktop/mobile y capturas UX;
- DSP sintético;
- descarga, hash, derivación y replay del control auténtico Voyager;
- secret scan, inventario de licencias y merge verification.

## Gates físicos y regulatorios

`POST /api/v1/transmissions/proposal` sólo crea una propuesta persistida y bloqueada. Una transmisión física exige instalación y operador autorizados, banda y modulación permitidas, identificación reglamentaria, control de interferencias, revisión científica, evidencia instrumental y aprobación explícita del owner. `ALLOW_PHYSICAL_TRANSMISSION=false` permanece como invariante de despliegue y no habilita hardware.

## Documentación

La arquitectura, Truth Layer, CMP-1, catálogo, propagación, EME, canal óptico, DSP, RFI, lifecycle de candidatos, fuentes, seguridad, regulación, pruebas, operación, despliegue y recuperación están documentados en `docs/`.

## Licencia

MIT. Las dependencias conservan sus licencias originales; revisar `THIRD_PARTY_NOTICES.md` y el inventario generado por CI antes de una release.
