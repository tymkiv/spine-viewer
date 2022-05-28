import { v4 } from "uuid";
import { LIST_ITEM_TYPE_ITEM, LIST_ITEM_TYPE_SCENE, LIST_ITEM_TO_REDACT, LIST_ITEM_TO_DISPLAY } from "../constants";
export default {
    items: [
        {
            id: v4(),
            name: "Scene name 1",
            type: LIST_ITEM_TYPE_SCENE,
            items: [
                { id: v4(), name: "1Spline name 1", type: LIST_ITEM_TYPE_ITEM, items: [] },
                { id: v4(), name: "1Spline name 2", type: LIST_ITEM_TYPE_ITEM, items: [] },
                { id: v4(), name: "1Spline name 3", type: LIST_ITEM_TYPE_ITEM, items: [] }
            ]
        },
        {
            id: v4(),
            name: "Scene name 2",
            type: LIST_ITEM_TYPE_SCENE,
            items: [
                { id: v4(), name: "1Spline name 4", type: LIST_ITEM_TYPE_ITEM, items: [] },
                { id: v4(), name: "1Spline name 5", type: LIST_ITEM_TYPE_ITEM, items: [] },
                { id: v4(), name: "1Spline name 6", type: LIST_ITEM_TYPE_ITEM, items: [] }
            ]
        },
        {
            id: v4(),
            name: "Scene name 3",
            type: LIST_ITEM_TYPE_SCENE,
            items: [
                { id: v4(), name: "1Spline name 7", type: LIST_ITEM_TYPE_ITEM, items: [] },
                { id: v4(), name: "1Spline name 8", type: LIST_ITEM_TYPE_ITEM, items: [] },
                { id: v4(), name: "1Spline name 9", type: LIST_ITEM_TYPE_ITEM, items: [] }
            ]
        }
    ],

    _selectedItem: {
        [LIST_ITEM_TO_REDACT]: null,
        [LIST_ITEM_TO_DISPLAY]: null
    },

    appClickListeners: []
};
