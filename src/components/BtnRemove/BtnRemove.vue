<template>
    <button class="remove-btn" :class="{'stop': $store.state.grabbing}"></button>
</template>



<style scoped lang="sass">
.remove-btn
    width: 30px
    height: 30px
    box-shadow: none
    cursor: pointer
    background: none
    border: none
    outline: none
    position: relative

    &:before, &:after
        content: ""
        width: 14px
        height: 14px
        opacity: 1
        background-image: url("./resources/trash.svg")
        background-position: center
        background-repeat: no-repeat
        background-size: contain
        position: absolute
        bottom: 8px
        left: 8px

    &:after
        height: 18px
        opacity: 0
        background-image: url("./resources/trash-open.svg")

    &:not(.stop):hover
        &:before
            opacity: 0
        &:after
            opacity: 1


</style>