<template>
    <div
        ref="time-ruler"
        class="time-ruler"
        @pointerover="onPointerOver($event)"
        @pointerdown="onPointerDown($event)"
        @pointermove="onPointerMove($event)"
        @pointerleave="onPointerLeave($event)"
    >
    </div>
</template>

<script>
export default {
    name: "TimeRuler",
    props: {

    },
    data: () => ({
        time: 0,
        pointerId: null,
        rulerEl: null,
        isPointerOver: false,
        isPointerDown: false
    }),
    watch: {
        time() {
            this.$store.dispatch("app/setUserCursor", this.time);
        },
        isCursorShow() {
            this.$store.dispatch("app/setShowUserCursor", this.isCursorShow);
        },
        isPointerDown() {
            this.$store.dispatch("app/setActiveUserCursor", this.isPointerDown);
        }
    },
    computed: {
        isCursorShow() {
            return this.isPointerOver || this.isPointerDown;
        }
    },
    methods: {
        onPointerLeave() {
            this.isPointerOver = false;
        },
        onPointerOver(e) {
            this.isPointerOver = true;
            // console.log(event)
            const computed = Math.min(Math.max(0, e.offsetX - 20), e.target.scrollWidth - 40);
            this.time = computed / 200;
        },
        onPointerDown(event) {
            this.pointerId = event.pointerId;
            this.rulerEl = this.$refs["time-ruler"];
            this.isPointerDown = true;

            // держим события на исходном элементе
            this.rulerEl.setPointerCapture(this.pointerId);

            // чтобы текст не выделялся
            event.preventDefault();

            window.addEventListener("pointermove", this.onPointerMoveWindow);
            window.addEventListener("pointerup", this.onPointerUpWindow);
            document.addEventListener("selectstart", this.block);
            document.addEventListener("dragstart", this.block);

            // сразу обновим позицию
            this.updateTimeFromEvent(event);
        },
        onPointerMoveWindow(event) {
            if (!this.isPointerDown) return;
            this.updateTimeFromEvent(event);
            event.preventDefault();
        },
        onPointerUpWindow(event) {
            this.isPointerDown = false;

            if (this.rulerEl && this.pointerId !== null) {
                this.rulerEl.releasePointerCapture(this.pointerId);
            }

            window.removeEventListener("pointermove", this.onPointerMoveWindow);
            window.removeEventListener("pointerup", this.onPointerUpWindow);
            document.removeEventListener("selectstart", this.block);
            document.removeEventListener("dragstart", this.block);
        },
        updateTimeFromEvent(e) {
            // считаем X относительно той самой линейки, а не target’а события
            const rect = this.rulerEl.getBoundingClientRect();
            const x = e.clientX - rect.left;              // позиция внутри линейки
            // const clamped = Math.max(0, Math.min(rect.width, x)); // защита от выхода за границы



            const computed = Math.min(Math.max(0, e.offsetX - 20), e.target.scrollWidth - 40);

            this.time = computed / 200;
            // console.log(e.offsetX)
        },
        block(ev) { ev.preventDefault(); },
        onPointerMove(e) {
            if (this.isPointerDown) return;
            const computed = Math.min(Math.max(0, e.offsetX - 20), e.target.scrollWidth - 40);
            this.time = computed / 200;
        }
    }
};
</script>

<style scoped lang="sass">
.time-ruler
    position: sticky
    top: 0
    left: 0
    right: 0
    height: 20px
    background-color: #bebebe
    z-index: 899
    cursor: pointer

</style>