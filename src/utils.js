/**
 * An element of array
 * @typedef {object} Item
 */

/**
 * An array of elements
 * @typedef {Item[]} Items
 */

/**
 * An array of elements
 * @typedef {[]} Indexes
 * @property {[number, ...Indexes[]]}
 */

/**
 * Determines whether an array includes an element.
 * Returns true or false.
 * @param {Item} item
 * @param {Items} items
 * @returns {boolean}
 */
export const includes = (items, item) => {
    for (let i = 0; i < items.length; i++) {
        const nestedItem = items[i];
        if (item === nestedItem) return true;

        if (Array.isArray(nestedItem.items)) {
            const result = includes(nestedItem.items, item);

            if (result) return result;
        }
    }

    return false;
};

/**
 * Finds path (indexes) of item in array.
 * @param {Item} item
 * @param {Items} items
 * @returns {null|Indexes}
 */
export const findIndexes = (items, item) => {
    for (let i = 0; i < items.length; i++) {
        const nestedItem = items[i];

        if (item === nestedItem) return [i];

        if (Array.isArray(nestedItem.items)) {
            const idx = findIndexes(nestedItem.items, item);

            if (idx) return [i, ...idx];
        }
    }

    return null;
};