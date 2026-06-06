const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()

export function bytesToBase64(bytes) {
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary)
}

export function base64ToBytes(base64) {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }
  return bytes
}

export function wipeBytes(bytes) {
  if (bytes instanceof Uint8Array) {
    bytes.fill(0)
  }
}

export function randomBytes(length) {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  return bytes
}

export function encodeSecret(value) {
  return textEncoder.encode(value)
}

export function decodeSecret(bytes) {
  return textDecoder.decode(bytes)
}

export async function deriveAesKey(passphraseBytes, saltBytes, iterations = 600000) {
  const material = await crypto.subtle.importKey('raw', passphraseBytes, 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations,
      hash: 'SHA-256'
    },
    material,
    {
      name: 'AES-GCM',
      length: 256
    },
    false,
    ['encrypt', 'decrypt']
  )
}

export async function encryptText(key, value) {
  if (!value) {
    return null
  }

  const iv = randomBytes(12)
  const plain = encodeSecret(value)
  const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plain))
  wipeBytes(plain)

  return {
    iv: bytesToBase64(iv),
    data: bytesToBase64(encrypted)
  }
}

export async function decryptText(key, payload) {
  if (!key || !payload?.iv || !payload?.data) {
    return ''
  }

  const iv = base64ToBytes(payload.iv)
  const data = base64ToBytes(payload.data)
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data)
  const bytes = new Uint8Array(decrypted)
  const value = decodeSecret(bytes)
  wipeBytes(bytes)
  wipeBytes(iv)
  wipeBytes(data)
  return value
}
