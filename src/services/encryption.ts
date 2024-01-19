import secureLocalStorage from "react-secure-storage";

function uint8ArrayToBase64(uint8Array: Uint8Array): string {
  const binaryString = String.fromCharCode.apply(null, Array.from(uint8Array));
  return btoa(binaryString);
}

function base64ToUint8Array(base64String: string) {
  const binaryString = atob(base64String);
  const uint8Array = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    uint8Array[i] = binaryString.charCodeAt(i);
  }
  return uint8Array;
}

export class Encryptor {
  password: string;
  private _secret: string;
  private email: string;

  constructor(email: string, password: string) {
    this.password = password;
    this.email = email;
    this._secret = secureLocalStorage.getItem(
      this.getStorageKeyForSecret()
    ) as string;
  }

  get secret() {
    return this._secret;
  }

  set secret(value: string) {
    secureLocalStorage.setItem(this.getStorageKeyForSecret(), value);
    this._secret = value;
  }

  hashValue = async (value: string): Promise<string> => {
    try {
      // Convert the value to an ArrayBuffer
      const dataBuffer = new TextEncoder().encode(value);

      // Hash the value using SHA-256
      const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);

      // Convert the hash result to a hex string
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");

      return hashHex;
    } catch (error) {
      console.error("Error hashing value:", error);
      throw error;
    }
  };

  private getEncryptionKey = () => this.password + this._secret;

  getEncryptionKeyHash = async () => this.hashValue(this.getEncryptionKey());

  getStorageKeyForSecret = () => `USER_SECRET_${this.email}`;

  deriveKeyFromPassword = async () => {
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(this.getEncryptionKey());
    const salt = new Uint8Array([
      0xc0, 0xda, 0xb7, 0xf4, 0x65, 0x46, 0x8b, 0x36, 0x1d, 0x2a, 0xd6, 0x11,
      0x99, 0x59, 0x88, 0x95,
    ]);

    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      passwordData,
      { name: "PBKDF2" },
      false,
      ["deriveBits"]
    );

    const keyBytes = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 480000,
        hash: "SHA-256",
      },
      keyMaterial,
      256
    );

    return new Uint8Array(keyBytes);
  };

  encrypt = async (value: string) => {
    const encoder = new TextEncoder();
    const keyBytes = await this.deriveKeyFromPassword();
    const key = await crypto.subtle.importKey(
      "raw",
      keyBytes,
      { name: "AES-GCM" },
      true,
      ["encrypt"]
    );

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encryptedData = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      key,
      encoder.encode(value)
    );
    const ivString = uint8ArrayToBase64(iv);
    const encryptedDataString = uint8ArrayToBase64(
      new Uint8Array(encryptedData)
    );

    return `${ivString}:${encryptedDataString}`;
  };
  decrypt = async (value: string) => {
    const [iv, encryptedData] = value.split(":");
    const keyBytes = await this.deriveKeyFromPassword();
    const key = await crypto.subtle.importKey(
      "raw",
      keyBytes,
      { name: "AES-GCM" },
      true,
      ["decrypt"]
    );

    const decryptedData = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: base64ToUint8Array(iv) },
      key,
      base64ToUint8Array(encryptedData)
    );

    return new TextDecoder().decode(decryptedData);
  };
}
