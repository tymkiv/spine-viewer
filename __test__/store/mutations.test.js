import mutations from "../../src/store/mutations";

describe("removeItemByIndexes", () => {
    test.each([
        {
            indexes: [0],
            items: [{ a: "a" }],
            newItems: []
        },
        {
            indexes: [0],
            items: [{ a: "a" }, { a: "b" }],
            newItems: [{ a: "b" }]
        },
        {
            indexes: [1],
            items: [{ a: "a" }, { a: "b" }],
            newItems: [{ a: "a" }]
        },
        {
            indexes: [1],
            items: [{ a: "a" }, { a: "b" }, { a: "c" }],
            newItems: [{ a: "a" }, { a: "c" }]
        },
        {
            indexes: [0, 0],
            items: [{ a: "a", items: [{ a: "b" }] }],
            newItems: [{ a: "a", items: [] }]
        },
        {
            indexes: [0, 1],
            items: [{ a: "a", items: [{ a: "d" }, { a: "b" }] }],
            newItems: [{ a: "a", items: [{ a: "d" }] }]
        },
        {
            indexes: [0, 0],
            items: [{ a: "a", items: [{ a: "b" }] }, { a: "c" }],
            newItems: [{ a: "a", items: [] }, { a: "c" }]
        },
        {
            indexes: [0, 1, 1],
            items: [
                { a: "a", items: [{ a: "b" }, { a: "c", items: [{ a: "d" }, { a: "e" }, { a: "f" }] }, { a: "g" }] },
                { a: "h" }
            ],
            newItems: [{ a: "a", items: [{ a: "b" }, { a: "c", items: [{ a: "d" }, { a: "f" }] }, { a: "g" }] }, { a: "h" }]
        }
    ])("%j", ({ indexes, items, newItems }) => {
        mutations.removeItemByIndexes({ items }, { indexes });
        expect(items).toEqual(newItems);
    });
});

describe("removeItem", () => {
    const item = {
        a: "remove"
    };
    test.each([
        { item, items: [item], newItems: [], removedItem: item },
        { item, items: [{ a: "a" }, item], newItems: [{ a: "a" }], removedItem: item },
        { item, items: [item, { a: "a" }], newItems: [{ a: "a" }], removedItem: item },
        { item, items: [{ a: "a", items: [item] }], newItems: [{ a: "a", items: [] }], removedItem: item },
        { item, items: [{ a: "a", items: [{ a: "b" }, item] }], newItems: [{ a: "a", items: [{ a: "b" }] }], removedItem: item },
        { item, items: [{ a: "a", items: [item, { a: "b" }] }], newItems: [{ a: "a", items: [{ a: "b" }] }], removedItem: item },
        {
            item,
            items: [{ a: "a", items: [{ a: "b" }, item, { a: "c" }] }],
            newItems: [{ a: "a", items: [{ a: "b" }, { a: "c" }] }],
            removedItem: item
        },
        {
            item,
            items: [{ a: "a", items: [{ a: "b", items: [item] }] }],
            newItems: [{ a: "a", items: [{ a: "b", items: [] }] }],
            removedItem: item
        },
        {
            item,
            items: [{ a: "a", items: [{ a: "b", items: [item, { a: "c" }] }] }],
            newItems: [{ a: "a", items: [{ a: "b", items: [{ a: "c" }] }] }],
            removedItem: item
        },
        {
            item,
            items: [{ a: "a", items: [{ a: "b", items: [{ a: "c" }, item, { a: "d" }] }] }],
            newItems: [{ a: "a", items: [{ a: "b", items: [{ a: "c" }, { a: "d" }] }] }],
            removedItem: item
        }
    ])("%j", ({ item, items, newItems }) => {
        mutations.removeItem({ items }, { item });
        expect(items).toEqual(newItems);
    });
});

describe("insert", () => {
    const item = {
        a: "insert"
    };
    test.each([
        {
            items: [],
            itemsToInsert: [item],
            indexes: [0],
            newItems: [item]
        },
        {
            items: [{ a: "a" }],
            itemsToInsert: [item],
            indexes: [0, 0],
            newItems: [{ a: "a", items: [item] }]
        },
        {
            items: [{ a: "a" }, { a: "b" }],
            itemsToInsert: [item],
            indexes: [0, 0],
            newItems: [{ a: "a", items: [item] }, { a: "b" }]
        },
        {
            items: [{ a: "a" }, { a: "b", items: [{ a: "c" }] }],
            itemsToInsert: [item],
            indexes: [1, 0, 0],
            newItems: [{ a: "a" }, { a: "b", items: [{ a: "c", items: [item] }] }]
        }
    ])("%j", ({ items, itemsToInsert, indexes, newItems }) => {
        mutations.insert({ items }, { itemsToInsert, indexes });
        expect(items).toEqual(newItems);
    });
});
