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
            @dragstart.stop="dragstart(item, nestedLevel)"
            @dragover.stop.prevent="dragover(item, $event)"
            @dragleave.stop="dragleave($event)"
            @dragend.stop=" dragend()"
            @pointerdown.stop="onItemSelect(item)"
        >
            <div
                v-if="item.type === 'scene'"
                class="item-header"
            >
                <label
                    class="radio-label"
                    @click.stop
                >
                    <input
                        type="radio"
                        name="group"
                        :checked="$store.getters['layers/sceneToDisplay'] === item"
                        :value="item.name"
                        @change="$store.dispatch('layers/selectSceneToDisplay', item)"
                    >
<!--                  <svg class="radio-label__fake-input" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">-->
<!--                    <path d="m12 2 9 5-9 5-9-5 9-5z"/>-->
<!--                    <path d="m3 12 9 5 9-5"/>-->
<!--                    <path d="m3 17 9 5 9-5"/>-->
<!--                  </svg>-->
<!--                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">-->
<!--                    <path d="M12 2 20 7v10l-8 5-8-5V7z"/>-->
<!--                    <path d="M12 22V12L4 7m8 5 8-5"/>-->
<!--                  </svg>-->

                  <!--                    <img class="radio-label__fake-input" src="data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%0A%20%20%3Cpath%20d%3D%22m12%202%209%205-9%205-9-5%209-5z%22%3E%3C%2Fpath%3E%0A%20%20%3Cpath%20d%3D%22m3%2012%209%205%209-5%22%3E%3C%2Fpath%3E%0A%20%20%3Cpath%20d%3D%22m3%2017%209%205%209-5%22%3E%3C%2Fpath%3E%0A%3C%2Fsvg%3E%0A">-->
                    <span class="radio-label__fake-input" />
                </label>

                <button
                    class="close-btn"
                    @click.stop="onBtnCloseClick(item, $event.target)"
                />

                <h2 class="item-name">
                    <EditableText v-model="item.name" />
<!--                    {{ item.name }}-->
                </h2>
            </div>
            <div
                v-else
                class="item-header"
            >
                <div class="item-name-container">
                    <span
                        class="item-visible"
                        :class="{'visible': item.displayObject.visible}"
                        @click="item.displayObject.visible = !item.displayObject.visible"
                    >
                </span>
                    <h2 class="item-name">
<!--                        {{ item.name }}-->
                        <EditableText v-model="item.name" />
                    </h2>
                </div>


                <btn-remove @click.stop="onBtnRemoveClick(item)" />
            </div>

            <nested-transition-group
                v-if="item.items"
                :items="item.items"
                :nested-level="nestedLevel + 1"
                :animation-level="animationLevel"
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

import BtnRemove from "../../../../../../../BtnRemove";
import EditableText from "../../../../../../../EditableText/EditableText.vue";

export default {
    name: "NestedTransitionGroup",
    components: { EditableText, BtnRemove },
    props: {
        items: {
            type: Array,
            required: true
        },
        nestedLevel: {
            type: Number,
            required: true
        },
        animationLevel: {
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
                    "list-item_selected": this.$store.getters["layers/itemToRedact"] === item,
                    "list-item_parent": item.items?.length,
                    "list-item_drag-target": this.dragTarget === item,
                    "list-item_drop-target": this.dropTarget === item,
                    "list-item_drop-target_top": this.dropTarget === item && this.dropTargetPlace === "top",
                    "list-item_drop-target_bottom": this.dropTarget === item && this.dropTargetPlace === "bottom",
                    "list-item_drop-target_self": this.dropTarget === item && this.dropTargetPlace === "self",
                    "list-item_disable-animation": this.nestedLevel > this.animationLevel,
                    "scene_selected": this.$store.getters["layers/sceneToDisplay"] === item
                }
            ]);
        }
    },
    methods: {
        getHeight(item) {
            const height = 40;
            const nestedItemsHeight = item.items
                ? item.items.reduce((height, nestedItem) => height + this.getHeight(nestedItem), 0)
                : 0;

            const pb = item.items?.length ? 10 : 0;

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

            if (item.type === "scene") {
                this.$store.dispatch("layers/unselectItemToRedact");
                this.$store.dispatch("layers/selectSceneToDisplay", item);
            } else {
                this.$store.dispatch("layers/selectItemToRedact", item);

                const find = (parent, needed) => {
                    if (!parent.items) return;
                    return parent.items.some(item => item === needed || find(item, needed));
                };

              // console.log({ item })
              // console.log(this.$store.getters["layers/items"])
              //
              // this.$store.getters["layers/items"].forEach(scene => console.log({ scene }))

              const scene = this.$store.getters["layers/items"].find(scene => find(scene, item));
              this.$store.dispatch("layers/selectSceneToDisplay", scene);

              // console.log(this.$store.getters["layers/items"].find(({ items }) => items))
                // this.$store.dispatch("app/addListener", {
                //     type: "click",
                //     callback: () => this.$store.dispatch("layers/unselectItemToRedact"),
                //     once: true
                // });
                //
                // const cb = e => {
                //     if (e.code === "Escape" || e.code === "Enter") {
                //         this.$store.dispatch("layers/unselectItemToRedact");
                //         this.$store.dispatch("app/removeListener", { type: "keydown", callback: cb });
                //     }
                // };
                //
                // this.$store.dispatch("app/addListener", {
                //     type: "keydown",
                //     callback: cb
                // });
            }



        }
    }
};
</script>

<style scoped lang="sass">
.item-name-container
    display: flex
    align-items: center
    color: inherit

.item-visible
    position: relative
    display: inline-block
    width: 20px
    height: 20px
    cursor: pointer
    flex-shrink: 0
    margin-right: 5px
    &:before
        content: ""
        position: absolute
        width: 14px
        height: 14px
        top: 5px
        left: 3px
        background-image: url("../../../../../../../../resources/eye-closed.svg")
        background-position: center
        background-repeat: no-repeat
        background-size: contain
    &:hover
        transform: scale(1.05)
    &:active
        transform: scale(0.95)
    &:focus-visible
        outline: 2px solid rgba(0, 113, 227, .35)
        border-radius: 4px
    &.visible
        &:before
            top: 4px
            background-image: url("../../../../../../../../resources/eye-visible.svg")
.list-item
    transition: all 0.3s ease
    position: relative
    padding: 0 10px
    box-sizing: border-box
    overflow: hidden
    cursor: pointer

    &.scene_selected
        background-color: var(--color-accent-selected)

    .item-header
        height: 40px
        display: flex
        align-items: center

    &_disable-animation
        transition: none

    &_item
        .item-header
            justify-content: space-between
            padding: 0 10px
    //background-color: var(--color-light)

    .item-name
        font-size: 14px
        color: inherit
        white-space: nowrap
        text-overflow: ellipsis
        overflow: hidden
        line-height: initial

    .radio-label
        display: flex
        width: 20px
        height: 20px
        justify-content: center
        align-items: center
        cursor: pointer
        padding: 0
        border-radius: 50%
        margin-left: -3px
        margin-right: 10px
        flex-shrink: 0

        input
            opacity: 0
            visibility: hidden
            position: absolute
        &__fake-input
            position: relative
            width: 14px
            height: 14px
            border-radius: 50%
            background-color: #D9D9D9
            &:after
                content: ""
                position: absolute
                top: 50%
                left: 50%
                width: 8px
                height: 8px
                background-color: #716B6B
                border-radius: 50%
                transform: translate(-50%, -50%)

        input:checked + .radio-label__fake-input
            &:after
                background-color: var(--color-accent)

    .close-btn
        display: block
        width: 20px
        height: 20px
        background-color: transparent
        border: none
        box-shadow: none
        margin-right: 10px
        position: relative
        cursor: pointer
        flex-shrink: 0
        &:before, &:after
            content: ""
            position: absolute
            width: 14px
            height: 14px
            top: 3px
            left: 3px
            background-image: url("../../../../../../../../resources/opened-folder.svg")
            opacity: 1
            background-position: center
            background-repeat: no-repeat
            background-size: contain

        &:after
            background-image: url("../../../../../../../../resources/closed-folder.svg")
            width: 13px
            opacity: 0




    &_closed
        .close-btn
            &:before
                opacity: 0
            &:after
                opacity: 1
    &_selected
        & > .item-header
            color: blue

    &_color-1
        background-color: var(--color-dark)
        border-bottom: 1px solid var(--color-light)

    &_color-2
        background-color: var(--color-light)
        border-bottom: 1px solid var(--color-dark)

    &_drag-target
        opacity: 0.5
        //background-color: var(--color-accent-draggable)
        .item-header
            background-color: var(--color-accent-draggable)
            //background-color: inherit
    &_drop-target
        &:after
            content: ""
            position: absolute
            inset: 0
            border: 5px solid transparent
            pointer-events: none
        &_top:after
            border-top-color: var(--color-accent-draggable)


        &_bottom:after
            border-bottom-color: var(--color-accent-draggable)

        &_self:after
            border-color: var(--color-accent-draggable)

.list-enter-from, .list-leave-to
    opacity: 0
    height: 0 !important
</style>

