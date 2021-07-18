const UNIT_FEE = 10

interface ModifiableClosingAccount {
    readonly accountId: string
    amount: number
}

interface ModifiableRecipientAccount {
    readonly accountId: string
    credit: number
}

export interface ClosingAccount {
    readonly accountId: string
    readonly amount: number
}

export interface RecipientAccount {
    readonly accountId: string
    readonly credit: number
}

export interface Transfer {
    readonly fromAccountId: string
    readonly toAccountId: string | null
    readonly value: number
}

const newRebalancingTx = (closingAccounts: ReadonlyArray<ClosingAccount>, recipientAccounts: ReadonlyArray<RecipientAccount>):
    {transfers: Transfer[], operationalFee: number} => {
    if (recipientAccounts.some(r => r.credit <= 0)) {
        throw 'The recipient accounts cannot have ZERO or negative credit. Please exclude such accounts and try again'
    }

    const sumFromAllClosingAccounts = sum(closingAccounts, a => a.amount)
    const sumFromAllRecipientAccounts = sum(recipientAccounts, a => a.credit)

    if (sumFromAllRecipientAccounts > sumFromAllClosingAccounts) {
        throw 'Not enough funds for rebalance'
    }

    const transfers: Transfer[] = []

    // map to modifiable interfaces and sort by amount & credit
    const closingAccountsQueue = getModifiableClosingAccounts(closingAccounts)
    const recipientsQueue = getModifiableRecipientAccounts(recipientAccounts)

    let currentClosingAccount = closingAccountsQueue.shift()
    let currentRecipient = recipientsQueue.shift()

    // first make sure all recipients get credited what they are due
    while (currentRecipient && currentClosingAccount) {
        const amountToTransfer = limit(currentClosingAccount.amount, currentRecipient.credit)
        currentRecipient.credit -= amountToTransfer
        currentClosingAccount.amount -= amountToTransfer

        transfers.push({
            fromAccountId: currentClosingAccount.accountId,
            toAccountId: currentRecipient.accountId,
            value: amountToTransfer
        })

        if (currentClosingAccount.amount === 0) {
            currentClosingAccount = closingAccountsQueue.shift()
        }
        if (currentRecipient.credit === 0) {
            currentRecipient = recipientsQueue.shift()
        }
    }

    // now create transactions for the remainders
    while (currentClosingAccount) {
        transfers.push({
            fromAccountId: currentClosingAccount.accountId,
            toAccountId: null,
            value: currentClosingAccount.amount
        })

        currentClosingAccount = closingAccountsQueue.shift()
    }

    const operationalFee = transfers.length * UNIT_FEE

    // now we start popping the items from the transfer array to adjust them based on the operational fee
    if (operationalFee > 0) {
        let remainingOperationalFee = operationalFee

        let feePayor = transfers.pop()

        while (remainingOperationalFee !== 0 && feePayor) {
            if (feePayor.toAccountId !== null) {
                // if we got here, this means there's still fees to be paid but the remainders
                // were not enough to pay for it, therefore we should throw
                throw 'Not enough funds for rebalance'
            }

            if (feePayor.value > remainingOperationalFee) {
                // if we got here it means this remainder is enough to pay for the entire fee
                // and there will still be value left, therefore we add it back with the adjusted value
                transfers.push({
                    fromAccountId: feePayor.fromAccountId,
                    toAccountId: feePayor.toAccountId,
                    value: feePayor.value - remainingOperationalFee
                })
                remainingOperationalFee = 0
            } else if (feePayor.value === remainingOperationalFee) {
                // if we got here it means this remainder is enough to pay for the entire fee
                // and should not be added back, as it's value would be zero
                remainingOperationalFee = 0
            } else {
                // if we got here it means this remainder is not enough to pay for the operational fee by itself
                // therefore we subtract from what is remaining to be paid and try the next remainders
                remainingOperationalFee -= feePayor.value
                feePayor = transfers.pop()
            }
        }
    }

    return {transfers: transfers, operationalFee: operationalFee}
}

const getModifiableClosingAccounts = (closingAccounts: ReadonlyArray<ModifiableClosingAccount>):
    ModifiableClosingAccount[] => {
    return closingAccounts.map(x => ({
        accountId: x.accountId,
        amount: x.amount
    } as ModifiableClosingAccount))
        .sort((x, y) =>
            x.amount > y.amount ? -1 : y.amount > x.amount ? 1 : 0)
}

const getModifiableRecipientAccounts = (recipientAccounts: ReadonlyArray<RecipientAccount>):
    ModifiableRecipientAccount[] => {
    return recipientAccounts.map(x => ({
        accountId: x.accountId,
        credit: x.credit
    } as ModifiableRecipientAccount))
        .sort((x, y) =>
            x.credit > y.credit ? -1 : y.credit > x.credit ? 1 : 0)
}

const sum = <T>(arr: ReadonlyArray<T>, predicate: (obj: T) => number): number => {
    return arr.reduce((prev, curr) => prev + predicate(curr), 0)
}

const limit = (amount: number, limit: number): number => {
    if (amount > limit) return limit

    return amount
}

export {
    newRebalancingTx
}
