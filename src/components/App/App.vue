<template>
    <div @click="appClick">
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
                        size="60"
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
    methods: {
        appClick() {
            this.$store.state.appClickListeners.forEach(cb => cb());
        }
    }
};
</script>

<style scoped lang="sass">
.split-container
    height: calc(100vh - 80px)
</style>

<style lang="sass">
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
