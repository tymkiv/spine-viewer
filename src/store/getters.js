export default {
    selectedScene(state) {
        return (state._selectedScene ||= state.items[0]);
    },

    selectedItem(state) {
        return state._selectedItem;
    }
};
