export const useColorCount = (count: Number = 5) => useState<number>('count', () => +count);