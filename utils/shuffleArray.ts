export const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export const shuffleArrayWithExceptions = (array, referenceArray) => {
    const shuffledArray = [...array]; // Create a shallow copy of the original array
  
    for (let i = shuffledArray.length - 1; i > 0; i--) {
        // Check if the current element is in the referenceArray
        if (referenceArray.includes(shuffledArray[i])) {
            continue; // Skip shuffling if current element is in referenceArray
        }

        const j = Math.floor(Math.random() * (i + 1));
        // Check if the target element is in the referenceArray
        if (!referenceArray.includes(shuffledArray[j])) {
            [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
        }
    }
  
    return shuffledArray;
}