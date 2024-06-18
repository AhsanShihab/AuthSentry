export function generateRandomPassword(
  length: number,
  includeSpecialChars = true
): string {
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const specialChars = "!@#$%^&*-_=+,./?";

  let charset = lowercase + uppercase + numbers;
  if (includeSpecialChars) {
    charset = charset + specialChars;
  }

  return Array.from(crypto.getRandomValues(new Uint32Array(length)))
    .map((x) => charset[x % charset.length])
    .join("");
}
