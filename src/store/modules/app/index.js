const index = {
    _LISTENERS: [],
    _CURSOR_GRABBING: false,
    _BOOT_OVER: false
};

const getters = {
    listeners(state) {
        return state._LISTENERS;
    },

    cursorGrabbing(state) {
        return state._CURSOR_GRABBING;
    },

    bootOver(state) {
        return state._BOOT_OVER;
    }
};

const mutations = {
    _ADD_LISTENER(state, { type, callback }) {
        state._LISTENERS[type] ||= [];
        state._LISTENERS[type].push(callback);
    },

    _REMOVE_LISTENER(state, { type, callback }) {
        state._LISTENERS[type] ||= [];
        state._LISTENERS[type] = state._LISTENERS[type].filter((cb) => cb !== callback);
    },

    _SET_CURSOR_GRABBING(state, value) {
        state._CURSOR_GRABBING = value;
    },

    _SET_BOOT_OVER(state, value) {
        state._BOOT_OVER = value;
    }
};

const actions = {
    addListener({ commit }, { type, callback, once }) {
        const coveredCallback = once
            ? () => { callback(); commit("_REMOVE_LISTENER", { type, callback: coveredCallback }); }
            : callback;

        commit("_ADD_LISTENER", { type, callback: coveredCallback });
    },

    removeListener({ commit }, { type, callback }) {
        commit("_REMOVE_LISTENER", { type, callback });
    },

    setCursorGrabbing({ commit }, value) {
        commit("_SET_CURSOR_GRABBING", value);
    },

    setBootOver({ commit }, value) {
        commit("_SET_BOOT_OVER", value);
    }
};

export default {
    namespaced: true,
    state: index,
    getters,
    actions,
    mutations
};