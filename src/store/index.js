import { createStore } from "vuex";
import mutations from "./mutations";
import state from "./state";
import getters from "./getters";

export default createStore({
    state() {
        return state;
    },
    mutations,
    getters
});
