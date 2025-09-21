<template>
    <div
        ref="track"
        class="track"
        :style="{ 'width': `${trackWidth}px` }"
    >
        <div
            ref="wrapper"
            class="track__wrapper"
            :style="{'transform': `translateX(${elementPosition}px)`}"
        >
            <div
                ref="plate"
                class="plate"
                :class="{'draggable': inDrag}"
                @dragstart.prevent
                @select.prevent
                @mousedown="mousedown($event)"
            >
                <copy-button :value="pickedAnimation.name" @mousedown.stop @dragstart.prevent @select.prevent style="margin-right: 5px" />
                <select
                    class="plate__select"
                    @mousedown.stop
                    @change="$emit('updatePickedAnimation', $event.target.value)"
                >
                    <option
                        v-for="probableAnimation in probableAnimations"
                        :key="probableAnimation.id"
                        :selected="probableAnimation === pickedAnimation"
                        :value="probableAnimation.id"
                    >
                        {{ probableAnimation.name }}
                    </option>
                </select>

                <div class="plate__duration" :style="{width: pickedAnimation.duration * pixelsPerSecond + 'px'}"/>
            </div>

            <btn-remove @click="$emit('removeClick')" />
        </div>
    </div>
</template>

<script>
import gsap from "gsap";
import BtnRemove from "../../../../../BtnRemove";
import CopyButton from "../../../../../CopyButton/CopyButton.vue";
export default {
    components: { BtnRemove, CopyButton },
    props: {
        scroller: {
            type: [null, HTMLDivElement],
            required: true
        },
        pickedAnimation: {
            type: Object,
            required: true
        },
        timeStart: {
            type: Number,
            required: true
        },
        probableAnimations: {
            type: Array,
            required: true
        }
    },
    emits: ["scrollLeft", "removeClick", "updateTimeStart", "updatePickedAnimation"],
    data() {
        return {
            maxSpeed: 15, // максимальная скорость расширения и скролла, при перетаскивании thumb за границы
            tensionRange: 150, // ширина "натяжения"
            paddingLeft: 20,
            deltaX: 0,
            startX: 0,
            x: 0,
            lastX: 0,
            rightBorder: 0,
            leftBorder: 0,
            inDrag: false,

            elementClientX: 0,
            wrapperOffsetX: 0,
            wrapperWidth: 0,
            offsetX: 0,
            currentX: 0,

            maxTrackWidth: 0
        };
    },
    computed: {
        pixelsPerSecond() {
            return this.$store.getters["app/pixelsPerSecond"];
        },
        elementWidth() {
            return Math.max(this.$refs.wrapper?.offsetWidth ?? 0, this.pickedAnimation.duration * this.pixelsPerSecond);
        },
        elementPosition() {
            return this.timeStart * this.pixelsPerSecond;
        },
        trackWidth() {
            const byElement = this.elementPosition + this.elementWidth + this.paddingLeft;
            const byContainer = this.scroller.clientWidth;
            let byPrev = this.maxTrackWidth;

            const scrollRight = Math.max(0, this.scroller.scrollWidth - this.scroller.clientWidth - this.scroller.scrollLeft);

            if (byPrev > Math.max(byElement, byContainer)) {
                byPrev -= Math.min(byPrev - Math.max(byElement, byContainer), scrollRight);
            }

            this.maxTrackWidth = Math.max(byPrev, byContainer, byElement);
            return this.maxTrackWidth;
        }
    },
    watch: {


    },

    mounted() {

    },
    methods: {
        mousedown(e) {
            this.startX = e.clientX;
            this.currentX = e.clientX;
            this.offsetX = e.offsetX;

            const bound = this.scroller.getBoundingClientRect();

            this.wrapperOffsetX = bound.x;
            this.wrapperWidth = this.scroller.clientWidth;

            this.inDrag = true;

            this.$store.dispatch("app/addListener", { type: "mousemove", callback: this.mousemove });
            this.$store.dispatch("app/addListener", { type: "mouseup", callback: this.mouseup });

            gsap.ticker.add(this.tick);

            this.$store.dispatch("app/setCursorGrabbing", true);
        },

        tick() {
            const elementClientX = this.currentX - this.offsetX;
            const elementContainerX = elementClientX - this.wrapperOffsetX;


            const leftBorder = this.wrapperOffsetX + this.tensionRange;
            const rightBorder = this.wrapperOffsetX + this.wrapperWidth - this.tensionRange;

            if (this.currentX > rightBorder) {
                const speed = Math.min(this.maxSpeed, Math.floor(Math.min(Math.max(0, this.deltaX), (this.currentX - rightBorder)) * this.maxSpeed / this.tensionRange));
                this.$emit("scrollLeft", this.scroller.scrollLeft + speed);
            }

            if (this.currentX < leftBorder) {
                const speed = Math.min(this.maxSpeed, Math.floor(Math.min(Math.max(0, this.deltaX), (this.currentX - leftBorder)) * this.maxSpeed / this.tensionRange));
                this.$emit("scrollLeft", this.scroller.scrollLeft + speed);
            }

            const elementPositionX = Math.max(0, elementContainerX + this.scroller.scrollLeft - this.paddingLeft);
            this.$emit("updateTimeStart", elementPositionX / this.pixelsPerSecond);
        },

        mousemove(e) {
            e.preventDefault();
            this.deltaX = e.clientX - this.startX;
            this.currentX = e.clientX;
        },

        mouseup() {
            this.deltaX = 0;
            this.inDrag = false;

            this.$store.dispatch("app/removeListener", { type: "mousemove", callback: this.mousemove });
            this.$store.dispatch("app/removeListener", { type: "mouseup", callback: this.mouseup });

            gsap.ticker.remove(this.tick);

            this.$store.dispatch("app/setCursorGrabbing", false);
        }
    }
};
</script>

<style scoped lang="sass">
.track
    overflow: hidden

    &__wrapper
        padding: 20px 20px 40px 20px
        width: max-content
        display: flex
        align-items: center
.plate
    border-radius: 5px
    background-color: var(--color-light)
    box-shadow: var(--shadow)
    height: 30px
    padding: 0 30px 0 30px
    cursor: grab
    position: relative
    display: flex
    align-items: center

    &.draggable
        box-shadow: 0 0 4px 1px #{rgba(#111, 0.25)}


    &:before, &:after
        content: ""
        position: absolute
        width: 10px
        height: 4px
        left: 10px
        top: 50%
        transform: translateY(-50%)

        background-image: url("resources/marker.svg")
        background-repeat: no-repeat
        background-size: contain
        background-position: center


    &:after
        left: auto
        right: 10px


    &__select
        border: none
        border-radius: inherit
        box-shadow: none
        background: transparent
        line-height: 30px
        height: 30px
        font-size: 14px
        font-weight: 600
        cursor: pointer
        text-overflow: ellipsis
        width: 100%
        -webkit-appearance: none


    &__select:focus
        outline: none

    &__duration
        position: absolute
        bottom: -19px
        left: 0
        height: 5px
        width: 0
        background-color: var(--color-accent)
        border-radius: 5px 5px 0 0
        transition: width 0.3s
</style>