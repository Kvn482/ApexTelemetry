# 🏎️ ApexTelemetry

**ApexTelemetry** es una plataforma moderna de telemetría, análisis de conducción y asistencia de ingeniería de pista para **Sim Racing** (automovilismo virtual). Diseñada para ayudar a pilotos virtuales a encontrar décimas de segundo, corregir técnicas de frenada (*trail braking*), optimizar el paso por curva y comparar datos vuelta a vuelta.

Desarrollada con **React 19**, **TypeScript**, **Vite** y **Tailwind CSS v4**, la aplicación funciona 100% en el cliente, procesando y renderizando la telemetría directamente en el navegador con máxima fluidez y privacidad.

---

## ✨ Características Principales

### 📊 1. Dashboard de Rendimiento
- Métricas clave en tiempo real: sesiones totales, vueltas registradas, tiempo en pista y récords por circuito.
- Gráfica de evolución de ritmo y consistencia en el tiempo.
- Acceso directo a sesiones recientes y mejores vueltas personales.

### ⏱️ 2. Análisis Detallado de Vueltas (Lap Analysis)
- **Gráficos Sincronizados de Alta Fidelidad**: Curvas de velocidad, pedales (acelerador y freno con áreas rellenas), marcha, régimen de giro (RPM) y ángulo del volante.
- **Track Map Interactivo SVG**: Visualización del trazado del circuito, delimitación de los tres sectores y cursor dinámico en tiempo real.
- **Telemetry HUD Digital**: Cuadro de mandos con tacómetro con zona roja, indicador de marchas, velocímetro digital y barras de recorrido de pedales.
- **Lap Replayer**: Reproductor con animación en tiempo real a velocidades ajustables (`0.5x`, `1x`, `2x`, `4x`) y barra de salto temporal interactiva.

### ⚖️ 3. Comparador de Vueltas (Lap Comparison)
- Superposición cara a cara de dos vueltas (Vuelta A vs Vuelta B de referencia).
- **Alineación espacial por distancia métrica** en lugar de tiempo, permitiendo comparaciones precisas sin desfases acumulativos.
- **Gráfica de Delta Temporal ($\Delta t$)**: Muestra tramo a tramo dónde se gana o se pierde tiempo con respecto a la vuelta de referencia.
- Comparativa visual de velocidad de paso y modulación de pedales en curvas complejas.

### 🧠 4. Ingeniero de Pista Virtual (Virtual Race Engineer)
- Motor heurístico que evalúa automáticamente la telemetría en las curvas del circuito:
  - **Detección de Frenada Prematura**: Alerta si se frena metros antes de la referencia recomendada.
  - **Velocidad Mínima en el Ápice**: Calcula el déficit de velocidad en el punto medio de la curva y su ganancia potencial en segundos.
  - **Retraso en la Tracción**: Identifica cuándo se demora la aplicación del 90%+ del acelerador en la fase de salida.
- Tarjetas de recomendación categorizadas por severidad (`info`, `warning`, `critical`, `positive`).

### 📥 5. Importador Universal de Telemetría
- Carga por arrastrar y soltar (*drag & drop*) de archivos locales.
- Soporte para **CSV Estándar**, **MoTeC CSV** (con metadatos de vehículo y circuito) y archivos binarios **MoTeC `.ld`** leídos nativamente mediante `ArrayBuffer`.
- Asistente de mapeo inteligente de columnas con selector interactivo y vista previa de datos.
- Generador de datos sintéticos y muestras de prueba incluidas para exploración inmediata.

### 🏁 6. Catálogo de Circuitos, Coches y Objetivos
- **Circuitos**: Información técnica, longitud, curvas clave, velocidades sugeridas de ápice y marchas recomendadas (Spa-Francorchamps, Monza, Silverstone, Nürburgring, etc.).
- **Vehículos**: Ficha técnica de GT3s modernos (potencia, peso, relación peso/potencia, tracción).
- **Metas del Piloto**: Sistema de objetivos de consistencia, ritmo y técnica.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
| :--- | :--- |
| **Framework UI** | [React 19](https://react.dev/) |
| **Lenguaje** | [TypeScript 6](https://www.typescriptlang.org/) |
| **Empaquetador y Servidor Dev** | [Vite 8](https://vite.dev/) |
| **Estilos y Diseño** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **Gráficos y Visualización** | [Recharts 3](https://recharts.org/) |
| **Iconografía** | [Lucide React](https://lucide.dev/) |
| **Enrutamiento** | [React Router DOM v7](https://reactrouter.com/) |
| **Linter y Análisis de Código** | [Oxlint](https://oxc.rs/) |

---

## 🚀 Inicio Rápido

### Requisitos Previos
- [Node.js](https://nodejs.org/) (versión 18 o superior recomendada)
- Gestor de paquetes `npm` (incluido con Node.js)

### Instalación

1. Clonar el repositorio o ingresar al directorio del proyecto:
   ```bash
   cd ApexTelemetry
   ```

2. Instalar las dependencias:
   ```bash
   npm install
   ```

3. Iniciar el entorno de desarrollo:
   ```bash
   npm run dev
   ```
   Abre [http://localhost:5173](http://localhost:5173) en tu navegador para ver la aplicación.

### Scripts Disponibles

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo local con recarga rápida (HMR). |
| `npm run build` | Compila TypeScript y genera los archivos optimizados para producción en `/dist`. |
| `npm run preview` | Previsualiza localmente la compilación de producción. |
| `npm run lint` | Ejecuta Oxlint para verificación estática de código ultrarrápida. |

---

## 📂 Estructura del Proyecto

```
ApexTelemetry/
├── docs/                      # Documentación técnica detallada
│   ├── ARCHITECTURE.md        # Arquitectura de software, servicios y modelos
│   └── TELEMETRY_FORMATS.md   # Formatos de telemetría (CSV, MoTeC) y canales
├── public/                    # Favicon e íconos estáticos
├── src/
│   ├── assets/                # Imágenes y vectores
│   ├── components/
│   │   ├── comparison/        # Gráficas comparativas de telemetría y deltas
│   │   ├── engineer/          # Recomendaciones del ingeniero de carrera
│   │   ├── layout/            # Layout general, barra lateral y superior
│   │   ├── telemetry/         # HUD digital, mapa interactivo y reproductor
│   │   └── ui/                # Botones, insignias, modales y tarjetas de métricas
│   ├── data/                  # Datos semilla, mocks y telemetría de muestra
│   ├── pages/                 # Páginas de la aplicación (Dashboard, Análisis, etc.)
│   ├── services/              # Parseo de telemetría, almacenamiento y cálculos
│   ├── types/                 # Tipos e interfaces globales de TypeScript
│   ├── utils/                 # Formateadores de tiempo/unidades y geometría de pista
│   ├── App.tsx                # Rutas y configuración general de la SPA
│   └── main.tsx               # Entrada de la aplicación React
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 📚 Documentación Adicional

Para más detalles técnicos sobre el funcionamiento interno de ApexTelemetry, consulta los documentos en la carpeta [`docs/`](file:///c:/Programming/ApexTelemetry/docs/):

- 🏛️ [**Guía de Arquitectura del Sistema (docs/ARCHITECTURE.md)**](file:///c:/Programming/ApexTelemetry/docs/ARCHITECTURE.md): Diagrama de flujo de datos, diseño de la capa de servicios, algoritmo de alineación de telemetría y persistencia.
- 📡 [**Guía de Formatos de Telemetría (docs/TELEMETRY_FORMATS.md)**](file:///c:/Programming/ApexTelemetry/docs/TELEMETRY_FORMATS.md): Especificación de canales de datos, unidades de medida, compatibilidad con MoTeC y consejos de exportación desde iRacing y Assetto Corsa Competizione.

---

## 🏎️ Simuladores Compatibles

ApexTelemetry puede recibir telemetría de cualquier simulador capaz de exportar a CSV o MoTeC i2 Pro:
- **Assetto Corsa Competizione (ACC)** (soporte nativo de MoTeC `.ld` y CSV)
- **iRacing** (vía exportador CSV o conversor Mu a MoTeC)
- **rFactor 2 / Le Mans Ultimate** (vía MoTeC plugin)
- **Automobilista 2**
- **F1 (EA Sports)** (vía herramientas de telemetría a CSV)
