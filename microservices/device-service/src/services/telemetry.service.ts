import { redisClient, AppDataSource } from '../config/data-source';
import { TelemetryDTO } from '../schemas/telemetry.schema';
import { Terminal } from '../entities/Terminal';

export const ingestTelemetry = async (data: TelemetryDTO) => {
  const terminalRepo = AppDataSource.getRepository(Terminal);
  const terminal = await terminalRepo.findOneBy({ serial_number: data.serial_number, status: 'ACTIVE' });
  if (!terminal) throw new Error('TERMINAL_INACTIVE_OR_NOT_FOUND');
  const liveData = { ...data, last_seen: new Date().toISOString() };
  await redisClient.hSet('telemetry', data.serial_number, JSON.stringify(liveData));
  return true;
};

export const getLiveTerminalStatus = async (serial_number: string) => {
  const rawData = await redisClient.hGet('telemetry', serial_number);
  if (!rawData) return { status: 'OFFLINE', last_seen: null };
  return { status: 'ONLINE', ...JSON.parse(rawData) };
};

export const getLiveFleetStatus = async (serialNumbers: string[]) => {
  if (serialNumbers.length === 0) return [];
  const results = await redisClient.hmGet('telemetry', serialNumbers);
  return results.map((res, idx) => {
    if (!res) return { serial_number: serialNumbers[idx], status: 'OFFLINE' };
    return { status: 'ONLINE', ...JSON.parse(res) };
  });
};
