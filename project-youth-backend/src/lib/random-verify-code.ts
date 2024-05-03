export const generateRandomString = (length: number): string => {
  const chars: string = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let randomString: string = '';

  for (let i: number = 0; i < length; i++) {
    const randomIndex: number = Math.floor(Math.random() * chars.length);
    randomString += chars[randomIndex];
  }

  return randomString;
};
