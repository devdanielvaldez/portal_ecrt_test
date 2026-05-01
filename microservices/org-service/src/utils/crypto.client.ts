const CRYPTO_SERVICE_URL = process.env.CRYPTO_SERVICE_URL || 'http://crypto-service:3009';

export async function encryptPayload(data: any): Promise<string> {
  const res = await fetch(`${CRYPTO_SERVICE_URL}/api/v1/crypto/encrypt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data })
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Encryption failed');
  return json.payload;
}

export async function decryptPayload(payload: string): Promise<any> {
  const res = await fetch(`${CRYPTO_SERVICE_URL}/api/v1/crypto/decrypt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ payload })
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Decryption failed');
  return json.data;
}
