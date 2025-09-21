<template>
    <div class="settings-menu">

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

        <div class="title">
            created by v.tymkiv for kendoo with ❤️
        </div>

    </div>
</template>

<style scoped lang="sass">
.settings-menu
    height: 25px
    background-color: var(--color-dark)
    display: flex
    align-items: center

.title
    margin-left: auto
    font-size: 8px
    padding: 0 10px
.boot-center
    display: flex
    align-items: center
    height: 100%
    padding: 0 10px
.boot-label
    display: flex
    margin-right: 10px
    align-items: center
    input
        opacity: 0
        position: absolute
        width: 1px
        height: 1px
        visibility: hidden
    .fake-btn
        display: flex
        align-items: center
        height: 18px
        padding: 0 5px
        box-shadow: var(--shadow)
        border-radius: 5px
        font-size: 12px
        font-weight: 600
        cursor: pointer
        background-color: var(--color-light)
        &:hover
            background-color: var(--color-dark)
        &:active
            box-shadow: inset var(--shadow)
</style>
<script>
export default {
    emits: ["on-load-items"],
    methods: {
        onChange(event) {
            this.$emit("on-load-items", event.target.files);
            event.target.files = null;
            event.target.value = "";
        }
    }
};
</script>