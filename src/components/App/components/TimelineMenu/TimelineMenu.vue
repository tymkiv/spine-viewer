<template>
    <div class="timeline-menu">
        <split-container
            :dbl-click-splitter="false"
            class="split-container"
        >
            <split-pane
                size="20"
                max-size="60"
                min-size="5"
            >
                <timeline-left-side
                    :items="items"
                    :scroll-top="scrollTop"
                    @onscroll="onscroll"
                />
            </split-pane>

            <split-pane>
                <timeline-right-side
                    :items="items"
                    :scroll-top="scrollTop"
                    @onscroll="onscroll"
                />
            </split-pane>
        </split-container>
    </div>
</template>

<script>
import { Splitpanes as SplitContainer, Pane as SplitPane } from "splitpanes";
import TimelineLeftSide from "./components/TimelineLeftSide";
import TimelineRightSide from "./components/TimelineRightSide/TimelineRightSide";
import { flat } from "../../../../utils";

export default {
    components: {
        SplitContainer,
        SplitPane,
        TimelineLeftSide,
        TimelineRightSide
    },
    data() {
        return {
            scrollTop: 0
        };
    },
    computed: {
        items() {
            return flat(this.$store.getters["layers/sceneToDisplay"].items);
        }
    },
    methods: {
        onscroll(y) {
            this.scrollTop = y;
        }
    }
};
</script>

<style scoped lang="sass">
.timeline-menu
    height: 100%
    position: relative
    background-color: #fff
    box-shadow: var(--shadow)
    overflow: hidden

.split-container
    height: 100%
</style>
