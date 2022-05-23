<template>
    <div class="lm">
        <div class="lm__wrapper">
            <h2 class="lm__top">Layers</h2>
            <div class="lm__list-wrapper">
                <layers-list v-model:title="title" v-model:items="items" />
                <hr />
                <h2>{{ title }}</h2>
                <div v-for="group in items" :key="group.id">
                    {{ group.name }}
                    <div v-for="item in group.items" :key="item.id">
                        {{ item.name }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import LayersList from "../LayersList";
import { v4 } from "uuid";
export default {
    components: { LayersList },

    data() {
        window.t = this;
        return {
            title: "some title",
            items: [
                {
                    id: v4(),
                    name: "Scene name 1",
                    type: "group",
                    items: [
                        { id: v4(), name: "Spline name 1", type: "item", items: [] },
                        { id: v4(), name: "Spline name 2", type: "item", items: [] },
                        { id: v4(), name: "Spline name 3", type: "item", items: [] }
                    ]
                },
                {
                    id: v4(),
                    name: "Scene name 2",
                    type: "group",
                    items: [
                        { id: v4(), name: "Spline name 4", type: "item", items: [] },
                        { id: v4(), name: "Spline name 5", type: "item", items: [] },
                        { id: v4(), name: "Spline name 6", type: "item", items: [] }
                    ]
                },
                {
                    id: v4(),
                    name: "Scene name 3",
                    type: "group",
                    items: [
                        { id: v4(), name: "Spline name 7", type: "item", items: [] },
                        { id: v4(), name: "Spline name 8", type: "item", items: [] },
                        { id: v4(), name: "Spline name 9", type: "item", items: [] }
                    ]
                }
            ]
            // items: [
            //     {
            //         id: 1,
            //         name: "name-1",
            //         group: "gr1",
            //         groupId: v4()
            //     },
            //     {
            //         id: 2,
            //         name: "name-2",
            //         group: "gr2",
            //         groupId: v4()
            //     },
            //     {
            //         id: 3,
            //         name: "name-3",
            //         group: "gr3",
            //         groupId: v4()
            //     },
            //     {
            //         id: 4,
            //         name: "name-4",
            //         group: "gr4",
            //         groupId: v4()
            //     },
            //     {
            //         id: 5,
            //         name: "name-5",
            //         group: "gr5",
            //         groupId: v4()
            //     },
            //     {
            //         id: 6,
            //         name: "name-6",
            //         group: "gr6",
            //         groupId: v4()
            //     }
            // ]
        };
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

    &__list-wrapper
        overflow: auto
        height: calc(100% - 25px)
</style>
