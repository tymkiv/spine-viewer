<template>
    <div class="editable">
        <div
            v-if="!isEditActive"
            class="editable__text"
            tabindex="0"
            @dblclick="startEdit"
            @keydown.enter.prevent="startEdit"
        >
            {{ modelValue }}
        </div>

        <input
            v-else
            ref="input"
            class="editable__input"
            type="text"
            :value="modelValue"
            @input="$emit('update:modelValue', $event.target.value)"
            @keydown.enter.prevent="stopEdit"
            @keydown.esc.prevent="stopEdit"
            @blur="stopEdit"
        >
    </div>
</template>

<script>
export default {
    name: "EditableText",
    props: {
        modelValue: { type: String, default: "" }
    },
    emits: ["update:modelValue"],
    data: () => ({
        isEditActive: false
    }),
    methods: {
        startEdit() {
            this.isEditActive = true;
            this.$nextTick(() => this.$refs.input?.focus());
        },
        stopEdit() {
            this.isEditActive = false;
        }
    }
};
</script>

<style scoped lang="sass">
.editable
    color: inherit
    &__text
        cursor: pointer
        border-bottom: 1px solid transparent
        transform: translateY(1px)
        color: inherit
    &__input
        border: none
        border-bottom: 1px solid #D9D9D9
        background: none
        outline: none
        width: 100%
        padding: 0
        transform: translateY(1px)
</style>