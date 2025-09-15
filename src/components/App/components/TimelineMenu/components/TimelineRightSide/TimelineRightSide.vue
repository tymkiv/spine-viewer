<template>
    <div class="wrapper">

        <div class="header">
            Timeline
        </div>
        <div ref="cursor" class="time-ruler__cursor" :style="cursorStyle"> {{ userTimeCursor.toFixed(2) }} </div>
        <div
            ref="scroller"
            class="list-wrapper"
            @scroll="$emit('onscroll', $event.target.scrollTop)"
        >
            <div class="scroller-wrapper">
                <TimeRuler />
                <div class="user-time-cursor" ref="user-time-cursor"></div>
                <div class="time-cursor" ref="time-cursor"></div>
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
                            :probable-animations="item.probableAnimations"
                            :animations="item.animations"
                            @scroll-left="scrollLeft"
                            @add-click="addClick(item)"
                            @remove-click="animation => removeClick(item, animation)"
                        />
                    </li>
                </transition-group>
            </div>

        </div>
    </div>
</template>

<script>
import gsap from "gsap";
import TimeRuler from "../../../../../TimeRuler/TimeRuler.vue";
import TimelineSpineItem from "../TimelineSpineItem";
import { v4 } from "uuid";

export default {
    components: { TimeRuler, TimelineSpineItem },

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
        cursorStyle() {
            return {
                transform: `translateX(${this.userTimeCursor * 200 - (this.$refs.scroller?.scrollLeft || 0)}px)`,
                opacity: this.userTimeCursorShow ? 1 : 0
            };
        },
        itemsHeight() {
            return this.items.map((item) => this.getHeight(item));
        },
        timeCursor() {
            return this.$store.getters["app/timeCursor"];
        },
        userTimeCursor() {
            return this.$store.getters["app/userCursor"];
        },
        userTimeCursorShow() {
            return this.$store.getters["app/showUserCursor"];
        },
        userTimeCursorActive() {
            return this.$store.getters["app/activeUserCursor"];
        }
    },
    watch: {
        scrollTop() {
            this.$refs.scroller.scrollTop = this.scrollTop;
        },
        timeCursor() {
            gsap.set(this.$refs["time-cursor"], { x: this.timeCursor * 200 });
        },
        userTimeCursor() {
            gsap.set(this.$refs["user-time-cursor"], { x: this.userTimeCursor * 200 });
        },
        userTimeCursorShow() {
            gsap.set(this.$refs["user-time-cursor"], { opacity: this.userTimeCursorShow ? 1 : 0 });
        },
        userTimeCursorActive() {
            gsap.set(this.$refs["time-cursor"], { opacity: this.userTimeCursorActive ? 0 : 1 });
        }

    },
    mounted() {
        this.scroller = this.$refs.scroller;
    },
    methods: {
        getHeight(item) {
                const height = 90;

                return height * (item.animations.length + 1);

            // return 0;
        },
        scrollLeft(value) {
            this.$refs.scroller.scrollLeft = value;
        },
        addClick(item) {
            const timeStart = item.animations.reduce((acc, item) => {
                return Math.max(acc, item.timeStart + item.pickedAnimation.duration);
            }, 0);

            const animation = {
                id: v4(),
                pickedAnimation: item.probableAnimations[0],
                timeStart
            };

            this.$store.dispatch("layers/addAnimationToItem", { item, animation });

            this.$store.getters["app/listeners"].restart?.forEach(cb => cb());
            // this.$store.commit("addPlateToSpine", { item, plate });
        },
        removeClick(item, animation) {
            this.$store.dispatch("layers/removeAnimationToItem", { item, animation });

            this.$store.getters["app/listeners"].restart?.forEach(cb => cb());
            // this.$store.commit("removePlateFromSpine", { item, plate });
        }
    }
};
</script>

<style scoped lang="sass">
.time-ruler
    &__cursor
        top: 5px
        left: 7px
        position: absolute
        pointer-events: none
        display: inline-block
        padding: 4px 5px
        background: #ffd880
        border-radius: 4px
        box-shadow: 0 0 2px rgba(0,0,0,.14)
        font-size: 10px
        transition: opacity 0.3s
        z-index: 1000000
.list-enter-from, .list-leave-to
    opacity: 0
    height: 0 !important
    //transform: translateY(-100%)
.wrapper
    overflow: hidden
    box-shadow: var(--shadow)
    height: 100%
    position: relative

.header
    height: 25px
    display: flex
    align-items: center
    padding: 0 10px
    font-size: 14px
    position: relative
    z-index: 10
    box-shadow: var(--shadow)
    background-color: var(--color-light)

.time-cursor, .user-time-cursor
    position: absolute
    width: 2px
    background-color: var(--color-accent)
    top: 0
    height: 100%
    left: 20px
    z-index: 999
    pointer-events: none
    will-change: transform

.user-time-cursor
    background-color: #ffd880
    transition: opacity 0.3s
    opacity: 0

.scroller-wrapper
    min-height: 100%
    background-image: url("../../../../../../resources/pattern.svg")
    background-position: 0 20px
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
        background-image: url("../../../../../../resources/ruller-pattern.svg")
        background-position: 0 20px
.list-wrapper
    overflow: scroll
    position: relative
    height: calc(100% - 25px)


.list
    min-height: 100%

    position: relative
    width: fit-content
    min-width: 100%


.list-item
    transition: all 0.3s ease
    overflow: hidden
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
</style>