<template>
    <div class="resources-menu">
        <div class="resources-menu__header">
            <h2 class="resources-menu__title">
                Resources
            </h2>
            <button class="resources-menu__btn">
                Create layer(s)
            </button>
        </div>

        <div class="resources-menu__list-wrapper">
            <resources-list />
        </div>
    </div>
</template>

<script>
import ResourcesList from "./components/ResourcesList/ResourcesList";
export default {
    components: { ResourcesList }
};
</script>

<style scoped lang="sass">
.resources-menu
    height: 100%
    width: 100%
    overflow: hidden
    box-shadow: var(--shadow)


    &__header
        height: 55px
        box-shadow: var(--shadow)
        display: flex
        align-items: center
        justify-content: space-between
        padding: 0 10px
        position: relative
        z-index: 10

    &__title
        font-size: 14px
        font-weight: 600
        margin-right: 10px

    &__btn
        height: 30px
        box-shadow: var(--shadow)
        cursor: pointer
        border: none
        border-radius: 5px
        align-items: center
        padding: 0 10px
        font-size: 14px
        font-weight: 600
        display: flex
        overflow: hidden
        text-overflow: ellipsis
        white-space: nowrap

    &__list-wrapper
        overflow: auto
        height: calc(100% - 55px)
</style>
