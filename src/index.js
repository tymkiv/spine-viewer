globalThis.__VUE_OPTIONS_API__ = true;
globalThis.__VUE_PROD_DEVTOOLS__ = false;

import { createApp } from "vue";
import App from "./components/App";

const app = createApp(App);
app.mount("#app");
