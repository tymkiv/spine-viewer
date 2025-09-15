<template>
    <button
        class="btn"
        :disabled="disabled"
        @click="$emit('onClick')"
    >
        {{ name }}
    </button>
</template>

<script>
export default {
    name: "DefaultButton",
    props: {
        name: { type: String, required: true },
        disabled: { type: Boolean, default: false }
    },
    emits: ["onClick"]
};
</script>

<style scoped lang="sass">
.btn
    display: flex
    align-items: center
    justify-content: center
    height: 30px
    padding: 0 10px
    box-shadow: var(--shadow)
    border-radius: 5px
    font-size: 14px
    font-weight: 600
    cursor: pointer
    background-color: var(--color-light)
    border: none
    &:hover
        background-color: var(--color-dark)
    &:active
        box-shadow: inset var(--shadow)
    &_accent
        background-color: var(--color-accent)
        color: #fff
        &:hover
            background-color: var(--color-accent-hover)
</style>