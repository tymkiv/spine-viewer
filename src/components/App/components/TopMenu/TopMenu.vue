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

        <div class="boot-center">
            <label class="boot-label">
                <input
                    type="file"
                    multiple
                    webkitdirectory
                    directory
                    @change="onChange($event)"
                >
                <span class="fake-btn">Load directory</span>
            </label>

            <label class="boot-label">
                <input
                    type="file"
                    multiple
                    @change="onChange($event)"
                >
                <span class="fake-btn">Load files</span>
            </label>
        </div>
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
    background-color: var(--color-dark)
    overflow: hidden
    display: flex
    align-items: center

    &__shadow
        position: absolute
        top: 0
        bottom: 0
        right: -2px
        left: -2px
        box-shadow: inset var(--shadow)
        pointer-events: none

.boot-center
    display: flex
    align-items: center
    margin-left: auto
.boot-label
    display: block
    margin-right: 10px
    input
        opacity: 0
        position: absolute
        width: 1px
        height: 1px
        visibility: hidden
    .fake-btn
        display: flex
        align-items: center
        height: 30px
        padding: 0 10px
        box-shadow: var(--shadow)
        border-radius: 5px
        font-size: 14px
        font-weight: 600
        cursor: pointer
        background-color: var(--color-light)
        &:hover
            background-color: var(--color-dark)
        &:active
            box-shadow: inset var(--shadow)
</style>
