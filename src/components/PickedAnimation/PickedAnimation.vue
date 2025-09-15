<template>
    <div class="picked-animation">
        <div class="picked-animation__name-container">
            <CopyButton :value="name" />
            <span class="picked-animation__name">{{ name }}</span>
        </div>

        <div class="picked-animation__duration-container">
            <span class="picked-animation__duration-title">dur: </span>
            <span class="picked-animation__duration-content">{{ duration }}</span>
        </div>

        <div class="picked-animation__start-container">
            <span class="picked-animation__start-title">start: </span>
            <span class="picked-animation__start-content">
                <EditableInput :value="start" @change="$emit('onChangeStart', $event)" style="display: inline-flex; width: 30px; background: var(--color-dark)" />
            </span>
        </div>
    </div>
</template>

<script>
import CopyButton from "../CopyButton/CopyButton.vue";
import EditableInput from "../EditableInput/EditableInput.vue";

export default {
    name: "PickedAnimation",
    components: { CopyButton, EditableInput },
    props: {
        name: { type: String, required: true },
        duration: { type: Number, required: true },
        start: { type: Number, required: true }
    },
    emits: ["onChangeStart"]
};
</script>

<style scoped lang="sass">
.picked-animation
    display: grid
    height: 40px
    padding: 0 10px
    align-items: center
    white-space: nowrap
    background-color: var(--color-dark)
    grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr) minmax(0, 1fr)
    position: relative
    &:not(:last-child)
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

    &__duration-container
        position: relative
        padding: 0 5px
        display: flex
        justify-content: center
        &:after
            content: ""
            position: absolute
            right: 0
            top: -5px
            bottom: -5px
            width: 1px
            background-color: #D9D9D9

    &__duration-title
        text-overflow: ellipsis
        display: block
        overflow: hidden
        margin-right: 5px

    &__start-container
        padding: 0 5px
        display: flex
        align-items: center
        justify-content: center

    &__start-title
        margin-right: 5px
</style>
