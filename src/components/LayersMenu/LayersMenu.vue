<template>
    <div class="lm">
        <div class="lm__wrapper">
            <h2 class="lm__top">Layers</h2>
            <div class="lm__list-wrapper">
                <layers-list />
                <hr />
                <h2>{{ title }}</h2>
                <div v-for="group in $store.state.items" :key="group.id">
                    {{ group.name }}
                    <div style="padding: 0 20px" v-for="item in group.items" :key="item.id">
                        {{ item.name }}
                        <div style="padding: 0 20px" v-for="item2 in item.items" :key="item2.id">
                            {{ item2.name }}
                        </div>
                    </div>
                </div>

                <hr />
                Selected item:
                {{ $store.getters.selectedItem }}
            </div>
        </div>
    </div>
</template>

<script>
import LayersList from "../LayersList";

export default {
    components: { LayersList },

    data() {
        window.t = this;

        return {
            title: "some title"
        };
    },
    computed: {
        // items2() {
        //     return store.state.count
        // }
    }
};
</script>

<style scoped lang="sass">
.lm
    height: 100%
    width: 100%

    box-shadow: var(--shadow)

    &__wrapper
        overflow: hidden
        height: 100%

    &__top
        display: flex
        align-items: center
        height: 25px
        padding: 0 20px
        box-shadow: var(--shadow)
        font-weight: 600
        font-size: 14px

    &__list-wrapper
        overflow: auto
        height: calc(100% - 25px)
</style>
