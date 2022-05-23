<template>
    <nested-transition-group
        :nested-level="0"
        :dragend="dragend"
        :dragleave="dragleave"
        :dragover="dragover"
        :dragstart="dragstart"
        :items="items"
        :drag-target="dragTarget"
        :drop-target="dropTarget"
        :drop-target-place="dropTargetPlace"
    />
</template>

<script>
import NestedTransitionGroup from "../NestedTransitionGroup";
import { v4 } from "uuid";

export default {
    components: { NestedTransitionGroup },
    props: {
        items: {
            type: Array,
            required: true,
            default: () => []
        }
    },
    emits: ["update:items"],
    data() {
        return {
            dragTarget: null,
            dropTarget: null,
            dropTargetPlace: null
        };
    },
    computed: {
        sortedItems() {
            if (!this.dragTarget || !this.dropTarget || !this.dropTargetPlace || this.dragTarget === this.dropTarget) {
                return this.items;
            }

            return this.dragTargetDropTarget(this.dragTarget, this.dropTarget);
        }
    },
    watch: {},

    methods: {
        dragstart(item) {
            this.dragTarget = item;
        },
        dragend() {
            this.$emit("update:items", this.sortedItems);
            this.dragTarget = null;
            this.dropTarget = null;
            this.dropTargetPlace = null;
        },
        dragover(item, e) {
            // Переводим попытки вставить группу в итем
            if (this.dragTarget.type === "group" && item.type === "item") {
                const indexes = this.findIndexRecursive(item, this.items);
                item = this.items[indexes[0]];
            }

            // Попытка вставить себя в себя
            if (this.dragTarget === item) {
                return;
            }

            // Перевести попытки вставить родительский итем в дочерний
            if (this.dragTarget.type === "item" && item.type === "item") {
                if (this.containsRecursive(item, this.dragTarget.items)) {
                    return;
                }
            }

            this.dropTarget = item;

            if (this.dropTarget.type === "item") {
                const target = e.target.closest(".list-item_item");
                const { top, bottom } = target.getBoundingClientRect();
                const height = bottom - top;

                const y = e.clientY - top;

                const borderTop = {
                    start: 0,
                    end: 10
                };
                const borderBottom = {
                    start: height - 10,
                    end: height
                };

                if (y <= borderTop.end) {
                    this.dropTargetPlace = "top";
                } else if (y >= borderBottom.start && y <= borderBottom.end) {
                    this.dropTargetPlace = "bottom";
                } else {
                    // } else if (y > borderTop.end && y < borderBottom.start) {
                    this.dropTargetPlace = "self";
                }
            }

            if (this.dropTarget.type === "group") {
                const target = e.target.closest(".list-item_group");
                const { top, bottom } = target.getBoundingClientRect();
                const height = bottom - top;
                const y = e.clientY - top;

                const borderTop = 20;
                const borderBottom = height - 20;

                this.dropTargetPlace = y < borderTop ? "top" : y > borderBottom ? "bottom" : "self";
            }

            console.log(this.dropTarget.name, this.dropTargetPlace);
        },
        dragleave() {
            this.dropTarget = null;
            this.dropTargetPlace = null;
        },

        containsRecursive(target, items) {
            if (!items) return;

            for (let i = 0; i < items.length; i++) {
                const nestedItem = items[i];
                if (target.id === nestedItem.id) return true;

                if (Array.isArray(nestedItem.items)) {
                    const result = this.containsRecursive(target, nestedItem.items);

                    if (result) return result;
                }
            }

            return false;
        },

        // isTargetLast(target, items) {
        //     for (let i = 0; i < items.length; i++) {
        //         const nestedItem = items[i];
        //
        //         if (target.id === nestedItem.id && i === items.length - 1) return true;
        //
        //         if (Array.isArray(nestedItem.items)) {
        //             const result = this.isTargetLast(target, nestedItem.items);
        //
        //             if (result) return result;
        //         }
        //     }
        //
        //     return false;
        // },

        // findParent(target, items, parent) {
        //     for (let i = 0; i < items.length; i++) {
        //         const nestedItem = items[i];
        //
        //         if (target.id === nestedItem.id) return parent;
        //
        //         if (Array.isArray(nestedItem.items)) {
        //             const res = this.findParent(target, nestedItem.items, nestedItem);
        //
        //             if (res) return res;
        //         }
        //     }
        //
        //     return null;
        // },

        findIndexRecursive(target, items) {
            for (let i = 0; i < items.length; i++) {
                const nestedItem = items[i];

                if (target.id === nestedItem.id) return [i];

                if (Array.isArray(nestedItem.items)) {
                    const idx = this.findIndexRecursive(target, nestedItem.items);

                    if (idx) return [i, ...idx];
                }
            }

            return null;
        },

        cloneItems(items) {
            const clonedItems = [...items];

            for (let i = 0; i < clonedItems.length; i++) {
                clonedItems[i] = {
                    ...clonedItems[i]
                };
                if (Array.isArray(clonedItems[i].items)) {
                    clonedItems[i].items = this.cloneItems(clonedItems[i].items);
                }
            }

            return clonedItems;
        },

        removeFrom(items, indexes) {
            for (let i = 0; i < indexes.length - 1; i++) {
                items = items[indexes[i]].items;
            }
            items.splice(indexes[indexes.length - 1], 1);
        },

        insertTo(items, indexes, ...target) {
            // console.log(indexes);
            for (let i = 0; i < indexes.length - 1; i++) {
                // console.log(indexes[i]);
                // console.log(items[indexes[i]]);
                items = items[indexes[i]].items ?? (items[indexes[i]].items = []);
                // console.log(items);
            }
            if (Array.isArray(target)) {
                items.splice(indexes[indexes.length - 1], 0, ...target);
            } else {
                items.splice(indexes[indexes.length - 1], 0, target);
            }
        },

        dragTargetDropTarget(dragTarget, dropTarget) {
            const sortedItems = this.cloneItems(this.items);

            const dragIndexes = this.findIndexRecursive(dragTarget, sortedItems);

            this.removeFrom(sortedItems, dragIndexes);

            const dropIndexes = this.findIndexRecursive(dropTarget, sortedItems);

            if (this.dropTargetPlace === "bottom") {
                dropIndexes[dropIndexes.length - 1] += 1;
            }

            if (
                dragTarget.type === "item" &&
                dropTarget.type === "group" &&
                (this.dropTargetPlace === "top" || this.dropTargetPlace === "bottom")
            ) {
                dragTarget = {
                    id: v4(),
                    name: "Scene name 11111",
                    type: "group",
                    items: [dragTarget]
                };
            }

            if (dragTarget.type === "group" && this.dropTargetPlace === "self") {
                dragTarget = dragTarget.items;
                // console.log(dragTarget);
            }

            if (this.dropTargetPlace === "self") {
                dropIndexes.push(0);
            }

            if (Array.isArray(dragTarget)) {
                this.insertTo(sortedItems, dropIndexes, ...dragTarget);
            } else {
                this.insertTo(sortedItems, dropIndexes, dragTarget);
            }

            // Удаление пустой группы
            if (sortedItems[dragIndexes[0]]?.items.length === 0) {
                sortedItems.splice(dragIndexes[0], 1);
            }

            return sortedItems;
        }
    }
};
</script>

<style>
.list-item {
    transition: all 0.3s ease;
    position: relative;
    padding: 0 20px;
    outline: 1px solid red;
    /*overflow: hidden;*/
}

.list-item input {
    display: block;
    height: 40px;
    margin: 0;
    padding: 0;
    border: none;
    background-color: transparent;
}

.list-item input:focus {
    outline: none;
}

.list-item.list-item_parent {
    padding-bottom: 10px;
    /*box-sizing: border-box;*/
}

.list-item:not(.list-item_parent) {
    height: 40px;
    /*display: flex;*/
    /*flex-direction: column;*/
    /*justify-content: center;*/
}

.list-item_drop-target {
    z-index: 50;
}

.list-item_drop-target_top:after,
.list-item_drop-target_bottom:after,
.list-item_drop-target_self:after {
    content: "";
    position: absolute;
    top: -1px;
    left: 20px;
    right: 20px;
    height: 2px;

    background-color: #000;
    pointer-events: none;
}

.list-item_drop-target_bottom:after {
    top: auto;
    bottom: -1px;
}

.list-item_drop-target_self:after {
    top: 50%;
    margin-top: -1px;
}
.list-item.list-item_parent.list-item_drop-target_self:after {
    left: 40px;
    right: 40px;
    top: 40px;
}

.list-enter-from,
.list-leave-to {
    opacity: 0;
    height: 0 !important;
}
</style>

<style scoped>
.wrapper {
    background-image: url("../../resources/pattern.jpg");
}
</style>
