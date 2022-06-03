<template>
    <div class="top-menu">
        <div class="top-menu__shadow" />

        <div class="manage-center" />

        <div class="redact-center">
            <label
                v-if="itemToRedact"
                @click.stop
            >
                Name:
                <input
                    type="text"
                    :value="itemToRedact.name"
                    @input="redactItem($event.target.value)"
                    @keydown.enter="$event.target.blur()"
                >
            </label>
        </div>

        <input
            type="file"
            multiple
            webkitdirectory
            directory
            @change="onChange($event)"
        >

        <input
            type="file"
            multiple
            @change="onChange($event)"
        >
    </div>
</template>

<script>
export default {
    emits: ["on-load-items"],

    computed: {
        itemToRedact() {
            return this.$store.getters["layers/itemToRedact"];
        }
    },

    methods: {
        redactItem(name) {
            this.$store.dispatch("layers/redactItem", name);
        },
        onChange(event) {
            this.$emit("on-load-items", event.target.files);
            event.target.files = null;
            event.target.value = "";
        }
    }
};
</script>

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
