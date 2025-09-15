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
        <canvas ref="scene" @wheel="onWheel($event)" @pointerdown="onPointerDown($event)"></canvas>
        <div class="scale-prompt">
            <button class="scale-prompt__btn" @click="$store.dispatch('app/setScale', Math.min(Math.max(1 / Number((1 / scale - 0.1).toFixed(1)), 0.25), 4))"> - </button>
            <div class="scale-prompt__info">
                {{ `${Math.round((1 / scale) * 100)}%` }}
            </div>
            <button class="scale-prompt__btn" @click="$store.dispatch('app/setScale', Math.min(Math.max(1 / Number((1 / scale + 0.1).toFixed(1)), 0.25), 4))" > + </button>
        </div>
    </div>
</template>

<script>
import { throttle } from "lodash";
import * as PIXI from "pixi.js";
// import "pixi-spine";
// import "pixi-spine_v3.8";
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
            colorPickerOpen: false,
            inMove: false,
            moveStartPoint: null
        };
    },
    created() {
        this.showByUserCursorThrottled = throttle(this.showByUserCursor, 1000 / 60); // 1 раз в сек
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
        },
        isUserCursorActive() {
            return this.$store.getters["app/activeUserCursor"];
        },
        userCursor() {
            return this.$store.getters["app/userCursor"];
        }
    },
    watch: {
        isUserCursorActive() {
            if (this.isUserCursorActive) {
                this.timeline?.pause();
                this.showByUserCursor();
            } else {
                this.timeline?.time(this.userCursor);
                this.timeline?.play();
            }
        },
        userCursor() {
            if (!this.isUserCursorActive) return;

            this.showByUserCursorThrottled();
        },
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
                if (item.itemType === "spine") item.spine.parent?.removeChild(item.spine);
                if (item.itemType === "sprite") item.sprite.parent?.removeChild(item.sprite);

            });

            const reversedItems = [...newItems].reverse();
            reversedItems.forEach(item => {
            // newItems.forEach(item => {

                if (item.childFor) {
                    if (!item.placeholder_name) return;

                    const slotIndex = item.childFor.spine.skeleton.findSlotIndex(item.placeholder_name);
                    const slot = item.childFor.spine.skeleton.slots[slotIndex];

                    if (slot?.currentSprite) {
                        slot.currentSprite.texture = void (0);
                        // removeChildren && slot.currentSprite.removeChildren();

                        if (item.itemType === "spine") slot.currentSprite.addChild(item.spine);
                        if (item.itemType === "sprite") slot.currentSprite.addChild(item.sprite);

                    } else {
                        console.log("Ошибка вставки спайна в плейсхолдер");
                    }
                } else {
                    if (item.itemType === "spine") this.container.addChild(item.spine);
                    if (item.itemType === "sprite") this.container.addChild(item.sprite);
                }



            });

            const isTheSame = newItems.every(({ id }) => oldItems.some(item => item.id === id));

            if (!isTheSame) this.setAndPlayAnimation(reversedItems);
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
        showByUserCursor() {
            this.items.forEach(item => {

                if (item.itemType !== "spine") return;

                item.spine.autoUpdate = false;
                item.animations.filter((animation) => {
                    const trackTime = this.userCursor - animation.timeStart;
                    return trackTime >= 0 && trackTime <= animation.pickedAnimation.duration;
                }).forEach((animation) => {
                    const trackTime = this.userCursor - animation.timeStart;
                    const computedTrackTime = Math.min(Math.max(0, trackTime), animation.pickedAnimation.duration);


                    if (item.spine.state.tracks[0]?.animation?.name !== animation.pickedAnimation.name) {
                        item.spine.state.setAnimation(0, animation.pickedAnimation.name);
                    }

                    item.spine.state.tracks[0].trackTime = computedTrackTime;
                    item.spine.update(1 / 60);
                });
            });
        },
        onPointerDown(event) {
            this.inMove = true;
            this.moveStartPoint = { x: event.pageX, y: event.pageY };

            window.addEventListener("pointermove", this.onPointerMove);
            window.addEventListener("pointerup", this.onPointerUp);
            // window.addEventListener("pointerleave", this.onPointerUp);
        },
        onPointerUp(event) {
            this.inMove = false;
            this.moveStartPoint = null;

            window.removeEventListener("pointermove", this.onPointerMove);
            window.removeEventListener("pointerup", this.onPointerUp);
            // window.removeEventListener("pointerleave", this.onPointerUp);
        },
        onPointerMove(event) {
            if (!this.inMove || this.moveStartPoint === null) return;

            const deltaX = event.pageX - this.moveStartPoint.x;
            const deltaY = event.pageY - this.moveStartPoint.y;

            this.moveStartPoint.x = event.pageX;
            this.moveStartPoint.y = event.pageY;

            const item = this.$store.getters["layers/itemToRedact"];

            if (!item) return;

            this.$store.dispatch("layers/redactItemX", item.rawPositionX + deltaX * this.scale);
            this.$store.dispatch("layers/redactItemY", item.rawPositionY + deltaY * this.scale);

            // item.rawPositionX += deltaX * this.scale;
            // item.rawPositionY += deltaY * this.scale;
            //
            // item.positionX = Math.round(item.rawPositionX);
            // item.positionY = Math.round(item.rawPositionY);

            // item.rawPosition = {
            //     x: item.rawPosition.x + deltaX * this.scale,
            //     y: item.rawPosition.y + deltaY * this.scale
            // };

            // let displayObject;
            // if (item.spine) displayObject = item.spine;
            // if (item.sprite) displayObject = item.sprite;

            // if (displayObject) {
            //     displayObject.x += deltaX * this.scale;
            //     displayObject.y += deltaY * this.scale;
            // }
          // console.log(event);
        },
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

                if (item.itemType !== "spine") return;

                // item.spine.reset();
                // this.container.addChild(item.spine);
                item.spine.autoUpdate = false;
                item.spine.update(0);
                item.animations.forEach((animation) => {
                    const crutch = { trackTime: 0 };
                    let track;

                    item.spine.state.setAnimation(0, animation.pickedAnimation.name).trackTime = 0;
                    item.spine.update(1 / 60);

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
    display: flex

    &__info
        background-color: #fff
        color: #000
        font-size: 14px
        padding: 5px

    &__btn
        background-color: #fff
        box-shadow: none
        border: 1px solid #ccc
        margin: 0 5px

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