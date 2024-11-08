export function generateEncryptedCaptchaText() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return encryptCaptchaChallenge(result);
}

export function generateRandomFontSize() {
  const sizes = [64, 72, 80];
  return sizes[Math.floor(Math.random() * sizes.length)];
}

export function generateRandomAngle() {
  return Math.floor(Math.random() * 91) - 45;
}

export function encryptCaptchaChallenge(captchaToEncode: string): string {
  if (!captchaToEncode!) {
    throw new Error("CAPTCHA to encode must not be empty");
  }

  const key = process.env.CAPTCHA_ENCRYPTION_KEY;
  if (!key) {
    console.error(
      "Required env variable CAPTCHA_ENCRYPTION_KEY was not found!"
    );
    throw new Error(
      "Required env variable CAPTCHA_ENCRYPTION_KEY was not found!"
    );
  }

  let result = "";
  for (let i = 0; i < captchaToEncode.length; i++) {
    // Get the shift amount from the current key character (using modulo to wrap around)
    const shift = key.charCodeAt(i % key.length) % 26;
    const charCode = captchaToEncode.charCodeAt(i);

    // Shift the character and wrap around if necessary
    let newCharCode = charCode + shift;

    // Keep within printable ASCII range (33-126)
    if (newCharCode > 126) {
      newCharCode = 33 + (newCharCode - 127);
    }

    result += String.fromCharCode(newCharCode);
  }

  return encodeURIComponent(result);
}

export function decryptCaptchaChallenge(encryptedCaptcha: string): string {
  if (!encryptedCaptcha!) {
    throw new Error("Encoded CAPTCHA must not be empty");
  }

  const key = process.env.CAPTCHA_ENCRYPTION_KEY;
  if (!key) {
    console.error(
      "Required env variable CAPTCHA_ENCRYPTION_KEY was not found!"
    );
    throw new Error(
      "Required env variable CAPTCHA_ENCRYPTION_KEY was not found!"
    );
  }

  const encryptedCaptchaString = decodeURIComponent(encryptedCaptcha);

  let result = "";
  for (let i = 0; i < encryptedCaptchaString.length; i++) {
    // Get the shift amount from the current key character
    const shift = key.charCodeAt(i % key.length) % 26;
    const charCode = encryptedCaptchaString.charCodeAt(i);

    // Reverse the shift and wrap around if necessary
    let newCharCode = charCode - shift;

    // Keep within printable ASCII range (33-126)
    if (newCharCode < 33) {
      newCharCode = 126 - (33 - newCharCode - 1);
    }

    result += String.fromCharCode(newCharCode);
  }

  return result;
}

export function getAppUrl() {
  return process.env.APP_URL || "http://localhost:3000";
}
