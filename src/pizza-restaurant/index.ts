/*
    we are emulating the idea that these interfaces are being retrieved from a data source,
    like a REST API, Database etc. Therefore, we make all their properties readonly, as we
    don't want any client of this code to use it incorrectly (e.g.: remove allergens from a food type).
    the above statement becomes even more clear if we compare with the "real-life", as it is impossible
    to remove allergens from a food type
*/

/**
 * Abstraction for an allergen
 */
export interface Allergen {
    /** name of the allergen */
    readonly name: string
}

/**
 * Abstraction for a food type. Contains allergens specific to that food type
 * (e.g.: food type `cheese` might contain allergen `lactose`
 */
export interface FoodType {
    /** name of the food type */
    readonly name: string
    /** allergens of this food type */
    readonly allergens: ReadonlyArray<Allergen>
}

/**
 * Represents an ingredient. Contains allergens and food types specific to that ingredient
 */
export class Ingredient {
    /** name of the ingredient */
    readonly name: string
    /** allergens specific to the ingredient */
    readonly specificAllergens: ReadonlyArray<Allergen>
    /** food types of this ingredient (e.g.: salami can have food types `meat` and `deli`) */
    readonly foodTypes: ReadonlyArray<FoodType>
    /** calories of the ingredient */
    readonly calories: number

    /**
     * constructs an ingredient
     * @param name name of the ingredient
     * @param specificAllergens allergens specific to this ingredient, independent from the food type allergens
     * @param foodTypes food types of the ingredient
     * @param calories calories of the ingredient
     */
    constructor(name: string, specificAllergens: Allergen[], foodTypes: FoodType[], calories: number) {
        this.name = name
        this.specificAllergens = specificAllergens
        this.foodTypes = foodTypes
        this.calories = calories
    }

    /** returns all allergens of this ingredient, including the ones from its food types */
    get allergens(): ReadonlyArray<Allergen> {
        const foodTypesAllergens = this.foodTypes
            .map(ft => ft.allergens)
            .reduce((prev, curr) => prev.concat(curr), [] as Allergen[])

        return this.specificAllergens.concat(foodTypesAllergens)
    }
}

/**
 * represents an ingredient which is in a recipe
 */
export interface IngredientInRecipe {
    /** tells if this ingredient is doubled in this recipe */
    readonly doubled: boolean
    /** the ingredient present in the recipe */
    readonly ingredient: Ingredient
}

/**
 * Represents a recipe. Contains ingredients and their quantities
 */
export class Recipe {
    // internal map of ingredient => doubled. We don't want client code changing this directly
    private _ingredients = new Map<Ingredient, boolean>()

    /** name of the recipe */
    readonly name: string

    /** base calories for the recipe excluding the ingredients */
    readonly baseCalories: number

    /**
     * constructs a recipe
     * @param name name of the recipe
     * @param ingredients ingredients of the recipe
     * @param baseCalories base calories for the recipe
     */
    constructor(name: string, ingredients: Ingredient[], baseCalories: number = 250) {
        this.name = name
        this.baseCalories = baseCalories
        for (const ingredient of ingredients) {
            this._ingredients.set(ingredient, false)
        }
    }

    /** gets all ingredients from this recipe */
    get ingredients(): ReadonlyArray<Ingredient> {
        const ingredients: Ingredient[] = []
        this._ingredients.forEach((v, k) => {
            ingredients.push(k)
        })
        return ingredients
    }

    /** gets the ingredients together with the information if they are doubled or not in the recipe */
    get ingredientsWithQuantity(): ReadonlyArray<IngredientInRecipe> {
        const ingredients: IngredientInRecipe[] = []
        this._ingredients.forEach((v, k) => {
            ingredients.push({
                ingredient: k,
                doubled: v
            })
        })
        return ingredients
    }

    /** gets all food types from all ingredients from this recipe */
    get foodTypes(): ReadonlyArray<FoodType> {
        return [...new Set(this.ingredients
            .reduce((prev, curr) => prev.concat(curr.foodTypes), [] as FoodType[]))]
    }

    /** get all allergens from all ingredients in this recipe */
    get allergens(): ReadonlyArray<Allergen> {
        return [...new Set(this.ingredients
            .reduce((prev, curr) => prev.concat(curr.allergens), [] as Allergen[]))]
    }

    /**
     * returns a new identical recipe but with a doubled ingredient
     * @param ingredient the ingredient to be doubled
     */
    doubleIngredient(ingredient: Ingredient): Recipe {
        const newRecipe = new Recipe(this.name, this.ingredients.map(x => x))

        // thank you JS for allowing this :)
        newRecipe._ingredients.set(ingredient, true)
        return newRecipe
    }
}

const hasAllergens = (recipe: Recipe, ... allergens: Allergen[]): boolean => {
    return recipe.allergens.some(a => allergens.includes(a))
}

const hasFoodTypes = (recipe: Recipe, ... foodTypes: FoodType[]): boolean => {
    return recipe.foodTypes.some(f => foodTypes.includes(f))
}

const removeAllergens = (recipe: Recipe, ... allergens: Allergen[]): Recipe => {
    const ingredientsToRemove = recipe
        .ingredients
        .filter(i => i.allergens.some(a => allergens.includes(a)))
    return removeIngredients(recipe, ...ingredientsToRemove)
}

const removeFoodTypes = (recipe: Recipe, ... foodTypes: FoodType[]): Recipe => {
    const ingredientsToRemove = recipe
        .ingredients
        .filter(i => i.foodTypes.some(f => foodTypes.includes(f)))
    return removeIngredients(recipe, ...ingredientsToRemove)
}

const removeIngredients = (recipe: Recipe, ... ingredients: Ingredient[]): Recipe => {
    const currentlyDoubledIngredients = recipe
        .ingredientsWithQuantity
        .filter(i => i.doubled)
        .map(i => i.ingredient)

    const newRecipeIngredients = recipe
        .ingredients
        .filter(i => !ingredients.includes(i))

    let newRecipe = new Recipe(recipe.name, newRecipeIngredients, recipe.baseCalories)
    newRecipe = doubleIngredients(newRecipe, ...currentlyDoubledIngredients)

    return newRecipe
}

const doubleIngredients = (recipe: Recipe, ... ingredients: Ingredient[]): Recipe => {
    let newRecipe = recipe
    for (const ingredient of ingredients) {
        newRecipe = newRecipe.doubleIngredient(ingredient)
    }
    return newRecipe
}

const getCalories = (recipe: Recipe): number => {
    const ingredientsCalories = recipe
        .ingredientsWithQuantity
        .reduce((prev, curr) => prev + curr.ingredient.calories * (curr.doubled ? 2 : 1), 0)
    return recipe.baseCalories + ingredientsCalories
}

export {
    hasAllergens,
    hasFoodTypes,
    removeAllergens,
    removeFoodTypes,
    removeIngredients,
    doubleIngredients,
    getCalories
}