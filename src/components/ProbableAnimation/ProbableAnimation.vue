<template>
    <div class="probable-animation">
        <div class="probable-animation__name-container">
            <CopyButton :value="name" />
            <span class="probable-animation__name">{{ name }}</span>
        </div>

        <div class="probable-animation__duration-container">
            <span class="probable-animation__duration-title">dur: </span>
            <span class="probable-animation__duration-content">{{ duration }}</span>
        </div>

        <div class="probable-animation__events-container">
            <span class="probable-animation__events-title">events:  </span>
            <template v-if="events.length > 0">
                <span> {{ events.length }} </span>
                <span
                    class="probable-animation__events-button"
                    :class="{ 'is-open': isOpened }"
                    role="button"
                    :aria-expanded="String(isOpened)"
                    tabindex="0"
                    @click="toggle"
                    @keydown.enter.prevent="toggle"
                    @keydown.space.prevent="toggle"
                ></span>
            </template>
            <template v-else>
                <span> 0 </span>
            </template>

        </div>
    </div>
    <template v-if="events.length > 0">
        <CollapsibleContainer
            ref="container"
            :default-open="defaultOpen"
            :padding-bottom="0"
        >
            <ProbableAnimationEvent
                v-for="event in events"
                :key="event.id"
                :name="event.name"
                :start="+event.start.toFixed(2)"
            />
        </CollapsibleContainer>
    </template>
</template>

<script>
import CollapsibleContainer from "../CollapsibleContainer/CollapsibleContainer.vue";
import CopyButton from "../CopyButton/CopyButton.vue";
import EditableInput from "../EditableInput/EditableInput.vue";
import ProbableAnimationEvent from "../ProbableAnimationEvent/ProbableAnimationEvent.vue";

export default {
    name: "ProbableAnimation",
    components: { CollapsibleContainer, CopyButton, EditableInput, ProbableAnimationEvent },
    props: {
        name: { type: String, required: true },
        duration: { type: Number, required: true },
        events: { type: Array, default: () => [] },
        defaultOpen: { type: Boolean, default: false }
    },
    emits: ["onChangeStart"],
    data() {
        return {
            isOpened: this.defaultOpen
        };
    },
    methods: {
        toggle() {
            this.isOpened = !this.isOpened;
            this.$refs.container.toggle();
        }
    }
};
</script>

<style scoped lang="sass">
.probable-animation
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

    &__events-container
        padding: 0 5px
        display: flex
        align-items: center
        justify-content: center

    &__events-title
        margin-right: 5px
    &__events-button
        display: block
        width: 20px
        height: 20px
        background-color: transparent
        border: none
        box-shadow: none
        position: relative
        cursor: pointer
        flex-shrink: 0
        &:before, &:after
            content: ""
            position: absolute
            width: 14px
            height: 14px
            top: 3px
            left: 3px
            background-image: url("../../resources/opened-folder.svg")
            opacity: 0
            background-position: center
            background-repeat: no-repeat
            background-size: contain

        &:after
            background-image: url("../../resources/closed-folder.svg")
            width: 13px
            opacity: 1

        &.is-open
            &:before
                opacity: 1
            &:after
                opacity: 0
</style>
<script setup>
</script>