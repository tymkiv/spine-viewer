<template>
    <div class="wrapper">


        <div class="header">
            Timeline
        </div>
        <div class="list-wrapper" @scroll="$emit('onscroll', $event.target.scrollTop)" ref="scroller">
            <transition-group
                name="list"
                tag="ul"
                class="list"
            >
                <li
                    v-for="(item, index) in items"
                    :key="item.id"
                    class="list-item"
                    :style="{ height: `${itemsHeight[index]}px` }"
                >
                    <timeline-spine-item
                        :scroller="scroller"
                        :animations="item.animations"
                        :plates="item.plates"
                        @scroll-left="scrollLeft"
                        @add-click="addClick(item)"
                        @remove-click="plate => removeClick(item, plate)"
                    />

                </li>
            </transition-group>
        </div>
    </div>
</template>

<script>
import TimelineSpineItem from "../TimelineSpineItem";
import { v4 } from "uuid";

export default {
    components: { TimelineSpineItem },

    props: {
        scrollTop: {
            type: Number,
            required: true
        },
        items: {
            type: Array,
            required: true
        }
    },
    emits: ["onscroll"],
    data() {
        return {
            scroller: null
        };
    },
    computed: {
        itemsHeight() {
            return this.items.map((item) => this.getHeight(item));
        }
    },
    watch: {
        scrollTop() {
            this.$refs.scroller.scrollTop = this.scrollTop;
        }
    },
    mounted() {
        this.scroller = this.$refs.scroller;
    },
    methods: {
        getHeight(item) {
            const height = 90;

            return height * (item.plates.length + 1);
        },
        scrollLeft(value) {
            this.$refs.scroller.scrollLeft = value;
        },
        addClick(item) {
            const plate = {
                id: v4(),
                pickedAnimation: item.animations[0]
            };

            this.$store.commit("addPlateToSpine", { item, plate });
        },
        removeClick(item, plate) {
            this.$store.commit("removePlateFromSpine", { item, plate });
        }
    }
};
</script>

<style scoped lang="sass">
.list-enter-from, .list-leave-to
    opacity: 0
    height: 0 !important
.wrapper
    overflow: hidden
    box-shadow: var(--shadow)
    height: 100%

.header
    height: 25px
    display: flex
    align-items: center
    padding: 0 20px
    font-size: 14px
    position: relative
    z-index: 10
    box-shadow: var(--shadow)
    background-color: #F6F6F7

.list-wrapper
    overflow: auto

    height: calc(100% - 25px)


.list
    min-height: 100%
    background-image: url("../../../../resources/pattern.svg")
    background-position: 0 0
    position: relative
    width: fit-content
    min-width: 100%
    &:before
        content: ""
        position: absolute
        top: 0
        left: 20px
        bottom: 0
        right: 0
        pointer-events: none
        background-image: url("../../../../resources/ruller-pattern.svg")

.list-item
    transition: all 0.3s ease
    &__wrapper
        padding: 20px 5px
        box-sizing: border-box
        height: 100%
    &__plate
        border-radius: 5px
        box-shadow: var(--shadow)
        height: 40px
        display: flex
        align-items: center
        padding: 0 10px
        font-size: 14px
        //position: sticky
        //top: 20px
</style>