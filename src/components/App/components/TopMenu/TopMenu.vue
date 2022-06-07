<template>
    <div class="top-menu">
        <div class="top-menu__shadow" />

        <div class="manage-center">
            <button
                class="btn btn_accent"
                @click="$store.dispatch('app/setPlay', !$store.getters['app/play'])"
            >
                <template v-if="!$store.getters['app/play']">Play</template>
                <template v-else>Pause</template>
            </button>
            <button
                class="btn"
                @click="$store.getters['app/listeners'].restart?.forEach(cb => cb())"
            >
                Restart
            </button>

            <label class="label">
                <input class="checkbox" type="checkbox" :checked="$store.getters['app/loop']" @change="$store.dispatch('app/setLoop', $event.target.checked)">
                <span class="fake-checkbox" />
                <span class="name"> Loop </span>
            </label>


        </div>

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
    z-index: 20

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

.manage-center
    display: flex
    align-items: center
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
    margin-left: 10px
    min-width: 75px
    &:hover
        background-color: var(--color-dark)
    &:active
        box-shadow: inset var(--shadow)
    &_accent
        background-color: var(--color-accent)
        color: #fff
        &:hover
            background-color: var(--color-accent-hover)


.label
    height: 40px
    padding: 0 10px
    display: flex
    align-items: center
    box-sizing: border-box
    width: 100%
    cursor: pointer

.checkbox
    position: absolute
    opacity: 0
    visibility: hidden
    width: 1px
    height: 1px

.fake-checkbox
    display: block
    width: 14px
    height: 14px
    margin-right: 10px
    position: relative
    flex-shrink: 0
    &:after, &:before
        content: ""
        position: absolute
        inset: 0
        background-image: url("resources/checkbox.svg")
        opacity: 1

    &:before
        background-image: url("resources/checkbox-active.svg")
        opacity: 0

.checkbox:checked + .fake-checkbox
    &:after
        opacity: 0
    &:before
        opacity: 1

.name
    font-size: 14px
    display: block
    margin-right: auto
    white-space: nowrap
    overflow: hidden
    text-overflow: ellipsis
    line-height: initial
    font-weight: 600
</style>
