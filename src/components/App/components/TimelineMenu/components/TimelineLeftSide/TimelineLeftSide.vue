<template>
    <div class="wrapper">
        <div class="header">
            Spines
        </div>
        <div
            ref="scroller"
            class="list-wrapper"
            @scroll="$emit('onscroll', $event.target.scrollTop)"
        >
            <transition-group
                name="list"
                tag="ul"
                class="list"
            >
                <li
                    v-for="(item, index) in items"
                    :key="item.id"
                    class="list-item"
                    :style="{ height: `${itemsHeight[index]}px` }"
                >
                    <div class="list-item__wrapper">
                        <div class="list-item__plate">
                            <h2 class="list-item__name">
                                {{ item.name }}
                            </h2>
                        </div>
                    </div>
                </li>
            </transition-group>
        </div>
    </div>
</template>

<script>

export default {
    props: {
        scrollTop: {
            type: Number,
            required: true
        },
        items: {
            type: Array,
            required: true
        }
    },
    emits: ["onscroll"],
    computed: {
        itemsHeight() {
            return this.items.map((item) => this.getHeight(item));
        }
    },
    watch: {
        scrollTop() {
            this.$refs.scroller.scrollTop = this.scrollTop;
        }
    },
    methods: {
        getHeight(item) {
            const height = 90;

            return height * (item.animations?.length + 1);
        }
    }
};
</script>

<style scoped lang="sass">
.list-enter-from, .list-leave-to
    opacity: 0
    height: 0 !important
    //transform: translateY(-100%)
.wrapper
    overflow: hidden
    box-shadow: var(--shadow)
    height: 100%
    background-color: var(--color-light)
    position: relative
    z-index: 10

.header
    height: 25px
    display: flex
    align-items: center
    padding: 0 10px
    font-size: 14px
    position: relative
    box-shadow: var(--shadow)
    background-color: var(--color-light)

.list-wrapper
    overflow: scroll
    height: calc(100% - 25px)
.list-item
    transition: all 0.3s ease
    &__wrapper
        padding: 20px 5px 40px
        box-sizing: border-box
        height: 100%
    &__plate
        border-radius: 5px
        box-shadow: var(--shadow)
        height: 30px
        display: flex
        align-items: center
        padding: 0 10px
        font-size: 14px
        position: sticky
        top: 20px

        //flex-shrink: 0
    &__name
        white-space: nowrap
        text-overflow: ellipsis
        overflow: hidden
        line-height: initial
</style>