<template>
    <div
        ref="wrapper"
        class="layers-list__wrapper"
    >
        <nested-transition-group
            class="layers-list"
            :items="items"
            :nested-level="0"
            :animation-level="animationLevel"
            :dragstart="dragstart"
            :dragover="dragover"
            :dragleave="dragleave"
            :dragend="dragend"
            :on-btn-remove-click="onBtnRemoveClick"
            :drag-target="dragTarget"
            :drop-target="dropTarget"
            :drop-target-place="dropTargetPlace"
            @dragover.stop.prevent="dragover({type: 'list'}, $event)"
            @dragleave.stop="dragleave($event)"
        />
    </div>
</template>

<script>
import { v4 } from "uuid";
import gsap from "gsap";

import NestedTransitionGroup from "./components/NestedTransitionGroup";
import { includes, findIndexes } from "../../../../../../utils";

export default {
    components: { NestedTransitionGroup },

    data() {
        return {
            dragTarget: null,
            dropTarget: null,
            dropTargetPlace: null,
            animationLevel: Infinity,
            delayedCall: null
        };
    },

    computed: {
        items() {
            return this.$store.getters["layers/items"];
        }
    },

    methods: {
        dragstart(item, nestedLevel) {
            this.dragTarget = item;
            this.animationLevel = nestedLevel;
        },

        dragend() {
            this.dragTargetDropTarget(this.dragTarget, this.dropTarget, this.dropTargetPlace);

            this.dragTarget = null;
            this.dropTarget = null;
            this.dropTargetPlace = null;

            this.delayedCall?.kill();
            this.delayedCall = gsap.delayedCall(0.3, () => this.animationLevel = Infinity);
        },

        dragover(dropTarget, e) {
            if (!dropTarget?.type || !this.dragTarget?.type) return;

            this.dropTarget = dropTarget;

            // Переводим попытки вставить scene в item
            if (this.dragTarget.type === "scene" && this.dropTarget.type === "item") {
                const indexes = findIndexes(this.items, this.dropTarget);
                this.dropTarget = this.items[indexes[0]];
            }

            // Попытка вставить себя в себя
            if (this.dragTarget === this.dropTarget) {
                this.dropTarget = null;
                return;
            }

            // Перевести попытки вставить родительский item в дочерний
            if (
                this.dragTarget.type === "item" &&
                this.dropTarget.type === "item" &&
                this.dragTarget.items &&
                includes(this.dragTarget.items, this.dropTarget)
            ) {
                this.dropTarget = null;
                return;
            }

            let domElement;

            if (this.dropTarget.type === "item") {
                domElement = e.target.closest(".list-item_item");
            }

            if (this.dropTarget.type === "scene") {
                domElement = e.target.closest(".list-item_scene");
            }

            if (this.dropTarget.type === "list") {
                const mouseY = e.clientY;
                const domScenes = [...e.target.querySelectorAll(".list-item_scene")];
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

        dragleave(event) {
            const { top, left, right, bottom } = this.$refs.wrapper.getBoundingClientRect();
            if (
                event.clientX < left ||
                event.clientX > right ||
                event.clientY > bottom ||
                event.clientY < top
            ) {
                this.dropTarget = null;
                this.dropTargetPlace = null;
            }

        },

        dragTargetDropTarget(dragTarget, dropTarget, dropTargetPlace) {
            if (!dragTarget || !dropTarget || !dropTargetPlace || dragTarget === dropTarget) {
                return;
            }
            const dragIndexes = findIndexes(this.items, dragTarget);

            const scene = this.items[dragIndexes[0]];

            this.$store.dispatch("layers/removeItemByIndexes", dragIndexes);
            // this.$store.commit("removeItemByIndexes", { indexes: dragIndexes });

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
            if (isOnlyItemsNeeded) {
                const items = dragTarget.items;
                dragTarget.items = [];
                dragTarget = items;
            }

            // dragTarget должен быть массивом
            dragTarget = Array.isArray(dragTarget) ? dragTarget : [dragTarget];

            this.$store.dispatch("layers/insert", { items: dragTarget, indexes: dropIndexes });
            // this.$store.commit("insert", { itemsToInsert: dragTarget, indexes: dropIndexes });

            // Удаление пустой группы
            this.tryToRemoveEmptyScene(scene);
        },

        onBtnRemoveClick(item) {
            const indexes = findIndexes(this.items, item);

            const nestedItems = item.items;
            const scene = this.items[indexes[0]];
            this.$store.dispatch("layers/removeItemByIndexes", indexes);
            // this.$store.commit("removeItemByIndexes", { indexes: indexes });
            if (nestedItems) {
                this.$store.dispatch("layers/insert", { items: nestedItems, indexes });
            }

            // this.$store.commit("insert", { itemsToInsert: nestedItems, indexes: indexes });

            if (this.$store.getters["layers/itemToRedact"] === item) {
            // if (this.$store.getters.selectedItem[LIST_ITEM_TO_REDACT] === item) {
                this.$store.dispatch("layers/unselectItemToRedact");
            //     this.$store.commit("unselectToRedact");
            }

            // Удаление пустой группы
            this.tryToRemoveEmptyScene(scene);
        },

        tryToRemoveEmptyScene(scene) {
            // Удаление пустой группы
            if (scene?.items.length === 0) {
                this.$store.dispatch("layers/removeItem", scene);
                // this.$store.commit("removeItem", { item: scene });
                if (this.$store.getters["layers/sceneToDisplay"] === scene) {
                // if (this.$store.getters.selectedItem[LIST_ITEM_TO_DISPLAY] === scene) {
                    this.$store.dispatch("layers/unselectSceneToDisplay");
                //     this.$store.commit("unselectToDisplay");
                }
                if (this.$store.getters["layers/itemToRedact"] === scene) {
                // if (this.$store.getters.selectedItem[LIST_ITEM_TO_REDACT] === scene) {
                    this.$store.dispatch("layers/unselectItemToRedact");
                    // this.$store.commit("unselectToRedact");
                }
            }
        },

        isNewSceneNeeded(dragTarget, dropTarget, dropTargetPlace) {
            return (
                dragTarget.type === "item" &&
                dropTarget.type === "scene" &&
                (dropTargetPlace === "top" || dropTargetPlace === "bottom")
            );
        },

        isOnlyItemsNeeded(dragTarget, dropTargetPlace) {
            return dragTarget.type === "scene" && dropTargetPlace === "self";
        },

        createNewScene(items) {
            return {
                id: v4(),
                name: "Scene name 11111",
                type: "scene",
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
    &__wrapper
        height: 100%

</style>