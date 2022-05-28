import { v4 } from "uuid";

export default {
    items: [
        {
            id: v4(),
            name: "Scene name 1",
            type: "group",
            items: [
                { id: v4(), name: "1Spline name 1", type: "item", items: [] },
                { id: v4(), name: "1Spline name 2", type: "item", items: [] },
                { id: v4(), name: "1Spline name 3", type: "item", items: [] }
            ]
        },
        {
            id: v4(),
            name: "Scene name 2",
            type: "group",
            items: [
                { id: v4(), name: "1Spline name 4", type: "item", items: [] },
                { id: v4(), name: "1Spline name 5", type: "item", items: [] },
                { id: v4(), name: "1Spline name 6", type: "item", items: [] }
            ]
        },
        {
            id: v4(),
            name: "Scene name 3",
            type: "group",
            items: [
                { id: v4(), name: "1Spline name 7", type: "item", items: [] },
                { id: v4(), name: "1Spline name 8", type: "item", items: [] },
                { id: v4(), name: "1Spline name 9", type: "item", items: [] }
            ]
        }
    ],
    _selectedItem: null,
    _selectedScene: null
};
