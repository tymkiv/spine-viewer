<template>
    <div class="top-menu">
        <div class="top-menu__shadow"></div>
    </div>
</template>

<style scoped lang="sass">
.top-menu
    height: 55px
    position: relative
    background-color: #eaeaeb
    overflow: hidden

    &__shadow
        position: absolute
        top: 0
        bottom: 0
        right: -2px
        left: -2px
        box-shadow: inset var(--shadow)
        pointer-events: none
</style>
