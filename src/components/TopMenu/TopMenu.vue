<template>
    <div class="top-menu">
        <div class="top-menu__shadow"></div>

        <div class="manage-center"></div>

        <div class="redact-center">
            <label v-if="$store.getters.selectedItem.redact" @click.stop>
                Name:
                <input type="text" :value="redact" @input="redactName($event.target.value)" @keydown.enter="$event.target.blur()">
            </label>
        </div>
    </div>
</template>

<script>
export default {
    computed: {
        redact() {
            return this.$store.getters.selectedItem.redact.name;
        }
    },

    methods: {
        redactName(value) {
            this.$store.commit("redactName", { value });
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
