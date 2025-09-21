const index = {
    _LISTENERS: [],
    _CURSOR_GRABBING: false,
    _TIME_CURSOR: 0,
    _LOOP: true,
    _SPEED: 1,
    _PLAY: false,
    _SCALE: 1,
    _USER_CURSOR: 0,
    _SHOW_USER_CURSOR: false,
    _ACTIVE_USER_CURSOR: false,
    _PIXELS_PER_SECOND: 200
};

const getters = {
    listeners(state) {
        return state._LISTENERS;
    },

    pixelsPerSecond(state) {
        return state._PIXELS_PER_SECOND;
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
    },

    userCursor(state) {
        return state._USER_CURSOR;
    },

    showUserCursor(state) {
        return state._SHOW_USER_CURSOR;
    },

    activeUserCursor(state) {
        return state._ACTIVE_USER_CURSOR;
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
    },

    _SET_USER_CURSOR(state, value) {
        state._USER_CURSOR = value;
    },

    _SET_SHOW_USER_CURSOR(state, value) {
        state._SHOW_USER_CURSOR = value;
    },

    _SET_ACTIVE_USER_CURSOR(state, value) {
        state._ACTIVE_USER_CURSOR = value;
    },

    _SET_PIXELS_PER_SECOND(state, value) {
        state._PIXELS_PER_SECOND = value;
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
    },

    setUserCursor({ commit }, value) {
        commit("_SET_USER_CURSOR", value);
    },

    setShowUserCursor({ commit }, value) {
        commit("_SET_SHOW_USER_CURSOR", value);
    },

    setActiveUserCursor({ commit }, value) {
        commit("_SET_ACTIVE_USER_CURSOR", value);
    },

    setPixelsPerSecond({ commit }, value) {
        commit("_SET_PIXELS_PER_SECOND", value);
    }
};

export default {
    namespaced: true,
    state: index,
    getters,
    actions,
    mutations
};