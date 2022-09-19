<template>
    <div
        ref="container"
        class="scene-container"
    >
        <color-picker
            v-model="colors"
            v-if="colorPickerOpen"
            class="color-picker"
        />
        <div
            ref="color-trigger"
            class="color-trigger"
            :class="{'open': colorPickerOpen}"
            @click="colorPickerOpen = !colorPickerOpen"
        ></div>
        <canvas ref="scene" @wheel="onWheel($event)"></canvas>
        <div class="scale-prompt">{{ `${Math.round((1 / scale) * 100)}%` }}</div>
    </div>
</template>

<script>
import * as PIXI from "pixi.js";
// import "pixi-spine";
import "pixi-spine_v3.8";
import gsap from "gsap";
import { Sketch } from "@ckpack/vue-color";
export default {
    components: {
        "color-picker": Sketch
    },
    data() {
        return {
            app: null,
            container: new PIXI.Container(),
            colors: "#cccccc",
            colorPickerOpen: false
        };
    },
    computed: {
        items() {
            return this.$store.getters["layers/timelineItems"];
        },
        timeCursor() {
            return this.$store.getters["app/timeCursor"];
        },
        speed() {
            return this.$store.getters["app/speed"];
        },
        isPlay() {
            return this.$store.getters["app/play"];
        },
        loop() {
            return this.$store.getters["app/loop"];
        },
        scale() {
            return this.$store.getters["app/scale"];
        }
    },
    watch: {
        isPlay() {
            if (this.isPlay) {
                if (this.timeline) {
                    this.timeline.play();
                } else {
                    this.setAndPlayAnimation([...this.items].reverse());
                }

            } else {
                this.timeline?.pause();
            }
        },
        timeCursor() {
            this.timeline?.time(this.timeCursor);
        },
        colors() {
            this.app.renderer.backgroundColor = `0x${this.colors.hex.slice(1)}`;
            gsap.set(this.$refs["color-trigger"], { backgroundColor: this.colors.hex });
        },
        items(newItems, oldItems) {
            oldItems.forEach(item => {
                item.spine.parent?.removeChild(item.spine);
            });

            const reversedItems = [...newItems].reverse();
            reversedItems.forEach(item => {
            // newItems.forEach(item => {
                this.container.addChild(item.spine);
            });


            this.setAndPlayAnimation(reversedItems);
        },
        speed() {
            this.timeline?.timeScale(this.speed);
        },
        scale() {
            this.updateSize();
        }
    },
    mounted() {
        this.app = new PIXI.Application({
            view: this.$refs.scene,
            resolution: 1,
            // antialias: true,
            backgroundColor: 0xcccccc
        });
        this.app.stage.addChild(this.container);
        this.app.ticker.stop();

        gsap.ticker.add(() => {
            this.app.ticker.update();
        });

        this.$store.dispatch("app/addListener", { type: "resize", callback: this.updateSize });
        this.$store.dispatch("app/addListener", { type: "restart", callback: () => this.setAndPlayAnimation([...this.items].reverse()) });

        this.$nextTick(this.updateSize);
    },
    methods: {
        onWheel(event) {
            const scale = Math.min(Math.max(this.scale + event.deltaY / 100, 0.25), 4);
            this.$store.dispatch("app/setScale", scale);

        },
        updateSize() {
            this.app.renderer.resize(this.$refs.container.offsetWidth * this.scale, this.$refs.container.offsetHeight * this.scale);
            this.container.position.set(this.$refs.container.offsetWidth * this.scale / 2, this.$refs.container.offsetHeight * this.scale / 2);
            // this.container.position.set(this.$refs.container.offsetWidth / 2, this.$refs.container.offsetHeight / 2);
        },
        setAndPlayAnimation(items) {
            this.timeline?.kill();
            this.$store.dispatch("app/setPlay", true);
            this.timeline = gsap.timeline({
                onComplete: () => {
                    if (this.loop) {
                        this.setAndPlayAnimation(items);
                    } else {
                        this.$store.dispatch("app/setPlay", false);
                        this.timeline.progress(0);
                    }
                },
                onUpdate: () => {
                    this.$store.dispatch("app/setTimeCursor", this.timeline.time());
                }
            });
            this.timeline?.timeScale(this.speed);
            items.forEach(item => {
                this.container.addChild(item.spine);
                item.spine.autoUpdate = false;
                item.spine.update(0);
                item.animations.forEach((animation) => {
                    const crutch = { trackTime: 0 };
                    let track;
                    this.timeline
                        .to(crutch, {
                            trackTime: animation.pickedAnimation.duration,
                            duration: animation.pickedAnimation.duration,
                            ease: "linear",
                            onStart: () => {
                                track = item.spine.state.setAnimation(0, animation.pickedAnimation.name);
                            },
                            onUpdate: () => {
                                if (track?.animation?.name !== animation.pickedAnimation.name) {
                                    track = item.spine.state.setAnimation(0, animation.pickedAnimation.name);
                                }
                                track.trackTime = crutch.trackTime;
                                item.spine.update(1 / 60);
                            }
                        }, animation.timeStart);
                });

            });
        }
    }
};
</script>

<style scoped lang="sass">
.scale-prompt
    position: absolute
    bottom: 20px
    right: 20px
    background-color: #fff
    color: #000
    font-size: 14px
    padding: 5px

.scene-container
    position: relative
    width: 100%
    height: 100%
    overflow: hidden
    canvas
        position: absolute
        top: 0
        left: 0
        width: 100%
        height: 100%

.color-picker
    position: absolute
    top: 10px
    right: 40px
    z-index: 100

.color-trigger
    position: absolute
    z-index: 100
    top: 10px
    right: 10px
    width: 20px
    height: 20px
    border: 2px solid #fff
    outline: 2px solid #000
    cursor: pointer
    &.open
        &:before, &:after
            content: ""
            position: absolute
            width: 18px
            height: 2px
            border: 1px solid #fff
            background-color: #000
            top: 50%
            left: 50%
            transform: translate(-50%, -50%) rotate(45deg)
            pointer-events: none

        &:after
            transform: translate(-50%, -50%) rotate(-45deg)
</style>