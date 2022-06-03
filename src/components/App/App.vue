<template>
    <div
        :class="{'grabbing': cursorGrabbing}"
        @mousemove="dispatch($event)"
        @mouseup="dispatch($event)"
        @click="dispatch($event)"

        @dragenter.capture="dispatch($event)"
        @dragover.capture="dispatch($event)"
        @dragleave.capture="dispatch($event)"
        @drop.capture="dispatch($event)"
    >
        <boot-menu
            v-if="$store.getters['app/bootOver']"
            class="boot-menu"
        />

        <settings-menu />

        <top-menu />

        <split-container
            :dbl-click-splitter="false"
            horizontal
            class="split-container"
        >
            <split-pane>
                <split-container
                    :dbl-click-splitter="false"
                >
                    <split-pane
                        size="20"
                        max-size="40"
                        min-size="5"
                    >
                        <layers-menu />
                    </split-pane>

                    <split-pane min-size="20" />

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
import "splitpanes/dist/splitpanes.css";
import { Splitpanes as SplitContainer, Pane as SplitPane } from "splitpanes";
import BootMenu from "./components/BootMenu";
import SettingsMenu from "./components/SettingsMenu";
import TopMenu from "./components/TopMenu";
import LayersMenu from "./components/LayersMenu";
import TimelineMenu from "./components/TimelineMenu";
import ResourcesMenu from "./components/ResourcesMenu";
import BootManager from "./components/BootManager";

export default {
    components: {
        SplitContainer,
        SplitPane,
        BootMenu,
        SettingsMenu,
        TopMenu,
        LayersMenu,
        ResourcesMenu,
        TimelineMenu
    },
    computed: {
        cursorGrabbing() {
            console.log(this.$store.getters["app/cursorGrabbing"]);
            return this.$store.getters["app/cursorGrabbing"];
        }
    },
    mounted() {
        window.addEventListener("resize", this.dispatch);

        new BootManager(this.$store);
    },
    unmounted() {
        window.removeEventListener("resize", this.dispatch);
    },

    methods: {
        dispatch(event) {
            this.$store.getters["app/listeners"][event.type]?.forEach(cb => cb(event));
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
    z-index: 999
    pointer-events: none
</style>

<style lang="sass">
.grabbing, .grabbing *
    cursor: grabbing!important
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
