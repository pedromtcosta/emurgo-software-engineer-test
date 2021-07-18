const permutations = (input: string): string[] => {
    let results: string[] = []

    // reversed loop so the permutations are generated in order
    // this can be easily seen when the input is all *
    for (let i = input.length - 1; i >= 0; i--) {
        if (input[i] === '*') {
            if (results.length === 0) {
                // first * found; push the variants (0 & 1)
                results.push(setCharAt(input, i, '0'))
                results.push(setCharAt(input, i, '1'))
            } else {
                // for the next *s, duplicate the current results...
                results = results.concat(results)

                // ... and then set the next * to '0' in half of them, and in the other half set '1'
                for (let idx = 0; idx < results.length; idx++) {
                    const value = idx + 1 > results.length / 2 ? '1' : '0'
                    results[idx] = setCharAt(results[idx], i, value)
                }
            }
        }
    }

    return results
}

const setCharAt = (str: string, index: number, chr: string) => {
    if(index > str.length - 1) return str;
    return str.substring(0, index) + chr + str.substring(index + 1);
}

export default permutations