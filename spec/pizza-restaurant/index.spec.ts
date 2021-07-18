import chai from 'chai'
const expect = chai.expect

import {
    Allergen, doubleIngredients,
    FoodType, getCalories,
    Ingredient,
    Recipe,
    removeAllergens,
    removeFoodTypes,
    removeIngredients
} from '../../src/pizza-restaurant'
import {hasFoodTypes, hasAllergens} from '../../src/pizza-restaurant'

describe("Pizza restaurant", () => {
    // common allergens
    const lactose: Allergen = { name: 'Lactose' }
    const parvalbumin: Allergen = { name: 'Parvalbumin' } // fish protein
    const soy: Allergen = { name: 'Soy' }

    // common food types
    const cheese: FoodType = { name: 'Cheese', allergens: [lactose] }
    const fish: FoodType = { name: 'Fish', allergens: [parvalbumin] }
    const mushrooms: FoodType = { name: 'Mushrooms', allergens: [] }
    const herbs: FoodType = { name: 'Herbs', allergens: [] }

    // common ingredients
    const mozzarella = new Ingredient('Mozzarella', [], [cheese], 100)
    const basil = new Ingredient('Basil', [], [herbs], 1)
    const tomatoSauce = new Ingredient('Tomato sauce', [], [], 50) // use case for a ingredient which has an allergen which doesn't come from the food type
    const shitake = new Ingredient('Shitake', [], [mushrooms], 53)
    const champignon = new Ingredient('Champignon', [], [mushrooms], 68)
    const tuna = new Ingredient('Tuna', [], [fish], 167)
    const soySauce = new Ingredient('Soy sauce', [soy], [], 167)

    describe("hasFoodTypes", () => {
        it("should return false if recipe has food type", () => {
            const mushroomPizza = new Recipe(
                'Mushroom Pizza',
                [tomatoSauce, shitake, champignon]
            );

            const hasMushrooms = hasFoodTypes(mushroomPizza, mushrooms)
            expect(hasMushrooms)
                .to.be.true
        })

        it("should return false if recipe has any of the food types", () => {
            const mushroomPizza = new Recipe(
                'Mushroom Pizza',
                [tomatoSauce, shitake, champignon]
            );

            const hasMushrooms = hasFoodTypes(mushroomPizza, mushrooms, cheese)
            expect(hasMushrooms)
                .to.be.true
        })

        it("should return false if recipe doesn't has food type", () => {
            const margherita = new Recipe(
                'Margherita',
                [tomatoSauce, mozzarella, basil]
            );

            const hasMushrooms = hasFoodTypes(margherita, mushrooms)
            expect(hasMushrooms)
                .to.be.false
        })
    })

    describe("hasAllergens", () => {
        it("should return true if recipe has allergen in a food type of any ingredients", () => {
            const plainTuna = new Recipe(
                'Plain Tuna',
                [tomatoSauce, tuna]
            );

            const hasParvalbuminAllergen = hasAllergens(plainTuna, parvalbumin)
            expect(hasParvalbuminAllergen)
                .to.be.true
        })

        it("should return true if recipe has allergen in any of the ingredients", () => {
            const tunaWithSoySauce = new Recipe(
                'Tuna With Soy Sauce',
                [tomatoSauce, tuna, soySauce]
            );

            const hasSoyAllergen = hasAllergens(tunaWithSoySauce, soy)
            expect(hasSoyAllergen)
                .to.be.true
        })

        it("should return false if recipe doesn't has the allergen", () => {
            const margherita = new Recipe(
                'Margherita',
                [tomatoSauce, mozzarella, basil]
            );

            const hasSoyAllergen = hasAllergens(margherita, soy)
            expect(hasSoyAllergen)
                .to.be.false
        })
    })

    describe("removeIngredients", () => {
        it("should remove specified ingredients", () => {
            const margherita = new Recipe(
                'Margherita',
                [tomatoSauce, mozzarella, basil]
            );

            const margheritaWithoutBasil = removeIngredients(margherita, basil)

            expect(margheritaWithoutBasil.ingredients)
                .to.not.contain(basil)
            expect(margheritaWithoutBasil.ingredients)
                .to.contain(tomatoSauce)
            expect(margheritaWithoutBasil.ingredients)
                .to.contain(mozzarella)
        })

        it("should keep doubled information after removing ingredient", () => {
            const margherita = new Recipe(
                'Margherita',
                [tomatoSauce, mozzarella, basil]
            );

            const margheritaWithDoubledMozzarella = doubleIngredients(margherita, mozzarella)
            const customMargherita = removeIngredients(margheritaWithDoubledMozzarella, basil)

            expect(customMargherita.ingredients)
                .to.not.contain(basil)
            expect(customMargherita.ingredients)
                .to.contain(tomatoSauce)
            expect(customMargherita.ingredients)
                .to.contain(mozzarella)

            const doubledMozzarella = customMargherita
                .ingredientsWithQuantity
                .find(i => i.ingredient === mozzarella)

            expect(doubledMozzarella?.doubled)
                .to.be.true
        })
    })

    describe("removeAllergens", () => {
        it("should remove ingredients with specific allergens", () => {
            const margherita = new Recipe(
                'Margherita',
                [tomatoSauce, mozzarella, basil]
            );

            const margheritaWithoutCheese = removeAllergens(margherita, lactose)

            expect(margheritaWithoutCheese.ingredients)
                .to.not.contain(mozzarella)
            expect(margheritaWithoutCheese.ingredients)
                .to.contain(tomatoSauce)
            expect(margheritaWithoutCheese.ingredients)
                .to.contain(basil)
        })

        it("should remove ingredients with allergens from food types", () => {
            const tunaWithSoySauce = new Recipe(
                'Tuna With Soy Sauce',
                [tomatoSauce, tuna, soySauce]
            );

            const tunaWithSoySauceWithoutTuna = removeAllergens(tunaWithSoySauce, parvalbumin)

            expect(tunaWithSoySauceWithoutTuna.ingredients)
                .to.not.contain(tuna)
            expect(tunaWithSoySauceWithoutTuna.ingredients)
                .to.contain(tomatoSauce)
            expect(tunaWithSoySauceWithoutTuna.ingredients)
                .to.contain(soySauce)
        })
    })

    describe("removeFoodTypes", () => {
        it("should remove specified food types", () => {
            const margherita = new Recipe(
                'Margherita',
                [tomatoSauce, mozzarella, basil]
            );

            const margheritaWithoutCheese = removeFoodTypes(margherita, cheese)

            expect(margheritaWithoutCheese.ingredients)
                .to.not.contain(mozzarella)
            expect(margheritaWithoutCheese.ingredients)
                .to.contain(tomatoSauce)
            expect(margheritaWithoutCheese.ingredients)
                .to.contain(basil)
        })
    })

    describe("doubleIngredients", () => {
        it("should double ingredient", () => {
            const margherita = new Recipe(
                'Margherita',
                [tomatoSauce, mozzarella, basil]
            );

            const margheritaWithDoubledMozzarella = doubleIngredients(margherita, mozzarella)

            const doubledMozzarella = margheritaWithDoubledMozzarella
                .ingredientsWithQuantity
                .find(i => i.ingredient === mozzarella)

            expect(doubledMozzarella?.doubled)
                .to.be.true
        })
    })

    describe("getCalories", () => {
        it("should get calories from recipe", () => {
            const margherita = new Recipe(
                'Margherita',
                [tomatoSauce, mozzarella, basil]
            );

            const calories = getCalories(margherita)

            expect(calories)
                .to.equal(
                margherita.baseCalories
                + tomatoSauce.calories
                + mozzarella.calories
                + basil.calories)
        })

        it("should get calories from recipe with doubled ingredients", () => {
            const margherita = new Recipe(
                'Margherita',
                [tomatoSauce, mozzarella, basil]
            );

            const margheritaWithDoubledMozzarella = doubleIngredients(margherita, mozzarella)
            const calories = getCalories(margheritaWithDoubledMozzarella)

            expect(calories)
                .to.equal(
                margherita.baseCalories
                + tomatoSauce.calories
                + mozzarella.calories * 2
                + basil.calories)
        })
    })
})