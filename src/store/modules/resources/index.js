import { v4 } from "uuid";
import { REMOVE_ITEM, REMOVE_ITEM_BY_INDEXES, INSERT } from "../../utils";

const index = {
    _ITEMS: [
        {
            id: v4(),
            name: "resource 1",
            checked: false
        },
        {
            id: v4(),
            name: "resource 2",
            checked: false
        },
        {
            id: v4(),
            name: "resource 3",
            checked: false
        },
        {
            id: v4(),
            name: "resource 4",
            checked: false
        }
    ]
};

const getters = {
    items(state) {
        return state._ITEMS;
    },

    checkedItems(state) {
        return state._ITEMS.filter(item => item.checked);
    }
};

const mutations = {
    _CHANGE_CHECKED(state, { item, checked }) {
        item.checked = checked;
    },

    _REMOVE_ITEM(state, item) {
        REMOVE_ITEM(state._ITEMS, item);
    },

    _REMOVE_ITEM_BY_INDEXES(state, indexes) {
        REMOVE_ITEM_BY_INDEXES(state._ITEMS, indexes);
    },

    _INSERT(state, { items, indexes }) {
        INSERT(state._ITEMS, { items, indexes });
    }
};

const actions = {
    changeChecked({ commit }, { item, checked }) {
        commit("_CHANGE_CHECKED", { item, checked });
    },

    removeItem({ commit }, item) {
        commit("_REMOVE_ITEM", item);
    },

    removeItemByIndexes({ commit }, indexes) {
        commit("_REMOVE_ITEM_BY_INDEXES", indexes);
    },

    insert({ commit }, { items, indexes }) {
        commit("_INSERT", { items, indexes });
    }
};

export default {
    namespaced: true,
    state: index,
    getters,
    actions,
    mutations
};