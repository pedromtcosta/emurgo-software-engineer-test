import chai from 'chai'
const expect = chai.expect

import { newRebalancingTx, ClosingAccount, RecipientAccount, Transfer } from "../../src/bank"

describe("Bank", () => {
    describe("newRebalancingTx", () => {
        describe("should return correct results for", () => {
            it("[{acc1, 500}, {acc2, 500}] & [{rec1, 400}]", () => {
                const closingAccounts: ClosingAccount[] = [
                    { accountId: 'acc1', amount: 500 },
                    { accountId: 'acc2', amount: 500 }
                ]

                const recipientsAccounts: RecipientAccount[] = [
                    { accountId: 'rec1', credit: 400 }
                ]

                const result = newRebalancingTx(closingAccounts, recipientsAccounts)

                expect(result.transfers)
                    .to.have.length(3)
                expect(result.operationalFee)
                    .to.equal(30)

                expect(result.transfers)
                    .to.deep.include({ fromAccountId: 'acc1', toAccountId: 'rec1', value: 400 } as Transfer)
                expect(result.transfers)
                    .to.deep.include({ fromAccountId: 'acc1', toAccountId: null, value: 100 } as Transfer)
                expect(result.transfers)
                    .to.deep.include({ fromAccountId: 'acc2', toAccountId: null, value: 470 } as Transfer)
            })

            it("[{acc1, 1000}] & [{rec1, 500}, {rec2, 470}]", () => {
                const closingAccounts: ClosingAccount[] = [
                    { accountId: 'acc1', amount: 1000 }
                ]

                const recipientsAccounts: RecipientAccount[] = [
                    { accountId: 'rec1', credit: 500 },
                    { accountId: 'rec2', credit: 470 }
                ]

                const result = newRebalancingTx(closingAccounts, recipientsAccounts)

                expect(result.transfers)
                    .to.have.length(2)
                expect(result.operationalFee)
                    .to.equal(30)

                expect(result.transfers)
                    .to.deep.include({ fromAccountId: 'acc1', toAccountId: 'rec1', value: 500 } as Transfer)
                expect(result.transfers)
                    .to.deep.include({ fromAccountId: 'acc1', toAccountId: 'rec2', value: 470 } as Transfer)
            })

            it("[{acc1, 500}, {acc2, 600}] & no recipients", () => {
                const closingAccounts: ClosingAccount[] = [
                    { accountId: 'acc1', amount: 500 },
                    { accountId: 'acc2', amount: 600 }
                ]

                const result = newRebalancingTx(closingAccounts, [])

                expect(result.transfers)
                    .to.have.length(2)
                expect(result.operationalFee)
                    .to.equal(20)

                expect(result.transfers)
                    .to.deep.include({ fromAccountId: 'acc1', toAccountId: null, value: 480 } as Transfer)
                expect(result.transfers)
                    .to.deep.include({ fromAccountId: 'acc2', toAccountId: null, value: 600 } as Transfer)
            })

            it("[{acc1, 50}, {acc2, 40}, {acc3, 10}] & [{rec1, 50}, {rec2, 10}]", () => {
                const closingAccounts: ClosingAccount[] = [
                    { accountId: 'acc1', amount: 50 },
                    { accountId: 'acc2', amount: 40 },
                    { accountId: 'acc3', amount: 10 }
                ]

                const recipientsAccounts: RecipientAccount[] = [
                    { accountId: 'rec1', credit: 50 },
                    { accountId: 'rec2', credit: 10 }
                ]

                const result = newRebalancingTx(closingAccounts, recipientsAccounts)

                /*
                    these inputs would generate:
                    [{acc1, rec1, 50}, {acc2, rec2, 10}, {acc2, null, 30}, {acc3, null, 10}]
                    therefore, the operational fee is 40, but we end up with only 2 transfers because
                    the other two are removed due to their final value being 0
                 */
                expect(result.transfers)
                    .to.have.length(2)
                expect(result.operationalFee)
                    .to.equal(40)

                expect(result.transfers)
                    .to.deep.include({ fromAccountId: 'acc1', toAccountId: 'rec1', value: 50 } as Transfer)
                expect(result.transfers)
                    .to.deep.include({ fromAccountId: 'acc2', toAccountId: 'rec2', value: 10 } as Transfer)
            })

            it("[{acc1, 400}] & [{rec1, 100}, {rec2, 100}, {rec3, 100}, {rec4, 50}]", () => {
                const closingAccounts: ClosingAccount[] = [
                    { accountId: 'acc1', amount: 400 }
                ]

                const recipientsAccounts: RecipientAccount[] = [
                    { accountId: 'rec1', credit: 100 },
                    { accountId: 'rec2', credit: 100 },
                    { accountId: 'rec3', credit: 100 },
                    { accountId: 'rec4', credit: 50 }
                ]

                const result = newRebalancingTx(closingAccounts, recipientsAccounts)

                expect(result.transfers)
                    .to.have.length(4)
                expect(result.operationalFee)
                    .to.equal(50)

                expect(result.transfers)
                    .to.deep.include({ fromAccountId: 'acc1', toAccountId: 'rec1', value: 100 } as Transfer)
                expect(result.transfers)
                    .to.deep.include({ fromAccountId: 'acc1', toAccountId: 'rec2', value: 100 } as Transfer)
                expect(result.transfers)
                    .to.deep.include({ fromAccountId: 'acc1', toAccountId: 'rec3', value: 100 } as Transfer)
                expect(result.transfers)
                    .to.deep.include({ fromAccountId: 'acc1', toAccountId: 'rec4', value: 50 } as Transfer)
            })

            it("[{acc1, 500}, {acc2, 10}] & [{rec1, 470}]", () => {
                const closingAccounts: ClosingAccount[] = [
                    { accountId: 'acc1', amount: 500 },
                    { accountId: 'acc2', amount: 10 }
                ]

                const recipientsAccounts: RecipientAccount[] = [
                    { accountId: 'rec1', credit: 470 }
                ]

                const result = newRebalancingTx(closingAccounts, recipientsAccounts)

                /*
                    these inputs would generate:
                    [{acc1, rec1, 470}, {acc1, null, 30}, {acc2, null, 10}]
                    therefore, the operational fee is 30, but we end up with only 2 transfers because
                    the other one is removed due to its final value being 0. Also, because the latest,
                    remainder wasn't enough to pay for the entire operational fee, the remainder from
                    the first operation is also used
                 */
                expect(result.transfers)
                    .to.have.length(2)
                expect(result.operationalFee)
                    .to.equal(30)

                expect(result.transfers)
                    .to.deep.include({ fromAccountId: 'acc1', toAccountId: 'rec1', value: 470 } as Transfer)
                expect(result.transfers)
                    .to.deep.include({ fromAccountId: 'acc1', toAccountId: null, value: 10 } as Transfer)
            })
        })

        describe("should fail", () => {
            it("if any recipients have ZERO credit", () => {
                const closingAccounts: ClosingAccount[] = [
                    { accountId: 'acc1', amount: 1000 }
                ]

                const recipientsAccounts: RecipientAccount[] = [
                    { accountId: 'rec1', credit: 500 },
                    { accountId: 'rec2', credit: 0 },
                    { accountId: 'rec3', credit: 400 }
                ]

                expect(() => newRebalancingTx(closingAccounts, recipientsAccounts))
                    .to.throw('The recipient accounts cannot have ZERO or negative credit. Please exclude such accounts and try again')
            })

            it("if not enough funds to credit all recipients", () => {
                const closingAccounts: ClosingAccount[] = [
                    { accountId: 'acc1', amount: 1000 },
                    { accountId: 'acc2', amount: 1500 }
                ]

                const recipientsAccounts: RecipientAccount[] = [
                    { accountId: 'rec1', credit: 500 },
                    { accountId: 'rec2', credit: 400 },
                    { accountId: 'rec3', credit: 400 },
                    { accountId: 'rec4', credit: 900 },
                    { accountId: 'rec5', credit: 1500 },
                    { accountId: 'rec6', credit: 800 },
                    { accountId: 'rec7', credit: 400 },
                    { accountId: 'rec8', credit: 200 },
                ]

                expect(() => newRebalancingTx(closingAccounts, recipientsAccounts))
                    .to.throw('Not enough funds for rebalance')
            })

            describe("if not enough funds for operational fee when", () => {
                it("[{acc1, 1000}] & [{rec1, 1000}]", () => {
                    const closingAccounts: ClosingAccount[] = [
                        { accountId: 'acc1', amount: 1000 }
                    ]

                    const recipientsAccounts: RecipientAccount[] = [
                        { accountId: 'rec1', credit: 1000 }
                    ]

                    expect(() => newRebalancingTx(closingAccounts, recipientsAccounts))
                        .to.throw('Not enough funds for rebalance')
                })

                it("[{acc1, 400}] & [{rec1, 100}, {rec2, 100}, {rec3, 100}, {rec4, 99}]", () => {
                    const closingAccounts: ClosingAccount[] = [
                        { accountId: 'acc1', amount: 400 }
                    ]

                    const recipientsAccounts: RecipientAccount[] = [
                        { accountId: 'rec1', credit: 100 },
                        { accountId: 'rec2', credit: 100 },
                        { accountId: 'rec3', credit: 100 },
                        { accountId: 'rec4', credit: 99 }
                    ]

                    expect(() => newRebalancingTx(closingAccounts, recipientsAccounts))
                        .to.throw('Not enough funds for rebalance')
                })

                it("[{acc1, 500}] & [{rec1, 490}]", () => {
                    const closingAccounts: ClosingAccount[] = [
                        { accountId: 'acc1', amount: 500 }
                    ]

                    const recipientsAccounts: RecipientAccount[] = [
                        { accountId: 'rec1', credit: 490 }
                    ]

                    expect(() => newRebalancingTx(closingAccounts, recipientsAccounts))
                        .to.throw('Not enough funds for rebalance')
                })
            })
        })
    })
})