<template>
    <transition-group
        name="list"
        tag="ul"
    >
        <li
            v-for="(item, index) in items"
            :key="item.id"
            :class="itemsClass[index]"
            :style="{ height: `${item._closed ? 40 : itemsHeight[index]}px` }"
            draggable="true"
            @dragstart.stop="dragstart(item)"
            @dragover.stop.prevent="dragover(item, $event)"
            @dragleave.stop="dragleave()"
            @dragend.stop="dragend()"
            @click.stop="onItemSelect(item)"
        >
            <div
                v-if="item.type === LIST_ITEM_TYPE_SCENE"
                class="item-header"
            >
                <button
                    class="close-btn"
                    @click.stop="onBtnCloseClick(item, $event.target)"
                >
                    -
                </button>

                <input
                    :checked="$store.getters.selectedItem[LIST_ITEM_TO_DISPLAY] === item"
                    type="radio"
                    name="group"
                    :value="item.name"
                    @change="$store.commit('selectToDisplay', { item: item })"
                    @click.stop
                />
                <h2 class="item-name">
                    {{ item.name }}
                </h2>
            </div>
            <div
                v-else
                class="item-header"
            >
                <h2 class="item-name">
                    {{ item.name }}
                </h2>

                <button
                    class="remove-btn"
                    @click.stop="onBtnRemoveClick(item)"
                >
                    X
                </button>
            </div>

            <nested-transition-group
                v-if="item.items"
                :items="item.items"
                :nested-level="nestedLevel + 1"
                :dragstart="dragstart"
                :dragover="dragover"
                :dragleave="dragleave"
                :dragend="dragend"
                :on-btn-remove-click="onBtnRemoveClick"
                :drag-target="dragTarget"
                :drop-target="dropTarget"
                :drop-target-place="dropTargetPlace"
            />
        </li>
    </transition-group>
</template>

<script>
import gsap from "gsap";

import { LIST_ITEM_TYPE_ITEM, LIST_ITEM_TYPE_SCENE, LIST_ITEM_TO_REDACT, LIST_ITEM_TO_DISPLAY } from "../../constants";

export default {
    name: "NestedTransitionGroup",
    props: {
        items: {
            type: Array,
            required: true
        },
        nestedLevel: {
            type: Number,
            required: true
        },
        dragstart: {
            type: Function,
            required: true
        },
        dragover: {
            type: Function,
            required: true
        },
        dragleave: {
            type: Function,
            required: true
        },
        dragend: {
            type: Function,
            required: true
        },
        onBtnRemoveClick: {
            type: Function,
            required: true
        },
        dragTarget: {
            type: Object,
            required: false,
            default: () => null
        },
        dropTarget: {
            type: Object,
            required: false,
            default: () => null
        },
        dropTargetPlace: {
            type: String,
            required: false,
            default: () => null
        }
    },
    computed: {
        itemsHeight() {
            return this.items.map((item) => this.getHeight(item));
        },

        itemsClass() {
            return this.items.map((item) => [
                "list-item",
                `list-item_${item.type}`,
                `list-item_color-${this.nestedLevel % 2 === 0 ? 1 : 2}`,
                {
                    "list-item_closed": item._closed,
                    "list-item_selected": this.$store.getters.selectedItem[LIST_ITEM_TO_REDACT] === item,
                    "list-item_parent": item.items?.length,
                    "list-item_drag-target": this.dragTarget === item,
                    "list-item_drop-target": this.dropTarget === item,
                    "list-item_drop-target_top": this.dropTarget === item && this.dropTargetPlace === "top",
                    "list-item_drop-target_bottom": this.dropTarget === item && this.dropTargetPlace === "bottom",
                    "list-item_drop-target_self": this.dropTarget === item && this.dropTargetPlace === "self"
                }
            ]);
        },
        LIST_ITEM_TYPE_ITEM() {
            return LIST_ITEM_TYPE_ITEM;
        },
        LIST_ITEM_TYPE_SCENE() {
            return LIST_ITEM_TYPE_SCENE;
        },
        LIST_ITEM_TO_REDACT() {
            return LIST_ITEM_TO_REDACT;
        },
        LIST_ITEM_TO_DISPLAY() {
            return LIST_ITEM_TO_DISPLAY;
        }
    },
    methods: {
        getHeight(item) {
            const height = 40;
            const nestedItemsHeight = item.items
                ? item.items.reduce((height, nestedItem) => height + this.getHeight(nestedItem), 0)
                : 0;

            const pb = item.items.length ? 10 : 0;

            return height + nestedItemsHeight + pb;
        },

        onBtnCloseClick(item, domElement) {
            item._closed = !item._closed;
            const ul = domElement.closest(".list-item").querySelector("ul");
            item._delayedCall?.kill();
            if (item._closed) {
                item._delayedCall = gsap.delayedCall(0.3, () => gsap.set(ul, { display: "none" }));
            } else {
                gsap.set(ul, { display: "" });
            }

        },

        onItemSelect(item) {
            this.$store.commit("selectToRedact", { item: item });
            this.$store.commit("addAppClickListener", { callback: () => this.$store.commit("unselectToRedact"), once: true });
        }
    }
};
</script>

<style scoped lang="sass">
.group-name, .item-header
    height: 40px
    display: flex
    align-items: center
    justify-content: space-between

.list-item
    transition: all 0.3s ease
    position: relative
    padding: 0 10px
    box-sizing: border-box
    overflow: hidden

    .item-name
        font-size: 14px
        color: inherit

    &_selected
        & > .item-header
            color: blue

    &_color-1
        background-color: #EAEAEB
        border-bottom: 1px solid #F4F5F5

    &_color-2
        background-color: #F4F5F5
        border-bottom: 1px solid #EAEAEB

    &_parent.list-item_drop-target_self:after
        left: 30px
        right: 30px
        top: 40px

    &_drop-target
        z-index: 50

        &_top:after, &_bottom:after, &_self:after
            content: ""
            position: absolute
            top: -1px
            left: 20px
            right: 20px
            height: 2px
            z-index: 10
            background-color: #000
            pointer-events: none

        &_bottom:after
            top: auto
            bottom: -1px

        &_self:after
            top: 50%
            margin-top: -1px

.list-enter-from, .list-leave-to
    opacity: 0
    height: 0 !important

@keyframes anim
    0%
        display: initial
    100%
        display: none
</style>
