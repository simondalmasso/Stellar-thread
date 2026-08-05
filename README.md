# Stellar-thread

**Real Interstellar Messaging & Listening Console**

Stellar-thread es una webapp y laboratorio DSP verificable para componer mensajes interestelares, preparar propuestas de transmisión, visualizar latencias físicas, importar observaciones radioastronómicas y revisar candidatos sin fingir una conversación instantánea.

## Estado operativo

- Dashboard React/TypeScript responsive con mapa 3D, wavefront, hilos por objetivo, Message Lab, Moon Relay, waterfall, Signal Passport, Silence Map y Truth Layer.
- API Cloudflare Worker con contratos `/api/v1`, SSE rotulado exclusivamente como `SYNTHETIC TEST STREAM` y gate absoluto antes de RF.
- `CMP-1` funcional: frame, preámbulo, perfil, destino, época, payload, checksum CRC-32, hash FNV-1a-64 y FEC repetition-3.
- `cosmic-listener` Python: generador determinista IQ, STFT, búsqueda de drift por dechirp coherente, periodicidad, bursts, RFI on/off-source, coincidencia multiestación, SigMF/NPY y adapter opcional `blimpy`.
- Catálogo estático versionado de seis objetivos, derivado de fuentes astronómicas oficiales y marcado como snapshot cacheado.
- Ninguna transmisión física ejecutada. Ningún observatorio live conectado. Ningún candidato auténtico cargado.

## Desarrollo

```bash
npm install
npm run dev
# otra terminal
npx wrangler dev
```

DSP:

```bash
PYTHONPATH=listener python -m cosmic_listener.cli doctor
PYTHONPATH=listener python -m cosmic_listener.cli observe --synthetic --duration 4 --output artifacts/candidate.json
PYTHONPATH=listener python -m cosmic_listener.cli stream --synthetic --count 3
```

Pruebas:

```bash
npm run test:core
PYTHONPATH=listener python -m unittest discover -s listener/tests -p 'test_*.py' -v
npm run typecheck
npm run build
npm run test:e2e
npm run audit:secrets
```

## Límites físicos y regulatorios

La aplicación no contiene una ruta pública para controlar transmisores, SDR TX, amplificadores ni láseres. `POST /api/v1/transmissions/proposal` produce una propuesta bloqueada hasta que existan revisión científica, revisión reglamentaria, aprobación de instalación, operador habilitado y aprobación explícita del owner. `ALLOW_PHYSICAL_TRANSMISSION` permanece en `false` y no habilita hardware: sólo informa el estado del despliegue.

## Fuentes primarias estudiadas

- NASA Exoplanet Archive TAP/API: catálogo de planetas confirmados.
- Breakthrough Listen Open Data Archive: productos HDF5 y contexto on/off-source.
- UCBerkeleySETI `blimpy` (BSD-3-Clause) y `blipss` (MIT): formatos y búsquedas periódicas.
- SETI Institute: narrowband/RFI, LaserSETI y protocolos post-detección.
- ARRL: EME como enlace Earth–Moon–Earth con reflector lunar pasivo.
- Sónar Calling GJ 273b: bootstrap progresivo, binario explícito y baja tasa de bits.
- ENACOM e ITU: licencia, bandas, condiciones y prevención de interferencia perjudicial.

Detalle y URLs en `docs/DATA_SOURCES.md` y `THIRD_PARTY_NOTICES.md`.

## Licencia

MIT. Las dependencias conservan sus licencias originales.
