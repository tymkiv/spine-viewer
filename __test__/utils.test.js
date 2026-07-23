import { includes, findIndexes, flat, isFileDrag } from "../src/utils";

describe("isFileDrag", () => {
    test.each([
        // drag файлов из OS
        { types: ["Files"], result: true },
        { types: ["text/uri-list", "Files"], result: true },
        // внутренний drag без setData (Chrome < 150)
        { types: [], result: false },
        // внутренний drag без setData (Chrome 150+ добавляет служебный тип)
        { types: ["chromium/x-drag-id"], result: false },
        // drag текста/ссылок
        { types: ["text/plain"], result: false }
    ])("%j", ({ types, result }) => {
        expect(isFileDrag({ dataTransfer: { types } })).toBe(result);
    });
});

describe("findIndexes", () => {
    const item = { a: "find" };
    test.each([
        { item, items: [item], indexes: [0] },
        { item, items: [{ a: "a" }, item], indexes: [1] },
        { item, items: [{ a: "a" }, item, { a: "b" }], indexes: [1] },
        { item, items: [{ a: "a" }, { a: "b" }, item], indexes: [2] },
        { item, items: [{ a: "a", items: [item] }, { a: "b" }], indexes: [0, 0] },
        { item, items: [{ a: "a", items: [{ a: "c" }, item] }, { a: "b" }], indexes: [0, 1] },
        { item, items: [{ a: "a", items: [{ a: "c" }, { a: "d", items: [item] }] }, { a: "b" }], indexes: [0, 1, 0] },
        { item, items: [{ a: "a", items: [{ a: "c" }, { a: "d", items: [] }] }, { a: "b" }], indexes: null }
    ])("%j", ({ item, items, indexes }) => {
        const result = findIndexes(items, item);
        expect(result).toEqual(indexes);
    });
});

describe("includes", () => {
    const item = { a: "include" };
    test.each([
        { item, items: [item], result: true },
        { item, items: [], result: false },
        { item, items: [{ a: "a" }], result: false },
        { item, items: [{ a: "a" }, item], result: true },
        { item, items: [{ a: "a", items: [item] }], result: true },
        { item, items: [{ a: "a", items: [{ a: "b" }] }], result: false },
        { item, items: [{ a: "a", items: [{ a: "b", items: [item] }] }], result: true },
        { item, items: [{ a: "a", items: [{ a: "b", items: [{ a: "c" }, item] }] }], result: true }
    ])("%j", ({ item, items, result }) => {
        expect(includes(items, item)).toBe(result);
    });
});

describe("flat", () => {
    test.each([
        { items: [{ a: "a" }], expected: [{ a: "a", items: [] }] },
        { items: [{ a: "a" }, { a: "b" }], expected: [{ a: "a", items: [] }, { a: "b", items: [] }] },
        { items: [{ a: "a", items: [{ a: "b" }] }], expected: [{ a: "a", items: [] }, { a: "b", items: [] }] },
        {
            items: [{ a: "a", items: [{ a: "b" }] }, { a: "c" }],
            expected: [{ a: "a", items: [] }, { a: "b", items: [] }, { a: "c", items: [] }]
        },
        {
            items: [{ a: "a", items: [{ a: "b", items: [{ a: "aa" }] }] }, { a: "c" }],
            expected: [{ a: "a", items: [] }, { a: "b", items: [] }, { a: "aa", items: [] }, { a: "c", items: [] }]
        }
    ])("%j", ({ items, expected }) => {
        expect(flat(items)).toEqual(expected);
    });
});
