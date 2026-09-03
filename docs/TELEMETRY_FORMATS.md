# Guía de Formatos de Telemetría e Importación

Esta guía detalla los formatos de archivo compatibles, los canales esperados, las unidades de medida y el proceso de importación de datos en **ApexTelemetry**.

---

## 1. Formatos Soportados

ApexTelemetry incluye un motor de análisis flexible capaz de leer tres tipos de archivos:

| Formato | Extensión | Descripción | Métodos de Importación |
| :--- | :--- | :--- | :--- |
| **CSV Estándar** | `.csv`, `.txt` | Archivo delimitado por comas con una fila de cabecera que contiene los nombres de canal. | Arrastrar y soltar / Explorador |
| **MoTeC CSV** | `.csv` | Archivo exportado desde MoTeC i2 Pro con bloques de metadatos superiores (`"Format"`, `"Venue"`, `"Vehicle"`, `"Driver"`) y fila técnica de unidades. | Detección automática de cabecera |
| **MoTeC Binario** | `.ld` | Formato binario propietario de MoTeC i2 Pro. Se lee directamente en memoria del navegador vía `ArrayBuffer` y `DataView`. | Decodificación nativa sin backend |

---

## 2. Canales de Telemetría Soportados

Para aprovechar todas las herramientas de análisis (HUD, comparación, gráficas y recomendaciones del Ingeniero Virtual), se recomienda disponer de los siguientes canales:

| Canal | Propósito | Unidades Esperadas | Requerido | Variantes Comunes Reconocidas |
| :--- | :--- | :--- | :---: | :--- |
| **Distancia** | Posición en la pista para sincronizar y alinear vueltas | Metros (`m`) | **Sí\*** | `Distance`, `Lap_Distance`, `Dist`, `distance_m`, `Corr_Dist` |
| **Tiempo** | Duración acumulada de la vuelta | Segundos (`s`) | **Sí\*** | `Time`, `Lap_Time`, `Elapsed_Time`, `time_s` |
| **Velocidad** | Curva de velocidad del vehículo | `km/h` o `mph` | **Sí** | `Speed`, `Ground_Speed`, `v_car`, `Veh_Speed`, `Wheel_Speed` |
| **Acelerador** | Posición del pedal del acelerador | Porcentaje `0 - 100 %` | **Sí** | `Throttle`, `Acc_Pedal`, `Gas`, `Throttle_Pos`, `acc_pos` |
| **Freno** | Presión o recorrido del pedal de freno | Porcentaje `0 - 100 %` o `bar` | **Sí** | `Brake`, `Brake_Press`, `Brake_Pedal`, `brake_pct`, `Press_Brake` |
| **Marcha** | Engranaje de la caja de cambios | Entero `0` a `8` | Opcional | `Gear`, `Current_Gear`, `Gear_Num`, `gear` |
| **RPM** | Régimen de giro del motor | `rpm` | Opcional | `RPM`, `Engine_RPM`, `Eng_RPM`, `Engine_Speed` |
| **Volante** | Ángulo de giro de la dirección | Grados `deg` (`-180°` a `+180°`) | Opcional | `Steering`, `Steer_Angle`, `Steering_Angle`, `Handwheel_Angle` |

*\*Nota: Si el archivo no incluye la columna de distancia calculada pero sí incluye tiempo y velocidad, ApexTelemetry puede proyectar la distancia aproximada ($d = \int v \, dt$).*

---

## 3. Estructura de Archivos de Ejemplo

### Ejemplo A: CSV Estándar

```csv
Time,Distance,Speed,Throttle,Brake,Gear,RPM,Steering
0.000,0.0,210.4,100,0,5,7250,-0.2
0.050,2.9,211.2,100,0,5,7280,-0.1
0.100,5.8,212.0,100,0,5,7310,0.0
0.150,8.8,212.8,100,0,5,7340,0.1
```

### Ejemplo B: MoTeC CSV con Cabeceras de Metadatos

```csv
"Format","MoTeC CSV File"
"Venue","Spa Francorchamps"
"Vehicle","Ferrari 296 GT3"
"Driver","Sim Driver"
"Device","ADL"
"Comment","Qualifying Run 1"
"Log Date","02/09/2026"
"Sample Rate","20"

"Time","Distance","Speed","Throttle","Brake","Gear","RPM","Steer"
"s","m","km/h","%","%","","rpm","deg"
0.000,0.0,230.1,100,0,5,7500,-0.3
0.050,3.2,231.0,100,0,5,7540,-0.2
```

ApexTelemetry detecta automáticamente las líneas iniciales de metadatos (como `Venue`, `Vehicle` y `Driver`) para rellenar de forma predictiva la información de la sesión. Además, identifica y omite de forma transparente la fila técnica de unidades (`"s"`, `"m"`, `"km/h"`).

---

## 4. Asistente de Mapeo Inteligente (Column Mapping)

Al subir un archivo en la pestaña **Import** (`/import`), el sistema realiza un emparejamiento automático por similitud de nombres:

1. Si los nombres coinciden con las cabeceras estándar, se asignan automáticamente.
2. Si un archivo utiliza nomenclaturas personalizadas (por ejemplo `acc_pos` en lugar de `Throttle`), el usuario puede utilizar el selector desplegable en la interfaz para vincular manualmente cada columna.
3. Se muestra una vista previa interactiva de las primeras 5 filas del archivo para validar visualmente los valores antes de confirmar la importación.

---

## 5. Cómo Exportar Telemetría desde Simuladores

### Assetto Corsa Competizione (ACC)
1. Activa la telemetría en el archivo `acc/settings/broadcasting.json` o utiliza la suite integrada de MoTeC en el setup del coche (`Electronics` $\rightarrow$ `Telemetry: ON`).
2. Tras la sesión, localiza los archivos generados en:
   `Documentos/Assetto Corsa Competizione/MoTeC/`
3. Puedes arrastrar el archivo `.ld` o abrirlo en MoTeC i2 Pro y exportarlo como CSV (`File` $\rightarrow$ `Export Data...` $\rightarrow$ `Format: CSV`).

### iRacing
1. Presiona `Alt + L` en pista para comenzar a grabar telemetría (aparecerá el ícono de disco en la esquina del simulador).
2. Al finalizar la tanda, el archivo `.ibt` se guardará en `Documentos/iRacing/telemetry/`.
3. Utiliza la herramienta **Mu** (de iRacing) para convertir de `.ibt` a MoTeC `.ld` o CSV, o herramientas de la comunidad como *iSpeed* / *Atlas*.

### rFactor 2 / Le Mans Ultimate
1. Utiliza el plugin de MoTeC para rFactor 2.
2. Los registros se exportan en formato `.ld` en la carpeta del juego `UserData/Log/MoTeC/`.

