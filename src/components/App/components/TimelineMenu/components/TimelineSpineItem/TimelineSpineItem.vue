<template>
    <transition-group
        name="list"
        tag="ul"
        class="list"
    >
        <li
            v-for="animation in animations"
            :key="animation.id"
            class="list-item"
        >
            <track-element
                :scroller="scroller"
                :picked-animation="animation.pickedAnimation"
                :time-start="animation.timeStart"
                :probable-animations="probableAnimations"
                @scroll-left="(value) => $emit('scrollLeft', value)"
                @remove-click="$emit('removeClick', animation)"
                @update-time-start="value => updateTimeStart(animation, value)"
                @update-picked-animation="value => updatePickedAnimation(animation, value)"
            />
        </li>
    </transition-group>
    <div class="add-btn">
        <button
            class="add-btn__btn"
            @click="$emit('addClick')"
        >
            Add animation
        </button>
    </div>
</template>

<script>
import TrackElement from "../TrackElement";
export default {
    components: { TrackElement },
    props: {
        scroller: {
            type: [null, HTMLDivElement],
            required: true
        },
        animations: {
            type: Array,
            required: true
        },
        probableAnimations: {
            type: Array,
            required: true
        }
    },
    emits: ["scrollLeft", "addClick", "removeClick"],
    methods: {
        updateTimeStart(animation, value) {
            animation.timeStart = value;
            this.$store.getters["app/listeners"].restart?.forEach(cb => cb());
        },
        updatePickedAnimation(animation, value) {
            animation.pickedAnimation = this.probableAnimations.find(probableAnimation => probableAnimation.id === value);
            this.$store.getters["app/listeners"].restart?.forEach(cb => cb());
        }
    }

};
</script>

<style scoped lang="sass">
.list-enter-from, .list-leave-to
    opacity: 0
    height: 0 !important
    transform: translateY(-90px)
    will-change: transform

.list-item
    transition: all 0.3s
    height: 90px
    overflow: hidden

.add-btn
    padding: 20px 20px 40px 20px

    &__btn
        height: 30px
        padding: 0 10px
        border-radius: 5px
        box-shadow: var(--shadow)
        display: flex
        align-items: center
        font-size: 14px
        border: none
        font-weight: 600
        cursor: pointer
        background-color: var(--color-light)
        &:hover
            background-color: var(--color-dark)
        &:active
            box-shadow: inset var(--shadow)
</style>