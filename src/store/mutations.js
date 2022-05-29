import { findIndexes } from "../utils";
import { LIST_ITEM_TO_REDACT, LIST_ITEM_TO_DISPLAY } from "../constants";

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
 */
const removeItemByIndexes = ({ items }, { indexes }) => {
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
const removeItem = ({ items }, { item }) => {
    const indexes = findIndexes(items, item);
    removeItemByIndexes({ items }, { indexes });
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
    selectToRedact(state, { item }) {
        state._selectedItem[LIST_ITEM_TO_REDACT] = item;
    },

    unselectToRedact(state) {
        state._selectedItem[LIST_ITEM_TO_REDACT] = null;
    },

    selectToDisplay(state, { item }) {
        state._selectedItem[LIST_ITEM_TO_DISPLAY] = item;
    },

    unselectToDisplay(state) {
        state._selectedItem[LIST_ITEM_TO_DISPLAY] = null;
    },

    addAppClickListener(state, { callback, once = false }) {
        const coveredCallback = once
            ? () => { callback(); state.appClickListeners = state.appClickListeners.filter((cb) => cb !== coveredCallback); }
            : callback;

        state.appClickListeners.push(coveredCallback);
    },

    removeAppClickListener(state, { callback }) {
        state.appClickListeners = state.appClickListeners.filter((cb) => cb !== callback);
    },

    redactName(state, { value }) {
        state._selectedItem[LIST_ITEM_TO_REDACT].name = value;
    },

    removeItem,

    removeItemByIndexes,

    insert
};
