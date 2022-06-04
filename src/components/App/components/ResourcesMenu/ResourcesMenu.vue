<template>
    <div class="resources-menu">
        <div class="resources-menu__header">
            <h2 class="resources-menu__title">
                Resources
            </h2>
            <button
                class="resources-menu__btn"
                @click="createClick"
            >
                Create layer(s)
            </button>
        </div>

        <div class="resources-menu__list-wrapper">
            <resources-list />
        </div>
    </div>
</template>

<script>
import ResourcesList from "./components/ResourcesList/ResourcesList";
import { v4 } from "uuid";
import * as PIXI from "pixi.js";
export default {
    components: { ResourcesList },
    methods: {
        createClick() {
            const layers = this.$store.getters["resources/checkedItems"].map(resource => {
                const layer = {
                    type: "item",
                    name: resource.name,
                    id: v4()
                };
                if (resource.spineData) {

                    const probableAnimations = resource.spineData.animations.map(animation => ({
                        name: animation.name,
                        duration: animation.duration,
                        id: v4()
                    }));

                    layer.spindeData = resource.spineData;
                    layer.spine = new PIXI.spine.Spine(resource.spineData);
                    layer.probableAnimations = probableAnimations;
                    layer.animations = [{ timeStart: 0, pickedAnimation: probableAnimations[0], id: v4() }];
                }

                if (resource.texture) {
                    layer.sprite = new PIXI.Sprite(resource.texture);
                }

                return layer;
            });

            const scene = {
                type: "scene",
                name: "Scene",
                id: v4(),
                items: layers
            };
            if (layers.length) {
                this.$store.dispatch("layers/loadItems", [scene]);
            }
        }
    }
};
</script>

<style scoped lang="sass">
.resources-menu
    height: 100%
    width: 100%
    overflow: hidden
    box-shadow: var(--shadow)


    &__header
        height: 55px
        box-shadow: var(--shadow)
        display: flex
        align-items: center
        justify-content: space-between
        padding: 0 10px
        position: relative
        z-index: 10
        background-color: var(--color-light)

    &__title
        font-size: 14px
        font-weight: 600
        margin-right: 10px

    &__btn
        height: 30px
        box-shadow: var(--shadow)
        cursor: pointer
        border: none
        border-radius: 5px
        align-items: center
        padding: 0 10px
        font-size: 14px
        font-weight: 600
        display: flex
        overflow: hidden
        text-overflow: ellipsis
        white-space: nowrap
        background-color: var(--color-light)
        &:hover
            background-color: var(--color-dark)
        &:active
            box-shadow: inset var(--shadow)

    &__list-wrapper
        overflow: auto
        height: calc(100% - 55px)
</style>
