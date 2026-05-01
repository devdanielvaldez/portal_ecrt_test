import { z } from 'zod';

export const TelemetrySchema = z.object({
  serial_number: z.string(),
  network_ssid: z.string().optional(),
  connection_method: z.enum(['WIFI', 'CELLULAR', 'ETHERNET', 'UNKNOWN']),
  battery_level: z.number().min(0).max(100),
  is_charging: z.boolean(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  device_signature: z.string().min(10)
});
