# Emurgo software engineer test

Repository for a software engineer assignment I received from [Emurgo](https://emurgo.io/). See the [assignment description here](assignment_description.pdf).

### Solutions structure
Each solution has their own folder under `/src` and `/spec`. The entry point for each solution is the `index.ts` file at the root of its own directory.
1. Permutations = `/src/permutations` & `/spec/permutations`
2. Data-model = `/src/pizza-restaurant` & `/spec/pizza-restaurant`
3. Building a transaction = `/src/bank` & `/spec/bank`

### Comments, considerations and (maybe) more
#### Permutations
This solution is relying on the fact that the only possible inputs for a `*` are `0` and `1`, but it could be easily changed to also work with more variations

#### Pizza restaurant
In this one I built the data model taking kind of a "***functional approach***". You'll see that every type that is exposed is immutable. I took this approach because the API we are exposing comes from methods outside the types, and I am not a fan of having methods which modify arguments that came from client code.

#### Bank
In this one I believe there is a ***functional gap*** in the [assignment description](assignment_description.pdf).
At the example of how the operational fee should be handled, it states that the fee is calculated as `transfers.length * 10`, but the sample response has `3` objects in the `transfers` array with a fee of just `20`.
Looking at this, I thought of 3 possible explanations for this discrepancy:
1. the second transfer doesn't add to the fee because it is counted as the "same" operation as the first one;
2. the third transaction doesn't add to the fee because it is only used to pay for the fee;
3. that was a *typo*;

This solution was designed assuming that was a `typo` because the first two possible explanations seems rather arbitrary, so I think it makes more sense to indeed assume it was a typo.
This assumption can lead to some results which are not that intuitive, so I also left some comments on the following specs, be sure to check them out:
- `Bank => newRebalancingTx => should return correct results for => [{acc1, 50}, {acc2, 40}, {acc3, 10}] & [{rec1, 50}, {rec2, 10}]`;
- `Bank => newRebalancingTx => should return correct results for => [{acc1, 500}, {acc2, 10}] & [{rec1, 470}]`;