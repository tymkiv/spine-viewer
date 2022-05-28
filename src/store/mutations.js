import { findIndexes } from "../utils";
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
 * !Mutation! Removes an element from an array by indexes.
 * Returns the removed item.
 * @param {Indexes} indexes
 * @param {Items} items
 * @returns {Item}
 */
const removeItemByIndexes = ({ items }, { indexes }) => {
    for (let i = 0; i < indexes.length - 1; i++) {
        items = items[indexes[i]].items;
    }

    items.splice(indexes[indexes.length - 1], 1);
};

/**
 * !Mutation! Removes an element from an array.
 * Returns the removed item.
 * @param {Item} item
 * @param {Items} items
 * @returns {Item}
 */
const removeItem = ({ items }, { item }) => {
    const indexes = findIndexes(items, item);
    return removeItemByIndexes({ items }, { indexes });
};

/**
 * !Mutation! Inserts item to array by indexes
 * @param {Item[]} itemsToInsert
 * @param {Items} items
 * @param {Indexes} indexes
 */
const insert = ({ items }, { itemsToInsert, indexes }) => {
    for (let i = 0; i < indexes.length - 1; i++) {
        items = items[indexes[i]].items ||= [];
    }

    items.splice(indexes[indexes.length - 1], 0, ...itemsToInsert);
};

export default {
    selectItem(state, { item }) {
        state._selectedItem = item;
    },

    unselectItem(state) {
        state._selectedItem = null;
    },

    selectScene(state, { item }) {
        state._selectedScene = item;
    },

    unselectScene(state) {
        state._selectedScene = null;
    },

    removeItem,

    removeItemByIndexes,

    insert
};
