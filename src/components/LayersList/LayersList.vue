<template>
    <nested-transition-group
        class="layers-list"
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
        @dragover.stop.prevent="dragover({type: LIST_ITEM_TYPE_LIST}, $event)"
        @dragleave.stop="dragleave()"
    />
</template>

<script>
import { v4 } from "uuid";

import NestedTransitionGroup from "../NestedTransitionGroup";
import { includes, findIndexes } from "../../utils";
import {
    LIST_ITEM_TYPE_LIST,
    LIST_ITEM_TYPE_SCENE,
    LIST_ITEM_TO_REDACT,
    LIST_ITEM_TYPE_ITEM,
    LIST_ITEM_TO_DISPLAY
} from "../../constants";

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
        },

        LIST_ITEM_TYPE_LIST() {
            return LIST_ITEM_TYPE_LIST;
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

            // Переводим попытки вставить scene в item
            if (this.dragTarget.type === LIST_ITEM_TYPE_SCENE && this.dropTarget.type === LIST_ITEM_TYPE_ITEM) {
                const indexes = findIndexes(this.items, this.dropTarget);
                this.dropTarget = this.items[indexes[0]];
            }

            // Попытка вставить себя в себя
            if (this.dragTarget === this.dropTarget) {
                return;
            }

            // Перевести попытки вставить родительский item в дочерний
            if (
                this.dragTarget.type === LIST_ITEM_TYPE_ITEM &&
                this.dropTarget.type === LIST_ITEM_TYPE_ITEM &&
                includes(this.dragTarget.items, this.dropTarget)
            ) {
                return;
            }

            let domElement;

            if (this.dropTarget.type === LIST_ITEM_TYPE_ITEM) {
                domElement = e.target.closest(`.list-item_${LIST_ITEM_TYPE_ITEM}`);
            }

            if (this.dropTarget.type === LIST_ITEM_TYPE_SCENE) {
                domElement = e.target.closest(`.list-item_${LIST_ITEM_TYPE_SCENE}`);
            }

            if (this.dropTarget.type === LIST_ITEM_TYPE_LIST) {
                const mouseY = e.clientY;
                const domScenes = [...e.target.querySelectorAll(`.list-item_${LIST_ITEM_TYPE_SCENE}`)];
                domScenes.forEach((domScene, index) => {
                    const top = domScene.getBoundingClientRect().top;
                    if (mouseY >= top) {
                        domElement = domScene;
                        this.dropTarget = this.items[index];
                    }
                });
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

            if (this.$store.getters.selectedItem[LIST_ITEM_TO_REDACT] === item) {
                this.$store.commit("unselectToRedact");
            }

            // Удаление пустой группы
            this.tryToRemoveEmptyScene(indexes[0]);
        },

        tryToRemoveEmptyScene(index) {
            // Удаление пустой группы
            const itemToRemove = this.items[index];

            if (itemToRemove?.items.length === 0) {
                this.$store.commit("removeItem", { item: itemToRemove });
                if (this.$store.getters.selectedItem[LIST_ITEM_TO_DISPLAY] === itemToRemove) {
                    this.$store.commit("unselectToDisplay");
                }
                if (this.$store.getters.selectedItem[LIST_ITEM_TO_REDACT] === itemToRemove) {
                    this.$store.commit("unselectToRedact");
                }
            }
        },

        isNewSceneNeeded(dragTarget, dropTarget, dropTargetPlace) {
            return (
                dragTarget.type === LIST_ITEM_TYPE_ITEM &&
                dropTarget.type === LIST_ITEM_TYPE_SCENE &&
                (dropTargetPlace === "top" || dropTargetPlace === "bottom")
            );
        },

        isOnlyItemsNeeded(dragTarget, dropTargetPlace) {
            return dragTarget.type === LIST_ITEM_TYPE_SCENE && dropTargetPlace === "self";
        },

        createNewScene(items) {
            return {
                id: v4(),
                name: "Scene name 11111",
                type: LIST_ITEM_TYPE_SCENE,
                items
            };
        }
    }
};
</script>

<style scoped lang="sass">
.layers-list
    min-height: 100%
    background-color: #EAEAEB

</style>