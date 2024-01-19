function getRandomChar(charset: string): string {
  const randomIndex = Math.floor(Math.random() * charset.length);
  return charset.charAt(randomIndex);
}

function shuffleArray(array: string[]): string[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function generateRandomPassword(length: number): string {
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const specialChars = "!@#$%^&*()-_=+";

  const charset = lowercase + uppercase + numbers + specialChars;

  let passwordArray = new Array(length);

  // Ensure at least one character from each category
  passwordArray.push(getRandomChar(lowercase));
  passwordArray.push(getRandomChar(uppercase));
  passwordArray.push(getRandomChar(numbers));
  passwordArray.push(getRandomChar(specialChars));

  // Fill the remaining characters
  for (let i = 4; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    passwordArray.push(charset.charAt(randomIndex));
  }

  // Shuffle the array to randomize character positions
  passwordArray = shuffleArray(passwordArray);

  return passwordArray.join("");
}
