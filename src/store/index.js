// import { createStore } from "vuex";
// import mutations from "./mutations";
// import state from "./state";
// import getters from "./getters";
//
// export default createStore({
//     modules: {
//         layers: {
//             state() {
//                 return state;
//             },
//             mutations,
//             getters
//         }
//     }
// });


import { createStore } from "vuex";
import app from "./modules/app";
import layers from "./modules/layers";
import resources from "./modules/resources";

export default createStore({
    // strict: true,
    modules: {
        app,
        layers,
        resources
    }
});