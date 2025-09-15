<template>
    <div
        class="container"
        :class="{ 'is-open': isOpened }"
    >
        <div
            class="container__title"
        >
            <div
                class="container__title__icon"
                :class="{ 'is-open': isOpened }"
                role="button"
                :aria-expanded="String(isOpened)"
                tabindex="0"
                @click="toggle"
                @keydown.enter.prevent="toggle"
                @keydown.space.prevent="toggle"
            >
            </div>
            <div class="container__title__name">
                {{ title }}
            </div>
        </div>
        <CollapsibleContainer
            ref="container"
            :default-open="defaultOpen"
        >
            <slot />
        </CollapsibleContainer>
    </div>
</template>

<script>
import CollapsibleContainer from "../CollapsibleContainer/CollapsibleContainer.vue";

export default {
    name: "EditBlockCollapsibleContainer",
    components: { CollapsibleContainer },
    props: {
        title: { type: String, required: true },
        defaultOpen: { type: Boolean, default: true }
    },
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
.container
    &__title
        height: 55px
        display: flex
        flex-direction: row
        align-items: center
        gap: 10px
        cursor: pointer
        user-select: none
        &__icon
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
        &__name
            font-weight: 600
            color: #111
</style>
