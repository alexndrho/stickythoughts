import { thoughtColorZod } from '@/lib/validations/thought';

export const getColorFallback = (color: string) => {
  const result = thoughtColorZod.safeParse(color);
  return result.success ? result.data : 'yellow';
};
