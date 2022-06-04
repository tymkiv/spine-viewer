<template>
    <div
        ref="track"
        class="track"
    >
        <div
            ref="wrapper"
            class="track__wrapper"
        >
            <div
                ref="plate"
                class="plate"
                :class="{'draggable': inDrag}"
                @dragstart.prevent
                @mousedown="mousedown($event)"
            >
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

                <div class="plate__duration" :style="{width: pickedAnimation.duration * 200 + 'px'}"/>
            </div>

            <btn-remove @click="$emit('removeClick')" />
        </div>
    </div>
</template>

<script>
import gsap from "gsap";
import BtnRemove from "../../../../../BtnRemove";
export default {
    components: { BtnRemove },
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
            tensionRange: 50, // ширина "натяжения"
            deltaX: 0,
            startX: 0,
            x: 0,
            lastX: 0,
            rightBorder: 0,
            leftBorder: 0,
            inDrag: false
        };
    },
    watch: {
        timeStart() {
            this.moveByTimeStart(this.timeStart);
        }
    },
    mounted() {
        this.moveByTimeStart(this.timeStart);
        const width = this.timeStart * 200 + Math.max(this.$refs.wrapper.offsetWidth, this.pickedAnimation.duration * 200 + 25);
        gsap.set(this.$refs.track, { width: this.scroller.clientWidth > width ? "" : width });
    },
    methods: {
        moveByTimeStart(timeStart) {
            gsap.set(this.$refs.wrapper, { x: timeStart * 200 });
            this.lastX = timeStart * 200 - this.deltaX;
        },
        mousedown(e) {
            this.startX = e.clientX;
            this.rightBorder = this.getUpdatedRightBorder();
            this.leftBorder = this.getUpdatedLeftBorder();
            this.rightBorder = Math.max(this.rightBorder, this.lastX);
            this.leftBorder = Math.min(this.leftBorder, this.lastX);

            this.inDrag = true;

            // window.addEventListener("mousemove", this._bind.mousemove);
            // window.addEventListener("mouseup", this._bind.mouseup);
            this.$store.dispatch("app/addListener", { type: "mousemove", callback: this.mousemove });
            // this.$store.commit("addAppListener", { type: "mousemove", callback: this.mousemove });
            this.$store.dispatch("app/addListener", { type: "mouseup", callback: this.mouseup });
            // this.$store.commit("addAppListener", { type: "mouseup", callback: this.mouseup });

            gsap.ticker.add(this.tick);

            this.$store.dispatch("app/setCursorGrabbing", true);
            // this.$store.commit("grabbing", { value: true });
            // document.body.classList.add("grabbing");
            // this._elementToDrag.classList.add(styles["grabbing"]);
        },

        tick() {
            this.x = this.deltaX + this.lastX;

            const borderEnd = this.$refs.track.offsetWidth - Math.max(this.$refs.wrapper.offsetWidth, this.pickedAnimation.duration * 200 + 25);

            const rightBorderMinThreshold = this.getUpdatedRightBorder();
            const leftBorderMinThreshold = this.getUpdatedLeftBorder();

            this.x = Math.min(this.rightBorder + this.tensionRange, this.x);
            this.x = Math.max(this.leftBorder - this.tensionRange, this.x);

            if (this.x > this.rightBorder) {
                const speed = Math.floor((this.x - this.rightBorder) * this.maxSpeed / this.tensionRange);
                this.x += speed;
                this.rightBorder += speed;
                this.x > borderEnd && gsap.set(this.$refs.track, { width: `+=${speed}` });
                this.$emit("scrollLeft", this.scroller.scrollLeft + speed);
                this.leftBorder = this.getUpdatedLeftBorder();
            }

            if (this.x < this.leftBorder) {
                const speed = Math.floor((this.x - this.leftBorder) * this.maxSpeed / this.tensionRange);
                this.x += speed;
                this.leftBorder += speed;
                gsap.set(this.$refs.track, { width: `+=${speed}` });
                this.$emit("scrollLeft", this.scroller.scrollLeft + speed);
                this.rightBorder = this.getUpdatedRightBorder();
            }

            this.rightBorder = Math.max(this.rightBorder, rightBorderMinThreshold);
            this.leftBorder = Math.min(this.leftBorder, leftBorderMinThreshold);
            this.x = Math.max(this.x, 0);

            // if (this.x > 490 && this.x < 510) { // todo: привязка к определенной точке
            //     gsap.set(this.$refs.wrapper, { x: 500 });
            //     return;
            // }

            // gsap.set(this.$refs.wrapper, { x: this.x });
            this.$emit("updateTimeStart", this.x / 200);
            // this.lastX = this.x - this.deltaX;
        },

        mousemove(e) {
            e.preventDefault();
            this.deltaX = e.clientX - this.startX;
        },

        mouseup() {
            if (this.x - this.rightBorder <= this.tensionRange && this.x - this.rightBorder > 0) {
                this.x -= Math.floor(this.x - this.rightBorder);
                gsap.to(this.$refs.wrapper, { x: this.x, duration: 0.3 });
            }

            if (this.leftBorder - this.x <= this.tensionRange && this.leftBorder - this.x > 0) {
                this.x += Math.floor(this.leftBorder - this.x);
                gsap.to(this.$refs.wrapper, { x: this.x, duration: 0.3 });
            }

            this.lastX = this.x;
            this.deltaX = 0;
            this.x = 0;
            this.inDrag = false;

            // window.removeEventListener("mousemove", this._bind.mousemove);
            // window.removeEventListener("mouseup", this._bind.mouseup);

            this.$store.dispatch("app/removeListener", { type: "mousemove", callback: this.mousemove });
            // this.$store.commit("removeAppListener", { type: "mousemove", callback: this.mousemove });
            this.$store.dispatch("app/removeListener", { type: "mouseup", callback: this.mouseup });
            // this.$store.commit("removeAppListener", { type: "mouseup", callback: this.mouseup });

            gsap.ticker.remove(this.tick);

            this.$store.dispatch("app/setCursorGrabbing", false);
            // this.$store.commit("grabbing", { value: false });
            // document.body.classList.remove("grabbing");
            // this._elementToDrag.classList.remove(styles["grabbing"]);

            // this._onDragEnd(this._lastX); // todo: тут должна быть адаптация
        },

        getUpdatedRightBorder() {
            return this.scroller.scrollLeft + this.scroller.clientWidth - Math.max(this.$refs.wrapper.offsetWidth, this.pickedAnimation.duration * 200 + 25);
        },

        getUpdatedLeftBorder() {
            return this.scroller.scrollLeft;
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