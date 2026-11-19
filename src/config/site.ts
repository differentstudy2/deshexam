export const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.NEXT_PUBLIC_VERCEL_URL) return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  return 'https://deshexam.vercel.app';
};

export const siteConfig = {
  url: getBaseUrl(),
  name: process.env.NEXT_PUBLIC_SITE_NAME || `${process.env.NEXT_PUBLIC_SITE_NAME || `${process.env.NEXT_PUBLIC_SITE_NAME || 'DeshExam'}`}`,
};
