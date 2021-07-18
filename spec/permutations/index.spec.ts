import chai from 'chai'
const expect = chai.expect

import permutations from "../../src/permutations"

describe("Permutations", () => {
    describe("should return correct permutations", () => {
        const cases = [
            { input: '*1', expectedOutput: ['01', '11'] },
            { input: '*0', expectedOutput: ['00', '10'] },
            { input: '*01', expectedOutput: ['001', '101'] },
            { input: '*0*', expectedOutput: ['000', '001', '100', '101'] },
            { input: '1**1', expectedOutput: ['1001', '1011', '1101', '1111'] },
            { input: '***', expectedOutput: ['000', '001', '010', '011', '100', '101', '110', '111'] }
        ]

        for (const c of cases) {
            it(`for ${c.input}`, () => {
                const output = permutations(c.input)

                expect(output.length)
                    .to.equals(c.expectedOutput.length, 'the length of the output is not the expected')

                for (const o of c.expectedOutput) {
                    expect(output)
                        .to.contain(o, `the output ${o} was expected but not found`)
                }
            })
        }
    })
})