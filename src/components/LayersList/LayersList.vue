<template>
    <nested-transition-group
        :items="items"
        :nested-level="0"
        :dragstart="dragstart"
        :dragover="dragover"
        :dragleave="dragleave"
        :dragend="dragend"
        :on-btn-remove-click="onBtnRemoveClick"
        :drag-target="dragTarget"
        :drop-target="dropTarget"
        :drop-target-place="dropTargetPlace"
    />
</template>

<script>
import { v4 } from "uuid";

import NestedTransitionGroup from "../NestedTransitionGroup";
import { includes, findIndexes } from "../../utils";

export default {
    components: { NestedTransitionGroup },

    data() {
        return {
            dragTarget: null,
            dropTarget: null,
            dropTargetPlace: null
        };
    },

    computed: {
        items() {
            return this.$store.state.items;
        }
    },

    methods: {
        dragstart(item) {
            this.dragTarget = item;
        },

        dragend() {
            this.dragTargetDropTarget(this.dragTarget, this.dropTarget, this.dropTargetPlace);

            this.dragTarget = null;
            this.dropTarget = null;
            this.dropTargetPlace = null;
        },

        dragover(dropTarget, e) {
            this.dropTarget = dropTarget;

            // Переводим попытки вставить группу в итем
            if (this.dragTarget.type === "group" && this.dropTarget.type === "item") {
                const indexes = findIndexes(this.items, this.dropTarget);
                this.dropTarget = this.items[indexes[0]];
            }

            // Попытка вставить себя в себя
            if (this.dragTarget === this.dropTarget) {
                return;
            }

            // Перевести попытки вставить родительский итем в дочерний
            if (this.dragTarget.type === "item" && this.dropTarget.type === "item") {
                if (includes(this.dragTarget.items, this.dropTarget)) {
                    return;
                }
            }

            let domElement;

            if (this.dropTarget.type === "item") {
                domElement = e.target.closest(".list-item_item");
            }

            if (this.dropTarget.type === "group") {
                domElement = e.target.closest(".list-item_group");
            }

            const { top, bottom } = domElement.getBoundingClientRect();

            const y = e.clientY - top;
            const height = bottom - top;
            const borderTop = 10;
            const borderBottom = height - 10;

            this.dropTargetPlace = y <= borderTop ? "top" : y >= borderBottom ? "bottom" : "self";
        },

        dragleave() {
            this.dropTarget = null;
            this.dropTargetPlace = null;
        },

        dragTargetDropTarget(dragTarget, dropTarget, dropTargetPlace) {
            if (!dragTarget || !dropTarget || !dropTargetPlace || dragTarget === dropTarget) {
                return;
            }
            const dragIndexes = findIndexes(this.items, dragTarget);

            this.$store.commit("removeItemByIndexes", { indexes: dragIndexes });

            const dropIndexes = findIndexes(this.items, dropTarget);

            if (dropTargetPlace === "bottom") {
                dropIndexes[dropIndexes.length - 1] += 1;
            }

            if (dropTargetPlace === "self") {
                dropIndexes.push(0);
            }

            // Создать новую сцену, если item должен быть вставлен на самый первый уровень
            const isNewSceneNeeded = this.isNewSceneNeeded(dragTarget, dropTarget, dropTargetPlace);
            dragTarget = isNewSceneNeeded ? this.createNewScene([dragTarget]) : dragTarget;

            // Перехватить только items, если scene пытается быть вставленной в другую scene
            const isOnlyItemsNeeded = this.isOnlyItemsNeeded(dragTarget, dropTargetPlace);
            dragTarget = isOnlyItemsNeeded ? dragTarget.items : dragTarget;

            // dragTarget должен быть массивом
            dragTarget = Array.isArray(dragTarget) ? dragTarget : [dragTarget];

            this.$store.commit("insert", { itemsToInsert: dragTarget, indexes: dropIndexes });

            // Удаление пустой группы
            this.tryToRemoveEmptyScene(dragIndexes[0]);
        },

        onBtnRemoveClick(item) {
            const indexes = findIndexes(this.items, item);

            const nestedItems = item.items;

            this.$store.commit("removeItemByIndexes", { indexes: indexes });
            this.$store.commit("insert", { itemsToInsert: nestedItems, indexes: indexes });

            if (this.$store.getters.selectedItem === item) {
                this.$store.commit("unselectItem");
            }

            // Удаление пустой группы
            this.tryToRemoveEmptyScene(indexes[0]);
        },

        tryToRemoveEmptyScene(index) {
            // Удаление пустой группы
            if (this.items[index]?.items.length === 0) {
                if (this.$store.getters.selectedScene === this.items[index]) {
                    this.$store.commit("unselectScene");
                }
                if (this.$store.getters.selectedItem === this.items[index]) {
                    this.$store.commit("unselectItem");
                }
                this.$store.commit("removeItemByIndexes", { indexes: [index] });
            }
        },

        isNewSceneNeeded(dragTarget, dropTarget, dropTargetPlace) {
            return (
                dragTarget.type === "item" &&
                dropTarget.type === "group" &&
                (dropTargetPlace === "top" || dropTargetPlace === "bottom")
            );
        },

        isOnlyItemsNeeded(dragTarget, dropTargetPlace) {
            return dragTarget.type === "group" && dropTargetPlace === "self";
        },

        createNewScene(items) {
            return {
                id: v4(),
                name: "Scene name 11111",
                type: "group",
                items
            };
        }
    }
};
</script>
