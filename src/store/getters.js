import { LIST_ITEM_TO_REDACT, LIST_ITEM_TO_DISPLAY } from "../constants";
export default {
    selectedItem(state) {
        return {
            [LIST_ITEM_TO_DISPLAY]: state._selectedItem[LIST_ITEM_TO_DISPLAY] ||= state.items[0],
            [LIST_ITEM_TO_REDACT]: state._selectedItem[LIST_ITEM_TO_REDACT]
        };
    }
};
