<template>
    <div>
        <div class="darken" />
        <div class="border" />
        <div class="text">
            Drop your files here
        </div>
    </div>
</template>

<style scoped lang="sass">
.darken
    position: absolute
    inset: 0
    background-color: rgba(#111, 0.8)
.border
    position: absolute
    inset: 10%
    border: 2px dashed var(--color-light)
.text
    position: absolute
    top: 50%
    left: 50%
    font-size: 24px
    font-weight: 600
    transform: translate(-50%, -50%)
    color: var(--color-dark)
</style>