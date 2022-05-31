import { findIndexes } from "../utils";
import { LIST_ITEM_TO_REDACT, LIST_ITEM_TO_DISPLAY } from "../constants";



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

    addAppListener(state, { type, callback, once = false }) {
        const coveredCallback = once
            ? () => { callback(); state.appClickListeners = state.appClickListeners.filter((cb) => cb !== coveredCallback); }
            : callback;

        state.appListeners[type] ||= [];
        state.appListeners[type].push(coveredCallback);
    },

    removeAppListener(state, { type, callback }) {
        state.appListeners[type] ||= [];
        state.appListeners[type] = state.appListeners[type].filter((cb) => cb !== callback);
    },

    grabbing(state, { value }) {
        state.grabbing = value;
    },

    redactName(state, { value }) {
        state._selectedItem[LIST_ITEM_TO_REDACT].name = value;
    },

    addPlateToSpine(state, { item, plate }) {
        // item.plates.push(plate);
        insert({ items: item.plates }, { itemsToInsert: [plate], indexes: [item.plates.length] });
    },

    removePlateFromSpine(state, { item, plate }) {
        removeItem({ items: item.plates }, { item: plate });
    },

    resourcesAddPicked(state, { item }) {
        state.resources.pickedItems.push(item);
    },

    resourcesRemovePicked(state, { item }) {
        const indexes = findIndexes(state.resources.pickedItems, item);
        removeItemByIndexes({ items: state.resources.pickedItems }, { indexes });
    },

    removeItem,

    removeItemByIndexes,

    insert
};
