<template>

    <div class="redact">
        <div class="redact__main-container">
            <h2 class="redact__top">
                <span class="redact__top__title">Edit center</span>
                <template v-if="$store.getters['layers/sceneToDisplay']">
                    <span class="redact__top__icon" />
                    <EditableText v-model="$store.getters['layers/sceneToDisplay'].name" />
                </template>
            </h2>

            <template v-if="$store.getters['layers/itemToRedact']">
                <div class="blocks">
                    <div class="block">
                        <div class="block__row">
                            <span class="block__title">Name</span>
                            <EditableText v-model="$store.getters['layers/itemToRedact'].name" />
                        </div>
                    </div>

                    <div class="block">
                        <div class="block__row">
                            <span class="block__title">Position</span>
                            <EditableInput
                                class="position-input"
                                :value="$store.getters['layers/itemToRedact'].positionX"
                                placeholder="X"
                                @change="redactItemX($event)"
                            />
                            <EditableInput
                                class="position-input"
                                :value="$store.getters['layers/itemToRedact'].positionY"
                                placeholder="Y"
                                @change="redactItemY($event)"
                            />
                            <PositionStick @on-top="changeY(-1)" @on-bottom="changeY(1)" @on-left="changeX(-1)" @onRight="changeX(1)" />

                            <DefaultButton name="Reset" @on-click="resetPosition()" style="margin-left: auto" />
                        </div>
                    </div>


                    <template v-if="parent">
                        <div class="block">
                            <div class="block__row">
                                <span class="block__title">Placeholder</span>
                                <select
                                    class="placeholder-selector"
                                    v-model="placeholderName"
                                >
                                    <option value="" disabled>select placeholder</option>

                                    <option
                                        v-for="slot in sortedSlots"
                                        :key="slot.name"
                                        :value="slot.name"
                                    >
                                        {{ slot.name }}
                                    </option>
                                </select>

                            </div>
                        </div>
                    </template>

                    <template v-if="$store.getters['layers/itemToRedact'].spine">
                        <div class="block">
                            <div class="block__row">
                                <span class="block__title">Skins</span>

                                <CopyButton :value="skin" />

                                <select
                                    class="placeholder-selector"
                                    v-model="skin"
                                >
                                    <option value="" disabled>select skin</option>

                                    <option
                                        v-for="s in skins"
                                        :key="s"
                                        :value="s"
                                    >
                                        {{ s }}
                                    </option>
                                </select>

                            </div>
                        </div>



                        <div class="block">
                            <EditBlockCollapsibleContainer :title="`Picked animations (${$store.getters['layers/itemToRedact'].animations.length})`">
                                <transition-group
                                    name="pa"
                                    tag="div"
                                    class="picked-list"
                                    appear
                                >
                                    <PickedAnimation
                                        v-for="animation in $store.getters['layers/itemToRedact'].animations"
                                        :key="animation.id"
                                        :name="animation.pickedAnimation.name"
                                        :duration="+animation.pickedAnimation.duration.toFixed(2)"
                                        :start="+animation.timeStart.toFixed(2)"
                                        @on-change-start="redactAnimationStart(animation, $event)"
                                    />
                                </transition-group>
                            </EditBlockCollapsibleContainer>
                        </div>


                        <div class="block">
                            <EditBlockCollapsibleContainer :title="`Animations (${$store.getters['layers/itemToRedact'].probableAnimations.length})`">

                                <ProbableAnimation
                                    v-for="animation in $store.getters['layers/itemToRedact'].probableAnimations"
                                    :key="animation.id"
                                    :name="animation.name"
                                    :duration="+animation.duration.toFixed(2)"
                                    :events="animation.events"
                                />

                            </EditBlockCollapsibleContainer>
                        </div>

                    </template>
                </div>
            </template>


        </div>
    </div>


</template>

<script>
import CollapsibleContainer from "../../CollapsibleContainer/CollapsibleContainer.vue";
import CopyButton from "../../CopyButton/CopyButton.vue";
import DefaultButton from "../../DefaultButton/DefaultButton.vue";
import EditableText from "../../EditableText/EditableText.vue";
import EditableInput from "../../EditableInput/EditableInput.vue";
import EditBlockCollapsibleContainer from "../../EditBlockCollapsibleContainer/EditBlockCollapsibleContainer.vue";
import PickedAnimation from "../../PickedAnimation/PickedAnimation.vue";
import PositionStick from "../../PositionStick/PositionStick.vue";
import ProbableAnimation from "../../ProbableAnimation/ProbableAnimation.vue";

export default {
    components: { CopyButton, ProbableAnimation, EditBlockCollapsibleContainer, PickedAnimation, CollapsibleContainer, DefaultButton, PositionStick, EditableText, EditableInput },
    data() {
        return {
            // isEditSceneNameActive: false
        };
    },
    computed: {
        skins() {
            return this.$store.getters["layers/itemToRedact"].spineData?.skins?.map(({ name }) => name);
        },
        skin: {
            get() {
                // return this.$store.getters["layers/itemToRedact"].spineData?.skins?.map(({ name }) => name);
                return this.$store.getters["layers/itemToRedact"].spine?.skeleton.skin?.name;
            },
            set(v) {
                if (v === "" || v === null) return;

                const skin = this.$store.getters["layers/itemToRedact"].spineData?.skins?.find(({ name }) => name === v);

                if (skin) {
                    this.$store.getters["layers/itemToRedact"].spine?.skeleton.setSkin(null);
                    this.$store.getters["layers/itemToRedact"].spine?.skeleton.setSkin(skin);
                }
            }
        },
        child() {
            return this.$store.getters["layers/timelineItems"].find(({ id }) => id === this.$store.getters["layers/itemToRedact"]?.id);
        },
        parent() {
            return this.child?.childFor;
        },
        // прокси к стору
        placeholderName: {
            get() {
                return this.$store.getters["layers/itemToRedact"].placeholder_name ?? "";
            },
            set(v) {
                if (v === "" || v === null) return;

                this.$store.dispatch("layers/changePlaceholder", { item: this.$store.getters["layers/itemToRedact"], placeholder: v });
            }
        },
        // разложим pla* первыми, остальные — по алфавиту
        sortedSlots() {
            const slots = this.parent.spineData?.slots ?? [];
            const pla = [];
            const rest = [];
            for (const s of slots) (s.name.startsWith("pla") ? pla : rest).push(s);
            rest.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base", numeric: true }));
            return [...pla, ...rest];
        }
    },
    watch: {

    },
    methods: {
        // onInput(e) {
        //
        //   this.value = val;
        //
        //   this.redactItemY(val);
        // },
        redactItem(name) {
            this.$store.dispatch("layers/redactItem", name);
        },
        redactItemX(e) {
            // let val = Number(e.target.value.replace(/[^0-9]/g, ''));
            // val = Number(val).toFixed(2);
            // e.target.value = val;
            const parsed = Number(e.target.value);
            if (Number.isNaN(parsed)) return;
            this.$store.dispatch("layers/redactItemX", parsed);
        },
        redactAnimationStart(animation, e) {
            const parsed = Number(e.target.value);
            if (Number.isNaN(parsed)) return;

            animation.timeStart = parsed;
            this.$store.getters["app/listeners"].restart?.forEach(cb => cb());
        },
        changeX(value) {
            this.$store.dispatch("layers/redactItemX", this.$store.getters["layers/itemToRedact"].positionX + value);
        },
        changeY(value) {
            this.$store.dispatch("layers/redactItemY", this.$store.getters["layers/itemToRedact"].positionY + value);
        },
        resetPosition() {
            this.$store.dispatch("layers/redactItemX", 0);
            this.$store.dispatch("layers/redactItemY", 0);
        },
        redactItemY(e) {
          // let val = Number(e.target.value.replace(/[^0-9]/g, ''));
          // val = Number(val).toFixed(2);
          //   e.target.value = val;
            const parsed = Number(e.target.value);
            if (Number.isNaN(parsed)) return;
            this.$store.dispatch("layers/redactItemY", parsed);
        },
        redactSceneName(name) {
            this.$store.dispatch("layers/redactSceneName", name);
        },
        placeholderChange(event) {
            this.$store.dispatch("layers/changePlaceholder", { item: this.$store.getters["layers/itemToRedact"], placeholder: event.target.value })
        }
    }
};
</script>

<style scoped lang="sass">
.placeholder-selector
    height: 30px
    padding: 0 5px
    min-width: 30px
    background-color: var(--color-light)
    cursor: pointer
    border-radius: 5px
    flex-direction: row
    justify-items: center
    display: flex
    box-shadow: inset 0 0 2px #11111154
    border: none
    outline: none
    -webkit-appearance: none
    text-align: center



.redact
    //padding: 10px
    font-size: 14px
    overflow: auto
    //width: max-content
    height: 100%
    background-color: var(--color-light)
    box-shadow: var(--shadow)
    min-width: 100%
    position: relative
    &__main-container
        min-width: max(250px, 100%)
        //min-width: 250px
        width: min-content
        //width: fit-content
    &__top
        display: flex
        align-items: center
        height: 25px
        padding: 0 10px
        box-shadow: var(--shadow)
        font-size: 14px
        position: relative
        z-index: 10
        background-color: var(--color-light)
        &__title
          font-weight: 800
          flex-shrink: 0
          margin-right: 30px
        &__icon
          width: 14px
          height: 14px
          background-image: url("../../../resources/scene.svg")
          background-position: center
          background-repeat: no-repeat
          background-size: contain
          margin-right: 10px
          flex-shrink: 0

input, select, option
    font-size: 14px
    display: block
    flex-shrink: 1
    width: 150px

.name, .placeholder
    display: flex
    height: 40px
    align-items: center
    padding: 0 10px

.text
    color: inherit
    white-space: nowrap
    text-overflow: ellipsis
    font-size: 14px
    line-height: initial
    overflow: hidden
    padding-right: 10px

.blocks
    .block
        position: relative
        padding: 0 10px
        &:after
            content: ""
            display: block
            position: absolute
            width: 100%
            height: 1px
            background-color: #D9D9D9
            bottom: 0
            left: 0

        &:last-child
            &:after
                //display: none
        &__row
            display: flex
            flex-direction: row
            height: 55px
            align-items: center
            *
                flex-shrink: 0
                margin-right: 5px

        &__title
            padding-right: 5px
            font-weight: 900


.position-input
    width: 50px

/* контейнер списка */
.picked-list
    display: flex
    flex-direction: column


/* базовая высота/вид элемента, чтобы не дёргалось */
.picked-list > *
    will-change: margin, opacity
    min-width: 0 /* на всякий */


/* ВХОД: появляемся снизу + fade-in */
.pa-enter-from
    opacity: 0
    //transform: translateY(12px)
    margin-top: 40px

.pa-enter-active
    transition: margin .18s ease, opacity .18s ease

.pa-enter-to
    opacity: 1
    margin-top: 0px


/* ВЫХОД: уходим вверх + fade-out */
.pa-leave-from
    opacity: 1
    //transform: translateY(0)
    margin-top: 0px

.pa-leave-to
    opacity: 0
    margin-top: -40px
    //transform: translateY(-12px)

.pa-leave-active
    transition: margin .18s ease, opacity .18s ease


/* Перемещение оставшихся элементов (FLIP) */
.pa-move
    transition: margin .18s ease


</style>
