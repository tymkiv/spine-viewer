import { v4 } from "uuid";
import { REMOVE_ITEM, REMOVE_ITEM_BY_INDEXES, INSERT } from "../../utils";
import { flat } from "../../../utils";

const index = {
    _ITEMS: [
        // {
        //     id: v4(),
        //     name: "Scene 1",
        //     type: "scene",
        //     items: [
        //         {
        //             id: v4(),
        //             name: "Spine 1",
        //             type: "item",
        //             items: [],
        //             probableAnimations: [
        //                 {
        //                     id: v4(),
        //                     name: "animation 1",
        //                     duration: 0.5
        //                 },
        //                 {
        //                     id: v4(),
        //                     name: "animation 2",
        //                     duration: 0.7
        //                 },
        //                 {
        //                     id: v4(),
        //                     name: "animation 3",
        //                     duration: 0.3
        //                 }
        //             ],
        //             animations: []
        //         },
        //         {
        //             id: v4(),
        //             name: "Spine 2",
        //             type: "item",
        //             items: [],
        //             probableAnimations: [
        //                 {
        //                     id: v4(),
        //                     name: "animation 1",
        //                     duration: 0.5
        //                 },
        //                 {
        //                     id: v4(),
        //                     name: "animation 2",
        //                     duration: 0.7
        //                 },
        //                 {
        //                     id: v4(),
        //                     name: "animation 3",
        //                     duration: 0.3
        //                 }
        //             ],
        //             animations: []
        //         },
        //         {
        //             id: v4(),
        //             name: "Spine 3",
        //             type: "item",
        //             items: [],
        //             probableAnimations: [
        //                 {
        //                     id: v4(),
        //                     name: "animation 1",
        //                     duration: 0.5
        //                 },
        //                 {
        //                     id: v4(),
        //                     name: "animation 2",
        //                     duration: 0.7
        //                 },
        //                 {
        //                     id: v4(),
        //                     name: "animation 3",
        //                     duration: 0.3
        //                 }
        //             ],
        //             animations: []
        //         },
        //         {
        //             id: v4(),
        //             name: "Spine 4",
        //             type: "item",
        //             items: [],
        //             probableAnimations: [
        //                 {
        //                     id: v4(),
        //                     name: "animation 1",
        //                     duration: 0.5
        //                 },
        //                 {
        //                     id: v4(),
        //                     name: "animation 2",
        //                     duration: 0.7
        //                 },
        //                 {
        //                     id: v4(),
        //                     name: "animation 3",
        //                     duration: 0.3
        //                 }
        //             ],
        //             animations: []
        //         }
        //     ]
        // },
        // {
        //     id: v4(),
        //     name: "Scene 2",
        //     type: "scene",
        //     items: [
        //         {
        //             id: v4(),
        //             name: "Spine 5",
        //             type: "item",
        //             items: [],
        //             probableAnimations: [
        //                 {
        //                     id: v4(),
        //                     name: "animation 1",
        //                     duration: 0.5
        //                 },
        //                 {
        //                     id: v4(),
        //                     name: "animation 2",
        //                     duration: 0.7
        //                 },
        //                 {
        //                     id: v4(),
        //                     name: "animation 3",
        //                     duration: 0.3
        //                 }
        //             ],
        //             animations: []
        //         }
        //     ]
        // }
    ],

    _ITEM_TO_REDACT: null,
    _SCENE_TO_DISPLAY: null
};

const getters = {
    items(state) {
        return state._ITEMS;
    },
    itemToRedact(state) {
        return state._ITEM_TO_REDACT;
    },
    sceneToDisplay(state) {
        return state._SCENE_TO_DISPLAY ||= state._ITEMS[0];
    },
    timelineItems(state) {
        state._SCENE_TO_DISPLAY ||= state._ITEMS[0];

        return flat(state._SCENE_TO_DISPLAY?.items);
    }
};

const mutations = {
    _SELECT_ITEM_TO_REDACT(state, item) {
        state._ITEM_TO_REDACT = item;
    },

    _UNSELECT_ITEM_TO_REDACT(state) {
        state._ITEM_TO_REDACT = null;
    },

    _SELECT_SCENE_TO_DISPLAY(state, item) {
        state._SCENE_TO_DISPLAY = item;
    },

    _UNSELECT_SCENE_TO_DISPLAY(state) {
        state._SCENE_TO_DISPLAY = null;
    },

    _REDACT_ITEM(state, name) {
        state._ITEM_TO_REDACT.name = name;
    },

    _REMOVE_ITEM(state, item) {
        REMOVE_ITEM(state._ITEMS, item);
    },

    _REMOVE_ITEM_BY_INDEXES(state, indexes) {
        REMOVE_ITEM_BY_INDEXES(state._ITEMS, indexes);
    },

    _INSERT(state, { items, indexes }) {
        INSERT(state._ITEMS, { items, indexes });
    },

    _ADD_ANIMATION_TO_ITEM(state, { item, animation }) {
        item.animations.push(animation);
    },

    _REMOVE_ANIMATION_FROM_ITEM(state, { item, animation }) {
        const index = item.animations.findIndex(a => a === animation);
        item.animations.splice(index, 1);
    },

    _LOAD_ITEMS(state, items) {
        state._ITEMS.push(...items);
    }
};

const actions = {
    selectItemToRedact({ commit }, item) {
        commit("_SELECT_ITEM_TO_REDACT", item);
    },

    unselectItemToRedact({ commit }, item) {
        commit("_UNSELECT_ITEM_TO_REDACT", item);
    },

    selectSceneToDisplay({ commit }, item) {
        commit("_SELECT_SCENE_TO_DISPLAY", item);
    },

    unselectSceneToDisplay({ commit }, item) {
        commit("_UNSELECT_SCENE_TO_DISPLAY", item);
    },

    redactItem({ commit }, name) {
        commit("_REDACT_ITEM", name);
    },

    removeItem({ commit }, item) {
        commit("_REMOVE_ITEM", item);
    },

    removeItemByIndexes({ commit }, indexes) {
        commit("_REMOVE_ITEM_BY_INDEXES", indexes);
    },

    insert({ commit }, { items, indexes }) {
        commit("_INSERT", { items, indexes });
    },

    addAnimationToItem({ commit }, { item, animation }) {
        commit("_ADD_ANIMATION_TO_ITEM", { item, animation });
    },

    removeAnimationToItem({ commit }, { item, animation }) {
        commit("_REMOVE_ANIMATION_FROM_ITEM", { item, animation });
    },

    loadItems({ commit, state }, items) {
        commit("_LOAD_ITEMS", items);
        commit("_SELECT_SCENE_TO_DISPLAY", state._ITEMS[state._ITEMS.length - 1]);
    }
};

export default {
    namespaced: true,
    state: index,
    getters,
    actions,
    mutations
};