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
    </div>
</template>

<script>
export default {
    computed: {
        itemToRedact() {
            return this.$store.getters["layers/itemToRedact"];
        }
    },

    methods: {
        redactItem(name) {
            this.$store.dispatch("layers/redactItem", name);
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
