<template>

    <div
        :class="{'grabbing': cursorGrabbing}"
        @click="dispatch($event)"

        @dragenter.capture.prevent="onDragenter($event)"
        @dragover.capture.prevent="onDragover($event)"
        @dragleave.capture.prevent="onDragleave($event)"
        @drop.capture.prevent="onDrop($event)"
    >
        <boot-overlay
            v-if="bootOver"
            class="boot-menu"
        />

        <settings-menu />

        <top-menu @on-load-items="handleFiles" />

        <split-container
            :dbl-click-splitter="false"
            horizontal
            class="split-container"
            @resize="$refs['scene-menu'].updateSize()"
        >
            <split-pane>
                <split-container
                    :dbl-click-splitter="false"
                    @resize="$refs['scene-menu'].updateSize()"
                >
                    <split-pane
                        size="20"
                        max-size="40"
                        min-size="5"
                    >
                        <layers-menu />
                    </split-pane>

                    <split-pane
                        min-size="20"
                    >
                        <scene-menu ref="scene-menu" />
                    </split-pane>

                    <split-pane
                        size="20"
                        max-size="40"
                        min-size="5"
                    >
                        <resources-menu />
                    </split-pane>
                </split-container>
            </split-pane>

            <split-pane
                size="30"
                max-size="90"
                min-size="5"
            >
                <timeline-menu />
            </split-pane>
        </split-container>
    </div>
</template>

<script>
import { Sketch } from "@ckpack/vue-color";
import "splitpanes/dist/splitpanes.css";
import { Splitpanes as SplitContainer, Pane as SplitPane } from "splitpanes";
import BootOverlay from "./components/BootOverlay";
import SettingsMenu from "./components/SettingsMenu";
import TopMenu from "./components/TopMenu";
import LayersMenu from "./components/LayersMenu";
import TimelineMenu from "./components/TimelineMenu";
import ResourcesMenu from "./components/ResourcesMenu";
import SceneMenu from "./components/SceneMenu";
import {
    fileReader,
    itemsReader,
    prepareItemsForLayersMenu,
    prepareItemsForResourceMenu
} from "../../BootManager";

export default {
    components: {
        SplitContainer,
        SplitPane,
        BootOverlay,
        SettingsMenu,
        TopMenu,
        LayersMenu,
        ResourcesMenu,
        TimelineMenu,
        SceneMenu,
        Sketch
    },
    data() {
        return {
            bootOver: false,
            colors: "#ffffff"
        };
    },
    computed: {
        cursorGrabbing() {
            return this.$store.getters["app/cursorGrabbing"];
        }
    },
    mounted() {
        window.addEventListener("resize", this.dispatch);
        window.addEventListener("mousemove", this.dispatch);
        window.addEventListener("mouseup", this.dispatch);

        this.$store.dispatch("app/addListener", { type: "resize", callback: () => this.$refs["scene-menu"].updateSize() });
    },
    unmounted() {
        window.removeEventListener("resize", this.dispatch);
        window.removeEventListener("mousemove", this.dispatch);
        window.removeEventListener("mouseup", this.dispatch);
    },


    methods: {
        dispatch(event) {
            this.$store.getters["app/listeners"][event.type]?.forEach(cb => cb(event));
        },
        showBootOver() {
            this.bootOver = true;
        },
        hideBootOver() {
            this.bootOver = false;
        },
        onDragenter(event) {
            if (event.dataTransfer.types.length) {
                event.stopPropagation();
                this.showBootOver();
            }
        },
        onDragover(event) {
            if (event.dataTransfer.types.length) {
                event.stopPropagation();
                this.showBootOver();
            }
        },
        onDragleave(event) {
            if (event.dataTransfer.types.length) {
                event.stopPropagation();
                this.hideBootOver();
            }
        },
        onDrop(event) {
            if (event.dataTransfer.types.length) {
                event.stopPropagation();
                this.hideBootOver();
                this.handleItems(event.dataTransfer.items);
            }
        },
        async handleItems(items) {
            const files = await itemsReader(items);

            this.prepareItems(files);
        },
        async handleFiles(rawFiles) {
            const files = await fileReader(rawFiles);

            this.prepareItems(files);
        },
        prepareItems(files) {
            const layersItems = prepareItemsForLayersMenu(files);
            const resourceItems = prepareItemsForResourceMenu(layersItems);

            this.$store.dispatch("layers/loadItems", layersItems);
            this.$store.dispatch("resources/loadItems", resourceItems);
            // this.$store.dispatch("layers/selectSceneToDisplay", this.$store.getters["layers/items"][])
        }

    }
};
</script>

<style scoped lang="sass">
.split-container
    height: calc(100vh - 80px)

.boot-menu
    position: absolute
    inset: 0
    z-index: 9999
    pointer-events: none
</style>

<style lang="sass">
.grabbing, .grabbing *
    cursor: grabbing!important

.splitpanes--horizontal .splitpanes__pane
    transition: none
.splitpanes__splitter
    position: relative

    &:before
        content: ""
        position: absolute
        left: 0
        top: 0
        z-index: 1

.splitpanes--vertical > .splitpanes__splitter
    min-width: 0
    &:before
        width: 5px
        height: 100%
        margin-left: - 3px

.splitpanes--horizontal > .splitpanes__splitter
    min-height: 0
    &:before
        height: 5px
        width: 100%
        margin-top: -3px

.splitpanes__pane
    overflow: visible
</style>
