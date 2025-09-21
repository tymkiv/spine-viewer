<template>
    <div
        ref="container"
        class="range-input"
        :style="{'width': `${width}px`}"
        @mousedown.prevent="mouseDown($event)"
    >
        <div
            ref="cursor"
            class="range-input__cursor"
            :style="{'transform': `translateX(${cursorX}px)`}"
        ></div>
    </div>
</template>

<script>
export default {
    name: "RangeInput",
    props: {
        modelValue: { type: Number, required: true },
        minValue: { type: Number, default: 0 },
        maxValue: { type: Number, default: 1 },
        width: { type: Number, default: 150 }
    },
    data() {
        return {
            startX: 0
        };
    },
    emits: ["update:modelValue"],
    computed: {
        cursorX() {
            return this.calcRelativeValue([this.minValue, this.maxValue], [0, this.width - 5], this.modelValue);
        }
    },
    methods: {
        mouseDown(event) {
            this.startX = event.clientX;

            this.$store.dispatch("app/addListener", { type: "mousemove", callback: this.mouseMove });
            this.$store.dispatch("app/addListener", { type: "mouseup", callback: this.mouseUp });
            this.$store.dispatch("app/setCursorGrabbing", true);


            this.mouseMove(event);
        },
        mouseUp() {
            this.$store.dispatch("app/removeListener", { type: "mousemove", callback: this.mouseMove });
            this.$store.dispatch("app/removeListener", { type: "mouseup", callback: this.mouseUp });
            this.$store.dispatch("app/setCursorGrabbing", false);

            this.startX = 0;
        },
        mouseMove(event) {
            const clientX = event.clientX;

            const { left } = this.$refs["container"].getBoundingClientRect();

            const value = this.calcRelativeValue([0, this.width - 5], [this.minValue, this.maxValue], clientX - left);

            const normalizedValue = Math.max(this.minValue, Math.min(this.maxValue, value));

            this.$emit("update:modelValue", normalizedValue);

        },
        // имея два диапазона значений позволяет расчитать значение во втором диапазоне относительно первого
        calcRelativeValue(fromToBase, fromToRelative, baseValue) {
            const k = (fromToRelative[1] - fromToRelative[0]) / (fromToBase[1] - fromToBase[0]);
            return fromToRelative[0] + k * (baseValue - fromToBase[0]);
        }
    }
};
</script>

<style scoped lang="sass">
.range-input
    //width: 155px
    height: 20px
    position: relative
    cursor: pointer
    &:before
        content: ""
        position: absolute
        left: 0
        top: 8px
        height: 4px
        width: 100%
        background-color: var(--color-light)
        box-shadow: inset var(--shadow)

        border-radius: 5px
    &__cursor
        position: absolute
        top: 0
        width: 5px
        height: 20px
        border-radius: 5px
        background-color: var(--color-accent)
        cursor: grab
</style>