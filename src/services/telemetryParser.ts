import { ColumnMapping, TelemetryPoint } from '../types';

export interface ParsedTelemetryResult {
  fileType: 'csv' | 'motec_csv' | 'motec_ld';
  metadata: {
    venue?: string;
    vehicle?: string;
    driver?: string;
    logDate?: string;
    sampleRate?: number;
    comment?: string;
  };
  headers: string[];
  rows: Record<string, string>[];
  directPoints?: TelemetryPoint[];
}

export class TelemetryParser {
  /**
   * Intelligently parses standard CSV or MoTeC CSV with metadata header blocks
   */
  public static parseCsv(csvText: string): ParsedTelemetryResult {
    const rawLines = csvText.trim().split(/\r?\n/);
    const metadata: ParsedTelemetryResult['metadata'] = {};
    let isMotecCsv = false;

    // Check if the file starts with MoTeC metadata (e.g. "Format","MoTeC CSV File")
    let headerLineIdx = 0;

    for (let i = 0; i < Math.min(25, rawLines.length); i++) {
      const line = rawLines[i].trim();
      if (!line) continue;

      if (line.includes('MoTeC CSV') || line.includes('MoTeC') || line.startsWith('"Format"') || line.startsWith('Format,')) {
        isMotecCsv = true;
      }

      // Extract key-values from MoTeC metadata header
      if (isMotecCsv) {
        const parts = line.split(',').map(p => p.trim().replace(/^["']|["']$/g, ''));
        if (parts.length >= 2) {
          const key = parts[0].toLowerCase();
          const val = parts[1];
          if (key === 'venue') metadata.venue = val;
          if (key === 'vehicle') metadata.vehicle = val;
          if (key === 'driver') metadata.driver = val;
          if (key === 'log date') metadata.logDate = val;
          if (key === 'sample rate') metadata.sampleRate = parseFloat(val) || 20;
          if (key === 'comment') metadata.comment = val;
        }

        // Check if this line looks like the channel names header (has multiple comma separated channel names)
        const possibleChannels = line.split(',');
        if (possibleChannels.length >= 4 && (line.toLowerCase().includes('speed') || line.toLowerCase().includes('time') || line.toLowerCase().includes('throttle'))) {
          headerLineIdx = i;
          break;
        }
      }
    }

    // If not MoTeC or no channel line found yet, look for first line with columns
    if (!isMotecCsv) {
      headerLineIdx = 0;
    }

    const lines = rawLines.slice(headerLineIdx).filter(l => l.trim().length > 0);
    if (lines.length === 0) {
      return { fileType: 'csv', metadata: {}, headers: [], rows: [] };
    }

    const rawHeaders = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
    let dataStartLine = 1;

    // In MoTeC CSV, the line immediately following headers is usually the units row (e.g. "s","m","km/h","rpm")
    if (lines.length > 1) {
      const secondLine = lines[1].toLowerCase();
      if (secondLine.includes('km/h') || secondLine.includes('rpm') || secondLine.includes('%') || secondLine.includes('deg') || secondLine.includes('"s"') || secondLine.includes('"m"')) {
        dataStartLine = 2; // Skip units line
      }
    }

    const rows: Record<string, string>[] = [];
    for (let i = dataStartLine; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const values = line.split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
      const row: Record<string, string> = {};
      rawHeaders.forEach((header, idx) => {
        row[header] = values[idx] !== undefined ? values[idx] : '';
      });
      rows.push(row);
    }

    return {
      fileType: isMotecCsv ? 'motec_csv' : 'csv',
      metadata,
      headers: rawHeaders,
      rows,
    };
  }

  /**
   * Parses native MoTeC binary .ld files using ArrayBuffer
   */
  public static parseMotecLdBinary(buffer: ArrayBuffer): ParsedTelemetryResult {
    const view = new DataView(buffer);
    const metadata: ParsedTelemetryResult['metadata'] = {};

    try {
      // MoTeC LD Header
      // Check magic number at offset 0 (standard 0x40 = 64)
      const magic = view.getUint32(0, true);
      if (magic !== 64 && magic !== 0x40) {
        console.warn('File does not match standard 0x40 MoTeC magic, attempting best-effort read');
      }

      // Read ASCII strings for driver, vehicle, venue from header string table
      // Standard MoTeC LD strings are null-terminated ASCII
      const readString = (offset: number, maxLen: number): string => {
        let str = '';
        for (let i = 0; i < maxLen; i++) {
          if (offset + i >= buffer.byteLength) break;
          const charCode = view.getUint8(offset + i);
          if (charCode === 0) break;
          str += String.fromCharCode(charCode);
        }
        return str.trim();
      };

      // Header metadata locations in MoTeC LD files
      metadata.driver = readString(0x5e, 32) || readString(0x40, 32) || 'Sim Driver';
      metadata.vehicle = readString(0x7e, 32) || 'GT3 Car';
      metadata.venue = readString(0x9e, 32) || 'Circuit';
      metadata.comment = readString(0xde, 64);

      // Read channel directory pointer at offset 0x0c
      let channelPtr = view.getUint32(0x0c, true);
      const channels: {
        name: string;
        shortName: string;
        units: string;
        sampleCount: number;
        dataPtr: number;
        dataType: number;
        frequency: number;
        samples: number[];
      }[] = [];

      // Walk channel linked list (safely up to 100 channels)
      let iterations = 0;
      while (channelPtr > 0 && channelPtr < buffer.byteLength - 100 && iterations < 100) {
        iterations++;
        const nextChannelPtr = view.getUint32(channelPtr, true);
        const dataPtr = view.getUint32(channelPtr + 4, true);
        const sampleCount = view.getUint32(channelPtr + 8, true);
        const dataType = view.getUint16(channelPtr + 14, true);
        const frequency = view.getUint16(channelPtr + 16, true) || 20;

        const name = readString(channelPtr + 32, 32);
        const shortName = readString(channelPtr + 64, 8);
        const units = readString(channelPtr + 72, 12);

        // Read channel samples if data pointer is valid
        const samples: number[] = [];
        if (dataPtr > 0 && sampleCount > 0 && dataPtr + sampleCount * 2 <= buffer.byteLength) {
          const maxRead = Math.min(sampleCount, 2500); // cap for UI memory
          for (let s = 0; s < maxRead; s++) {
            let val = 0;
            const byteOffset = dataPtr + s * (dataType === 3 || dataType === 1 ? 4 : 2);
            if (byteOffset + 4 <= buffer.byteLength) {
              if (dataType === 3) {
                val = view.getFloat32(byteOffset, true);
              } else if (dataType === 1) {
                val = view.getInt32(byteOffset, true);
              } else {
                val = view.getInt16(byteOffset, true);
              }
            }
            samples.push(val);
          }
        }

        if (name) {
          channels.push({
            name,
            shortName,
            units,
            sampleCount,
            dataPtr,
            dataType,
            frequency,
            samples,
          });
        }

        channelPtr = nextChannelPtr;
      }

      // Convert extracted binary channels to normalized TelemetryPoints
      const headers = channels.map(c => c.name);

      // Find essential channels
      const speedCh = channels.find(c => /speed|ground/i.test(c.name));
      const distCh = channels.find(c => /dist/i.test(c.name));
      const throttleCh = channels.find(c => /throttle|gas|pedal/i.test(c.name));
      const brakeCh = channels.find(c => /brake/i.test(c.name));
      const rpmCh = channels.find(c => /rpm|engine/i.test(c.name));
      const gearCh = channels.find(c => /gear/i.test(c.name));
      const steerCh = channels.find(c => /steer/i.test(c.name));

      const pointsCount = speedCh ? speedCh.samples.length : (channels[0]?.samples.length || 0);
      const points: TelemetryPoint[] = [];

      for (let i = 0; i < pointsCount; i++) {
        const speed = speedCh ? speedCh.samples[i] || 0 : 0;
        const dist = distCh ? distCh.samples[i] || (i * 15) : (i * 15);
        const throttle = throttleCh ? Math.min(100, Math.max(0, throttleCh.samples[i] || 0)) : 0;
        const brake = brakeCh ? Math.min(100, Math.max(0, brakeCh.samples[i] || 0)) : 0;
        const rpm = rpmCh ? rpmCh.samples[i] || 6500 : 6500;
        const gear = gearCh ? Math.round(gearCh.samples[i]) : (speed > 200 ? 5 : speed > 140 ? 4 : 3);
        const steering = steerCh ? steerCh.samples[i] || 0 : 0;
        const time = (i * (1 / (speedCh?.frequency || 20)));

        points.push({
          distance: Math.round(dist),
          time: parseFloat(time.toFixed(3)),
          speed: Math.round(speed),
          rpm: Math.round(rpm),
          gear,
          throttle: Math.round(throttle),
          brake: Math.round(brake),
          steering: parseFloat(steering.toFixed(1)),
        });
      }

      return {
        fileType: 'motec_ld',
        metadata,
        headers,
        rows: [],
        directPoints: points.length > 0 ? points : undefined,
      };
    } catch (err) {
      console.error('Error parsing MoTeC .ld binary file:', err);
      return {
        fileType: 'motec_ld',
        metadata,
        headers: [],
        rows: [],
      };
    }
  }

  /**
   * Intelligently auto-detects column mappings based on common telemetry & MoTeC naming conventions
   */
  public static autoDetectMapping(headers: string[]): ColumnMapping {
    const findMatch = (patterns: RegExp[]): string => {
      for (const pattern of patterns) {
        const found = headers.find(h => pattern.test(h));
        if (found) return found;
      }
      return '';
    };

    return {
      distance: findMatch([/^lap_?dist/i, /^distance/i, /^dist/i, /^corr_?dist/i, /^m$/i]),
      time: findMatch([/^time_?elapsed/i, /^lap_?time/i, /^time/i, /^t$/i]),
      speed: findMatch([/^ground_?speed/i, /^gps_?speed/i, /^speed_?kmh/i, /^speed/i, /^spd/i, /^velocity/i]),
      rpm: findMatch([/^engine_?rpm/i, /^rpm/i, /^engine_?speed/i, /^revs/i]),
      gear: findMatch([/^gear/i, /^gearpres/i, /^ngear/i]),
      throttle: findMatch([/^throttle_?pos/i, /^throttle_?pct/i, /^throttle/i, /^pedal_?pos/i, /^gas/i, /^tps/i, /^accel/i]),
      brake: findMatch([/^brake_?press/i, /^brake_?pos/i, /^brake_?pressure/i, /^brake_?pct/i, /^brake/i, /^brk/i]),
      steering: findMatch([/^steering_?angle/i, /^steer_?angle/i, /^steer/i, /^steering/i, /^steer_?deg/i]),
    };
  }

  /**
   * Validates if minimum required columns are mapped
   */
  public static validateMapping(mapping: ColumnMapping): { isValid: boolean; missingFields: string[] } {
    const required: (keyof ColumnMapping)[] = ['distance', 'speed', 'throttle', 'brake'];
    const missing: string[] = [];

    required.forEach(field => {
      if (!mapping[field]) {
        missing.push(field);
      }
    });

    return {
      isValid: missing.length === 0,
      missingFields: missing,
    };
  }

  /**
   * Normalizes raw rows into strongly typed TelemetryPoint models
   */
  public static normalize(
    rows: Record<string, string>[],
    mapping: ColumnMapping,
    targetTrackLength?: number
  ): TelemetryPoint[] {
    const points: TelemetryPoint[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const dist = parseFloat(row[mapping.distance]) || (i * 20);
      const time = parseFloat(row[mapping.time]) || (i * 0.35);
      const speed = parseFloat(row[mapping.speed]) || 0;
      const rpm = parseFloat(row[mapping.rpm]) || 6000;
      const gear = parseInt(row[mapping.gear], 10) || (speed > 220 ? 5 : speed > 150 ? 4 : speed > 100 ? 3 : 2);
      const throttle = Math.min(100, Math.max(0, parseFloat(row[mapping.throttle]) || 0));
      const brake = Math.min(100, Math.max(0, parseFloat(row[mapping.brake]) || 0));
      const steering = parseFloat(row[mapping.steering]) || 0;

      points.push({
        distance: Math.round(dist),
        time: parseFloat(time.toFixed(3)),
        speed: Math.round(speed),
        rpm: Math.round(rpm),
        gear: isNaN(gear) ? 3 : gear,
        throttle: Math.round(throttle),
        brake: Math.round(brake),
        steering: parseFloat(steering.toFixed(1)),
      });
    }

    // Sort by distance
    points.sort((a, b) => a.distance - b.distance);

    return points;
  }
}
