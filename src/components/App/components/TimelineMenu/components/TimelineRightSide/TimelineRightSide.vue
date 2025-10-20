<template>
    <div class="wrapper">

        <div class="header">
            Timeline

            <div class="header__settings">
                <div class="header__settings__play">
                    <button
                        class="btn btn_accent"
                        :disabled="!$store.getters['layers/timelineItems'].length"
                        @click="$store.dispatch('app/setPlay', !$store.getters['app/play'])"
                    >
                        <template v-if="!$store.getters['app/play'] || !$store.getters['layers/timelineItems'].length ">
                            <svg width="18" height="20" viewBox="0 0 14 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M0 0V20L17.5 10L0 0Z" fill="black"/>
                            </svg>
                        </template>
                        <template v-else>
                            <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7.14292 0H0V20H7.14292V0Z" fill="black"/>
                                <path d="M17.1429 0H10V20H17.1429V0Z" fill="black"/>
                            </svg>
                        </template>
                    </button>
                </div>

                <div class="header__settings__restart">
                    <button
                        class="btn"
                        :disabled="!$store.getters['layers/timelineItems'].length"
                        @click="() => {$store.getters['app/listeners'].restart?.forEach(cb => cb()); $store.dispatch('app/setPlay', true)}"
                    >
                        <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clip-path="url(#clip0_429_11071)">
                                <path d="M12 2.99982C16.9706 2.99982 21 7.02925 21 11.9998C21 16.9704 16.9706 20.9998 12 20.9998C7.02944 20.9998 3 16.9704 3 11.9998C3 9.17255 4.30367 6.64977 6.34267 4.99982" stroke="#292929" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M3 4.49982H7V8.49982" stroke="#292929" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </g>
                            <defs>
                                <clipPath id="clip0_429_11071">
                                    <rect width="24" height="24" fill="white"/>
                                </clipPath>
                            </defs>
                        </svg>
                    </button>
                </div>

                <div class="header__settings__loop">
                    <label
                        class="btn"
                    >
                        <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 4L21 7M21 7L18 10M21 7H7C4.79086 7 3 8.79086 3 11M6 20L3 17M3 17L6 14M3 17H17C19.2091 17 21 15.2091 21 13" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <input class="checkbox" type="checkbox" :checked="$store.getters['app/loop']" @change="$store.dispatch('app/setLoop', $event.target.checked)">
                        <span class="fake-checkbox" />

                    </label>
                </div>


                <div class="header__settings__speed">
                    <span class="header__settings__speed__title">
                        speed
<!--                        <svg fill="#000000" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"-->
<!--                             width="800px" height="800px" viewBox="0 0 549.877 549.877"-->
<!--                             xml:space="preserve">-->
<!--                            <g>-->
<!--                                <g>-->
<!--                                    <path d="M90.198,422.875l-16.438,9.803c-0.43,0.248-3.089,0.143-7.287-2.545c-5.499-3.52-11.198-9.781-15.625-17.203-->
<!--                                        l-33.077-55.414c-2.697-4.543-8.578-6.016-13.11-3.309s-6.015,8.568-3.309,13.109l33.077,55.416-->
<!--                                        c5.986,10.021,13.703,18.369,21.735,23.504c5.891,3.777,11.686,5.67,17.002,5.67c3.739,0,7.248-0.936,10.404-2.82l16.428-9.801-->
<!--                                        c4.533-2.707,6.015-8.568,3.309-13.111C100.611,421.643,94.74,420.17,90.198,422.875z"/>-->
<!--                                    <path d="M376.346,445.223c-5.288,0-9.562,4.275-9.562,9.562v19.125c0,2.381-10.174,9.562-28.688,9.562h-64.547-->
<!--                                        c-5.288,0-9.562,4.275-9.562,9.562c0,5.289,4.275,9.562,9.562,9.562h64.547c27.263,0,47.812-12.336,47.812-28.688v-19.125-->
<!--                                        C385.908,449.506,381.634,445.223,376.346,445.223z"/>-->
<!--                                    <path d="M374.596,279.418l-43.289-16.792l100.999-51.819c13.264-8.654,16.247-25.915,6.675-38.527l-28.286-33.201-->
<!--                                        c-3.921-7.841-11.943-13.283-21.314-13.283h-229.5c-13.206,0-23.906,10.701-23.906,23.906c0,13.206,10.701,23.906,23.906,23.906-->
<!--                                        h159.684L212.961,225.61c-0.163,0.077-0.334,0.172-0.507,0.239l-0.755,0.373l0.048,0.029c-0.125,0.057-0.229,0.144-0.344,0.2-->
<!--                                        c-0.765,0.393-1.511,0.804-2.238,1.263c-0.812,0.517-1.587,1.062-2.352,1.664c-0.708,0.555-1.377,1.109-2.037,1.73-->
<!--                                        c-0.698,0.66-1.358,1.367-1.989,2.094c-0.593,0.688-1.167,1.396-1.712,2.161c-0.564,0.794-1.061,1.636-1.549,2.496-->
<!--                                        c-0.277,0.488-0.622,0.899-0.88,1.396l-26.785,54.363L65.89,341.967c-14.42,6.58-20.77,23.6-14.19,38.012-->
<!--                                        c4.819,10.557,15.233,16.791,26.115,16.791c3.978,0,8.032-0.842,11.886-2.592l115.276-52.594-->
<!--                                        c6.024-2.744,10.901-7.486,13.827-13.416l19.699-39.971l90.528,35.113l-31.556,104.031c-4.59,15.166,3.969,31.182,19.125,35.781-->
<!--                                        c2.782,0.842,5.584,1.244,8.338,1.244c12.308,0,23.687-7.984,27.445-20.369l39.272-129.484-->
<!--                                        C396.025,300.131,388.586,284.85,374.596,279.418z"/>-->
<!--                                    <path d="M421.777,103.545c0,25.456,20.703,46.168,46.178,46.168c25.465,0,46.101-20.712,46.101-46.168-->
<!--                                        c0-25.474-20.636-46.12-46.101-46.12C442.48,57.425,421.777,78.071,421.777,103.545z"/>-->
<!--                                    <path d="M360.874,56.842c0-5.288-4.274-9.562-9.562-9.562H205.483c-5.288,0-9.562,4.274-9.562,9.562s4.274,9.562,9.562,9.562-->
<!--                                        h145.828C356.59,66.404,360.874,62.13,360.874,56.842z"/>-->
<!--                                    <path d="M145.718,80.844c-5.288,0-9.562,4.274-9.562,9.562s4.274,9.562,9.562,9.562h145.828c5.288,0,9.562-4.274,9.562-9.562-->
<!--                                        s-4.274-9.562-9.562-9.562H145.718z"/>-->
<!--                                    <path d="M540.314,231.262h-91.542c-5.288,0-9.562,4.274-9.562,9.562s4.274,9.562,9.562,9.562h91.542-->
<!--                                        c5.288,0,9.562-4.274,9.562-9.562C549.877,235.545,545.603,231.262,540.314,231.262z"/>-->
<!--                                    <path d="M502.801,264.827h-91.542c-5.288,0-9.562,4.274-9.562,9.562c0,5.289,4.274,9.562,9.562,9.562h91.542-->
<!--                                        c5.288,0,9.562-4.273,9.562-9.562C512.363,269.101,508.089,264.827,502.801,264.827z"/>-->
<!--                                </g>-->
<!--                            </g>-->
<!--                            </svg>-->
                    </span>

                    <RangeInput class="header__settings__scale__range" v-model="mySpeed" :max-value="2" :width="100" />

                    <EditableInput
                        class="header__settings__scale__input"
                        :value="mySpeed"
                        @change="mySpeed = $event.target.value"
                    />
                </div>


                <div class="header__settings__scale">
                    <span class="header__settings__scale__title">
                        scale
<!--                        <svg width="582" height="582" viewBox="0 0 582 582" fill="none" xmlns="http://www.w3.org/2000/svg">-->
<!--                            <path fill-rule="evenodd" clip-rule="evenodd" d="M0 0V181.818H36.3636V36.3636H545.455V181.818H581.818V0H0ZM0 400V581.818H581.818V400H545.455V545.455H36.3636V400H0Z" fill="#373737"/>-->
<!--                            <path fill-rule="evenodd" clip-rule="evenodd" d="M581.818 290.908L400 109.09V472.726L581.818 290.908Z" fill="#373737"/>-->
<!--                            <path fill-rule="evenodd" clip-rule="evenodd" d="M0 290.908L181.818 109.09V472.726L0 290.908Z" fill="#373737"/>-->
<!--                            <path d="M436.378 254.529H145.469V327.257H436.378V254.529Z" fill="#373737"/>-->
<!--                        </svg>-->
                    </span>

                    <RangeInput class="header__settings__scale__range" v-model="timelineZoom" :min-value="timelineZoomMinValue" :max-value="timelineZoomMaxValue" :width="100" />

                    <EditableInput
                        class="header__settings__scale__input"
                        :value="timelineZoom.toFixed(2)"
                        @change="timelineZoom = $event.target.value"
                    />
                </div>

            </div>
        </div>
        <div ref="cursor" class="time-ruler__cursor" :style="cursorStyle"> {{ userTimeCursor.toFixed(2) }} </div>
        <div
            ref="scroller"
            class="list-wrapper"
            @scroll="$emit('onscroll', $event.target.scrollTop)"
        >
            <div class="scroller-wrapper">
                <TimeRuler />
                <div class="user-time-cursor" ref="user-time-cursor"></div>
                <div class="time-cursor" ref="time-cursor"></div>
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
                        <timeline-spine-item
                            :scroller="scroller"
                            :probable-animations="item.probableAnimations"
                            :animations="item.animations"
                            @scroll-left="scrollLeft"
                            @add-click="addClick(item)"
                            @remove-click="animation => removeClick(item, animation)"
                        />
                    </li>
                </transition-group>
            </div>

        </div>
    </div>
</template>

<script>
import gsap from "gsap";
import RangeInput from "../../../../../RangeInput/RangeInput.vue";
import TimeRuler from "../../../../../TimeRuler/TimeRuler.vue";
import TimelineSpineItem from "../TimelineSpineItem";
import EditableInput from "../../../../../EditableInput/EditableInput.vue";
import { v4 } from "uuid";

export default {
    components: { RangeInput, TimeRuler, TimelineSpineItem, EditableInput },

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
    data() {
        return {
            scroller: null,
            timelineZoomMinValue: 0.2,
            timelineZoomMaxValue: 1.5,
            defaultPixelsPerSecond: 200

        };
    },
    computed: {
        mySpeed: {
            get() {
                // return this.$store.getters["layers/itemToRedact"].spineData?.skins?.map(({ name }) => name);
                return Number(this.$store.getters["app/speed"]);
            },
            set(v) {
                if (v === undefined || v === null) return;

                v = Math.min(Math.max(v, 0), 2);

                this.$store.dispatch("app/setSpeed", v);
            }
        },
        timelineZoom: {
            get() {
                return this.$store.getters["app/pixelsPerSecond"] / this.defaultPixelsPerSecond;
            },
            set(value) {
                value = Number(value);
                if (value === "" || value === null || value === undefined || Number.isNaN(value)) return;

                value = Math.min(Math.max(value, this.timelineZoomMinValue), this.timelineZoomMaxValue);

                this.$store.dispatch("app/setPixelsPerSecond", value * this.defaultPixelsPerSecond);
            }
        },
        pixelsPerSecond() {
            return this.$store.getters["app/pixelsPerSecond"];
        },
        cursorStyle() {
            return {
                transform: `translateX(${this.userTimeCursor * this.pixelsPerSecond - (this.$refs.scroller?.scrollLeft || 0)}px)`,
                opacity: this.userTimeCursorShow ? 1 : 0
            };
        },
        itemsHeight() {
            return this.items.map((item) => this.getHeight(item));
        },
        timeCursor() {
            return this.$store.getters["app/timeCursor"];
        },
        userTimeCursor() {
            return this.$store.getters["app/userCursor"];
        },
        userTimeCursorShow() {
            return this.$store.getters["app/showUserCursor"];
        },
        userTimeCursorActive() {
            return this.$store.getters["app/activeUserCursor"];
        }
    },
    watch: {
        scrollTop() {
            this.$refs.scroller.scrollTop = this.scrollTop;
        },
        timeCursor() {
            gsap.set(this.$refs["time-cursor"], { x: this.timeCursor * this.pixelsPerSecond });
        },
        userTimeCursor() {
            gsap.set(this.$refs["user-time-cursor"], { x: this.userTimeCursor * this.pixelsPerSecond });
        },
        userTimeCursorShow() {
            gsap.set(this.$refs["user-time-cursor"], { opacity: this.userTimeCursorShow ? 1 : 0 });
        },
        userTimeCursorActive() {
            gsap.set(this.$refs["time-cursor"], { opacity: this.userTimeCursorActive ? 0 : 1 });
        }

    },
    mounted() {
        this.scroller = this.$refs.scroller;
    },
    methods: {
        getHeight(item) {
                const height = 90;

                return height * (item.animations.length + 1);

            // return 0;
        },
        scrollLeft(value) {
            this.$refs.scroller.scrollLeft = value;
        },
        addClick(item) {
            const timeStart = item.animations.reduce((acc, item) => {
                return Math.max(acc, item.timeStart + item.pickedAnimation.duration);
            }, 0);

            const animation = {
                id: v4(),
                pickedAnimation: item.probableAnimations[0],
                timeStart
            };

            this.$store.dispatch("layers/addAnimationToItem", { item, animation });

            this.$store.getters["app/listeners"].restart?.forEach(cb => cb());
            // this.$store.commit("addPlateToSpine", { item, plate });
        },
        removeClick(item, animation) {
            this.$store.dispatch("layers/removeAnimationToItem", { item, animation });

            this.$store.getters["app/listeners"].restart?.forEach(cb => cb());
            // this.$store.commit("removePlateFromSpine", { item, plate });
        }
    }
};
</script>

<style lang="sass">
.list-wrapper
    *
        user-select: none
</style>

<style scoped lang="sass">
.time-ruler
    &__cursor
        top: 5px
        left: 7px
        position: absolute
        pointer-events: none
        display: inline-block
        padding: 4px 5px
        background: #ffd880
        border-radius: 4px
        box-shadow: 0 0 2px rgba(0,0,0,.14)
        font-size: 10px
        transition: opacity 0.3s
        z-index: 1000000
.list-enter-from, .list-leave-to
    opacity: 0
    height: 0 !important
    //transform: translateY(-100%)
.wrapper
    overflow: hidden
    box-shadow: var(--shadow)
    height: 100%
    position: relative

.header
    height: 25px
    display: flex
    align-items: center
    padding: 0 10px
    font-size: 14px
    position: relative
    z-index: 10
    box-shadow: var(--shadow)
    background-color: var(--color-light)
    &__settings
        display: flex
        width: 100%
        padding-left: 10px
        align-items: center

        &__scale
            margin-left: auto
            display: flex
            align-items: center
            &__title
                margin-right: 5px

                //width: 20px
                //height: 20px
                svg
                    width: 100%
                    height: 100%
            &__range
                margin-right: 5px
            &__input
                min-width: 26px
                width: 26px
                height: 20px

        .btn
            box-sizing: border-box
            display: flex
            background-color: transparent
            border: none
            outline: none
            box-shadow: none
            width: 20px
            height: 18px
            padding: 3px
            box-shadow: var(--shadow)
            cursor: pointer
            background-color: var(--color-light)
            border-radius: 5px
            margin-right: 10px
            svg
                width: 100%
                height: 100%
            &:active
                box-shadow: inset var(--shadow)

        &__play
            .btn
                &:hover
                    svg
                        path
                            fill: #0062F1
        &__restart
            .btn
                &:hover
                    svg
                        path
                            stroke: #0062F1

        &__loop
            .btn
                width: 40px
                justify-content: space-between
                align-items: center
                svg
                    width: 14px


        &__speed
            display: flex
            align-items: center
            margin-left: 10px
            &__title
                margin-right: 5px

                //width: 20px
                //height: 20px
                svg
                    width: 100%
                    height: 100%

.checkbox
    position: absolute
    opacity: 0
    visibility: hidden
    width: 1px
    height: 1px

.fake-checkbox
    display: block
    width: 14px
    height: 14px
    //margin-left: 5px
    position: relative
    flex-shrink: 0
    &:after, &:before
        content: ""
        position: absolute
        inset: 0
        background-image: url("resources/checkbox.svg")
        opacity: 1

    &:before
        background-image: url("resources/checkbox-active.svg")
        opacity: 0

.checkbox:checked + .fake-checkbox
    &:after
        opacity: 0
    &:before
        opacity: 1

.time-cursor, .user-time-cursor
    position: absolute
    width: 2px
    background-color: var(--color-accent)
    top: 0
    height: 100%
    left: 20px
    z-index: 999
    pointer-events: none
    will-change: transform

.user-time-cursor
    background-color: #ffd880
    transition: opacity 0.3s
    opacity: 0

.scroller-wrapper
    min-height: 100%
    background-image: url("../../../../../../resources/pattern.svg")
    background-position: 0 20px
    position: relative
    width: fit-content
    min-width: 100%
    &:before
        content: ""
        position: absolute
        top: 0
        left: 20px
        bottom: 0
        right: 0
        pointer-events: none
        background-image: url("../../../../../../resources/ruller-pattern.svg")
        background-position: 0 20px
.list-wrapper
    overflow: scroll
    position: relative
    height: calc(100% - 25px)
    user-select: none
    *
        user-select: none


.list
    min-height: 100%

    position: relative
    width: fit-content
    min-width: 100%


.list-item
    transition: all 0.3s ease
    overflow: hidden
    &__wrapper
        padding: 20px 5px
        box-sizing: border-box
        height: 100%
    &__plate
        border-radius: 5px
        box-shadow: var(--shadow)
        height: 40px
        display: flex
        align-items: center
        padding: 0 10px
        font-size: 14px
</style>