<template>
    <transition-group
        tag="ul"
        name="list"
        class="list"
    >
        <li
            v-for="item in items"
            :key="item.id"
            class="list-item"
            :class="{
                'list-item_drag-target': dragTarget === item,
                'list-item_drop-target': dropTarget === item,
                'list-item_drop-target_top': dropTarget === item && dropTargetPlace === 'top',
                'list-item_drop-target_bottom': dropTarget === item && dropTargetPlace === 'bottom',
            }"

            draggable="true"
            @dragstart.stop="dragstart(item)"
            @dragover.stop.prevent="dragover(item, $event)"
            @dragleave.stop="dragleave()"
            @dragend.stop=" dragend()"
        >
            <label class="label">
                <input
                    class="checkbox"
                    type="checkbox"
                    :checked="$store.getters['resources/checkedItems'].includes(item)"
                    @change="pickedChange($event.target.checked, item)"
                >
                <span class="fake-checkbox" />
                <span class="name"> {{ item.name }} </span>
                <btn-remove />
            </label>
        </li>
    </transition-group>
</template>

<script>
import BtnRemove from "../../../../../BtnRemove";
// import gsap from "gsap";
import { findIndexes } from "../../../../../../utils";
export default {
    components: { BtnRemove },
    data() {
        return {
            dragTarget: null,
            dropTarget: null,
            dropTargetPlace: null
        };
    },
    computed: {
        items() {
            return this.$store.getters["resources/items"];
        }
    },
    methods: {
        pickedChange(checked, item) {
            this.$store.dispatch("resources/changeChecked", { checked, item });
            // if (checked) {
            //     this.$store.dispatch("resources/changeChecked", { checked, item });
            //     // this.$store.commit("resourcesAddPicked", { item });
            // } else {
            //     this.$store.commit("resourcesRemovePicked", { item });
            // }

        },

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

            // Попытка вставить себя в себя
            if (this.dragTarget === this.dropTarget) {
                return;
            }

            let domElement;

            if (this.dropTarget.type === "list") {
                const mouseY = e.clientY;
                const domScenes = [...e.target.querySelectorAll(".list-item")];
                domScenes.forEach((domScene, index) => {
                    const top = domScene.getBoundingClientRect().top;
                    if (mouseY >= top) {
                        domElement = domScene;
                        this.dropTarget = this.items[index];
                    }
                });
            } else {
                domElement = e.target.closest(".list-item");
            }

            const { top } = domElement.getBoundingClientRect();

            const y = e.clientY - top;
            const borderTop = 20;

            this.dropTargetPlace = y <= borderTop ? "top" : "bottom";
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

            this.$store.dispatch("resources/removeItemByIndexes", dragIndexes);
            // this.$store.commit("removeItemByIndexes", { indexes: dragIndexes });

            const dropIndexes = findIndexes(this.items, dropTarget);

            if (dropTargetPlace === "bottom") {
                dropIndexes[dropIndexes.length - 1] += 1;
            }

            // dragTarget должен быть массивом
            dragTarget = Array.isArray(dragTarget) ? dragTarget : [dragTarget];

            // this.$store.commit("insert", { itemsToInsert: dragTarget, indexes: dropIndexes });
            this.$store.dispatch("resources/insert", { items: dragTarget, indexes: dropIndexes });
        }
    }
};
</script>

<style scoped lang="sass">
.list
    min-height: 100%
    background-image: url("resources/pattern.svg")
    background-position: 0 0
    background-repeat: repeat
.list-item
    height: 40px
    //padding: 0 10px
    display: flex
    align-items: center


.label
    height: 40px
    padding: 0 10px
    display: flex
    align-items: center
    box-sizing: border-box
    width: 100%
    cursor: pointer

.checkbox
    position: absolute
    opacity: 0
    visibility: hidden
    width: 1px
    height: 1px

.fake-checkbox
    display: block
    width: 14px
    height: 14px
    margin-right: 10px
    position: relative
    flex-shrink: 0
    &:after, &:before
        content: ""
        position: absolute
        inset: 0
        background-image: url("resources/checkbox.svg")
        opacity: 1

    &:before
        background-image: url("resources/checkbox-active.svg")
        opacity: 0

.checkbox:checked + .fake-checkbox
    &:after
        opacity: 0
    &:before
        opacity: 1

.name
    font-size: 14px
    display: block
    margin-right: auto
    white-space: nowrap
    overflow: hidden
    text-overflow: ellipsis
</style>