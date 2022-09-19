const index = {
    _LISTENERS: [],
    _CURSOR_GRABBING: false,
    _TIME_CURSOR: 0,
    _LOOP: true,
    _SPEED: 1,
    _PLAY: false,
    _SCALE: 1
};

const getters = {
    listeners(state) {
        return state._LISTENERS;
    },

    cursorGrabbing(state) {
        return state._CURSOR_GRABBING;
    },

    timeCursor(state) {
        return state._TIME_CURSOR;
    },

    loop(state) {
        return state._LOOP;
    },

    speed(state) {
        return state._SPEED;
    },

    play(state) {
        return state._PLAY;
    },

    scale(state) {
        return state._SCALE;
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

    _SET_TIME_CURSOR(state, value) {
        state._TIME_CURSOR = value;
    },

    _SET_LOOP(state, value) {
        state._LOOP = value;
    },

    _SET_SPEED(state, value) {
        state._SPEED = value;
    },

    _SET_PLAY(state, value) {
        state._PLAY = value;
    },

    _SET_SCALE(state, value) {
        state._SCALE = value;
    }
};

const actions = {
    addListener({ commit }, { type, callback, once }) {
        const coveredCallback = once
            ? (e) => { callback(e); commit("_REMOVE_LISTENER", { type, callback: coveredCallback }); }
            : callback;

        commit("_ADD_LISTENER", { type, callback: coveredCallback });
    },

    removeListener({ commit }, { type, callback }) {
        commit("_REMOVE_LISTENER", { type, callback });
    },

    setCursorGrabbing({ commit }, value) {
        commit("_SET_CURSOR_GRABBING", value);
    },

    setTimeCursor({ commit }, value) {
        commit("_SET_TIME_CURSOR", value);
    },

    setLoop({ commit }, value) {
        commit("_SET_LOOP", value);
    },

    setSpeed({ commit }, value) {
        commit("_SET_SPEED", value);
    },

    setPlay({ commit }, value) {
        commit("_SET_PLAY", value);
    },

    setScale({ commit }, value) {
        commit("_SET_SCALE", value);
    }
};

export default {
    namespaced: true,
    state: index,
    getters,
    actions,
    mutations
};