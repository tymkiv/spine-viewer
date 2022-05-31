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

import { findIndexes } from "../utils";

/**
 * !Mutation! Removes an element from an array by indexes.
 * Returns the removed item.
 * @param {Indexes} indexes
 * @param {Items} items
 */
export const REMOVE_ITEM_BY_INDEXES = (items, indexes) => {
    if (!indexes) return;
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
 */
export const REMOVE_ITEM = (items, item) => {
    const indexes = findIndexes(items, item);
    REMOVE_ITEM_BY_INDEXES(items, indexes);
};

/**
 * !Mutation! Inserts item to array by indexes
 * @param {Item[]} items
 * @param {Items} stateItems
 * @param {Indexes} indexes
 */
export const INSERT = (stateItems, { items, indexes }) => {
    for (let i = 0; i < indexes.length - 1; i++) {
        stateItems = stateItems[indexes[i]].items ||= [];
    }

    stateItems.splice(indexes[indexes.length - 1], 0, ...items);
};