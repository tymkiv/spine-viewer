<template>
    <div class="probable-animation-event">
        <div class="probable-animation-event__name-container">
            <CopyButton :value="name" />
            <span class="probable-animation-event__name">{{ name }}</span>
        </div>

        <div class="probable-animation-event__start-container">
            <span class="probable-animation-event__start-title">start: </span>
            <span class="probable-animation-event__start-content">{{ start }}</span>
        </div>
    </div>
</template>

<script>

import CopyButton from "../CopyButton/CopyButton.vue";

export default {
    name: "ProbableAnimationEvent",
    components: { CopyButton },
    props: {
        name: { type: String, required: true },
        start: { type: Number, required: true }
    }
};
</script>

<style scoped lang="sass">
.probable-animation-event
    display: grid
    height: 40px
    padding: 0 20px
    align-items: center
    white-space: nowrap
    //background-color: var(--color-dark)
    background-color: #dfdfe0
    grid-template-columns: minmax(0, 2fr) minmax(0, 1fr)
    position: relative
    &:after
        content: ""
        position: absolute
        left: 0
        right: 0
        bottom: 0
        height: 1px
        background-color: #D9D9D9

    &__name-container
        position: relative
        display: flex
        align-items: center
        gap: 6px
        //justify-content: center
        &:after
            content: ""
            position: absolute
            right: 0
            top: -5px
            bottom: -5px
            width: 1px
            background-color: #D9D9D9

    &__name
        display: block
        text-overflow: ellipsis
        overflow: hidden

    &__start-container
        padding: 0 5px
        display: flex
        align-items: center
        justify-content: center

    &__start-title
        margin-right: 5px
</style>
