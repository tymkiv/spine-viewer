<template>
    <div class="lm">
        <div class="lm__wrapper">
            <h2 class="lm__top">
                Layers
            </h2>
            <div class="lm__list-wrapper">
                <layers-list />
            </div>
        </div>
    </div>
</template>

<script>
import LayersList from "./components/LayersList";

export default {
    components: { LayersList }
};
</script>

<style scoped lang="sass">
.lm
    height: 100%
    width: 100%

    position: relative
    z-index: 10
    box-shadow: var(--shadow)

    &__wrapper
        overflow: hidden
        height: 100%

    &__top
        display: flex
        align-items: center
        height: 25px
        padding: 0 10px
        box-shadow: var(--shadow)
        font-weight: 600
        font-size: 14px
        position: relative
        z-index: 10
        background-color: var(--color-light)

    &__list-wrapper
        overflow: auto
        height: calc(100% - 25px)
</style>
