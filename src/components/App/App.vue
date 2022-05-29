<template>
    <div
        :class="{'grabbing': $store.state.grabbing}"
    >
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

                    <split-pane min-size="20"></split-pane>

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
import { Splitpanes as SplitContainer, Pane as SplitPane } from "splitpanes";
import SettingsMenu from "../SettingsMenu";
import TopMenu from "../TopMenu";
import LayersMenu from "../LayersMenu";
import TimelineMenu from "../TimelineMenu";
import ResourcesMenu from "../ResourcesMenu";
import "splitpanes/dist/splitpanes.css";

export default {
    components: {
        SplitContainer,
        SplitPane,
        SettingsMenu,
        TopMenu,
        LayersMenu,
        ResourcesMenu,
        TimelineMenu
    },
    mounted() {
        window.addEventListener("mousemove", this.appMousemove);
        window.addEventListener("mouseup", this.appMouseup);
        window.addEventListener("click", this.appClick);
        window.addEventListener("resize", this.appResize);
    },
    unmounted() {
        window.removeEventListener("mousemove", this.appMousemove);
        window.removeEventListener("mouseup", this.appMouseup);
        window.removeEventListener("click", this.appClick);
    },
    methods: {
        appClick(event) {
            this.$store.state.appClickListeners.forEach(cb => cb(event));
        },
        appMousemove(event) {
            this.$store.state.appListeners["mousemove"]?.forEach(cb => cb(event));
        },
        appMouseup(event) {
            this.$store.state.appListeners["mouseup"]?.forEach(cb => cb(event));
        },
        appResize(event) {
            this.$store.state.appListeners["resize"]?.forEach(cb => cb(event));
        }
    }
};
</script>

<style scoped lang="sass">
.split-container
    height: calc(100vh - 80px)
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
