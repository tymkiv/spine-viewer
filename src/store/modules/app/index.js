const index = {
    _LISTENERS: [],
    _CURSOR_GRABBING: false
};

const getters = {
    listeners(state) {
        return state._LISTENERS;
    },

    cursorGrabbing(state) {
        return state._CURSOR_GRABBING;
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
    }
};

export default {
    namespaced: true,
    state: index,
    getters,
    actions,
    mutations
};