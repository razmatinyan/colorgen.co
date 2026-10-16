export const shuffleArray = <T>(array: T[]): T[] => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const current = array[i]!;
        array[i] = array[j]!;
        array[j] = current;
    }
    return array;
}

export const shuffleArrayWithExceptions = <T>(array: T[], referenceArray: readonly T[]): T[] => {
    const shuffledArray = [...array];
  
    for (let i = shuffledArray.length - 1; i > 0; i--) {
        if (referenceArray.includes(shuffledArray[i]!)) {
            continue;
        }

        const j = Math.floor(Math.random() * (i + 1));
        if (!referenceArray.includes(shuffledArray[j]!)) {
            const current = shuffledArray[i]!;
            shuffledArray[i] = shuffledArray[j]!;
            shuffledArray[j] = current;
        }
    }
  
    return shuffledArray;
}
