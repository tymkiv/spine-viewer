<template>
    <div
        class="editable"
        @click="$refs.input.focus()"
        @keydown.enter.prevent="$refs.input.focus()"
    >
        <div
            v-if="placeholder.length"
            class="editable__placeholder"
        >
            {{ placeholder }}
        </div>

        <input
            ref="input"
            class="editable__input"
            :type="type"
            :value="tempValue ?? (+value)?.toFixed(2)"
            @input="tempValue = $event.target.value"
            @keydown.enter.prevent="onEnter($event)"
            @keydown.esc.prevent="$refs.input.blur()"
            @blur="tempValue = null"
        >
    </div>
</template>



<script>
export default {
    name: "EditableInput",
    props: {
        value: { type: [String, Number], default: "" },
        placeholder: { type: String, default: "" },
        type: { type: String, default: "text" }
    },
    emits: ["change"],
    data: () => ({
        isEditActive: false,
        tempValue: null
    }),
    methods: {
        onEnter(event) {
            event.target.blur();
            // this.$refs.input.blur();
            this.$emit("change", event);
        }
    }
};
</script>

<style scoped lang="sass">
.editable
    height: 30px
    padding: 0 5px
    min-width: 30px
    //background-color: #F4F5F5
    background-color: var(--color-light)
    box-shadow: inset 0 0 2px rgba(17,17,17,.33)
    display: flex
    flex-direction: row
    justify-items: center
    cursor: pointer
    border-radius: 5px
    &__placeholder
        color: #BCBCBC
        padding-right: 4px
        display: flex
        align-items: center
        flex-shrink: 0
    &__input
        border: none
        background: none
        outline: none
        width: 100%
        flex-grow: 1
        padding: 0
        text-align: center
</style>