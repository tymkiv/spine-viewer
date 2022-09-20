<template>

    <div class="redact">
        <h2 class="redact__top">
            Edit center
        </h2>
        <template v-if="$store.getters['layers/itemToRedact']">
            <!--        <button class="redact-center__close" @click="$store.dispatch('layers/unselectItemToRedact')"> x </button>-->
            <label class="name">
                <span class="text">Name:</span>
                <input
                    ref="redact-name"
                    type="text"
                    :value="$store.getters['layers/itemToRedact'].name"
                    @input="redactItem($event.target.value)"
                >
            </label>

        </template>

        <template v-if="parent">
            <label class="placeholder">
                <span class="text">Placeholder:</span>
                <select @change="placeholderChange($event)" :value="this.$store.getters['layers/itemToRedact'].placeholder_name">
                    <option :value="undefined"> select placeholder </option>
                    <option v-for="slot in parent.spineData.slots" :value="slot.name"> {{ slot.name }} </option>
                </select>
            </label>

        </template>
    </div>


</template>

<script>
export default {
    data() {
        return {
        };
    },
    computed: {
        child() {
            return this.$store.getters["layers/timelineItems"].find(({ id }) => id === this.$store.getters["layers/itemToRedact"]?.id);
        },
        parent() {
            return this.child?.childFor;
        }
    },
    watch: {

    },
    methods: {
        redactItem(name) {
            this.$store.dispatch("layers/redactItem", name);
        },
        placeholderChange(event) {
            this.$store.dispatch("layers/changePlaceholder", { item: this.$store.getters["layers/itemToRedact"], placeholder: event.target.value })
        }
    }
}
</script>

<style scoped lang="sass">
.redact
    //padding: 10px
    font-size: 14px
    overflow: hidden
    //width: max-content
    height: calc(100% - 20px)
    background-color: var(--color-light)
    box-shadow: var(--shadow)
    min-width: calc(100% - 20px)
    position: relative
    &__top
        display: flex
        align-items: center
        height: 25px
        padding: 0 10px
        box-shadow: var(--shadow)
        font-weight: 600
        font-size: 14px
        position: relative
        z-index: 10
        background-color: var(--color-light)

input, select, option
    font-size: 14px
    display: block
    flex-shrink: 1
    width: 150px

.name, .placeholder
    display: flex
    height: 40px
    align-items: center
    padding: 0 10px

.text
    color: inherit
    white-space: nowrap
    text-overflow: ellipsis
    font-size: 14px
    line-height: initial
    overflow: hidden
    padding-right: 10px
</style>
