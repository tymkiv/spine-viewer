<template>
    <div class="container">
        <div class="tri tri-up" @click="$emit('onTop')"></div>
        <div class="tri tri-right" @click="$emit('onRight')"></div>
        <div class="tri tri-down" @click="$emit('onBottom')"></div>
        <div class="tri tri-left" @click="$emit('onLeft')"></div>
    </div>
</template>

<script>
export default {
    name: "PositionStick",
    emits: ["onTop", "onBottom", "onLeft", "onRight"],
    methods: {

    }
};
</script>

<style scoped lang="sass">
.container
    position: relative
    width: 36px
    height: 36px

.tri

.tri-up
    position: absolute
    left: 12px
    top: 0
    width: 0
    height: 0
    border-left: 6px solid transparent
    border-right: 6px solid transparent
    border-bottom: 12px solid #D9D9D9
    cursor: pointer
    &:hover
        border-bottom-color: #bcbcbc
    &:active
        border-bottom-color: var(--color-accent)



.tri-right
    position: absolute
    left: 24px
    top: 12px
    width: 0
    height: 0
    border-top: 6px solid transparent
    border-bottom: 6px solid transparent
    border-left: 12px solid #D9D9D9
    cursor: pointer
    &:hover
        border-left-color: #bcbcbc
    &:active
        border-left-color: var(--color-accent)



.tri-down
    position: absolute
    left: 12px
    top: 24px
    width: 0
    height: 0
    border-left: 6px solid transparent
    border-right: 6px solid transparent
    border-top: 12px solid #D9D9D9
    cursor: pointer
    &:hover
        border-top-color: #bcbcbc
    &:active
        border-top-color: var(--color-accent)



.tri-left
    position: absolute
    left: 0px
    top: 12px
    width: 0
    height: 0
    border-top: 6px solid transparent
    border-bottom: 6px solid transparent
    border-right: 12px solid #D9D9D9
    cursor: pointer
    &:hover
        border-right-color: #bcbcbc
    &:active
        border-right-color: var(--color-accent)

</style>