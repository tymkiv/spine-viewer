<template>
    <div class="container" :class="{ 'is-open': isOpened }">
        <transition
            @enter="onEnter"
            @after-enter="onAfterEnter"
            @before-leave="onBeforeLeave"
            @leave="onLeave"
            @after-leave="onAfterLeave"
        >
            <div
                v-show="isOpened"
                class="container__content"
                ref="content"
            >
                <div :style="`padding-bottom: ${paddingBottom}px`">

                    <slot />
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
export default {
    name: "CollapsibleContainer",
    props: {
        defaultOpen: { type: Boolean, default: true },
        duration: { type: Number, default: 200 }, // ms
        paddingBottom: { type: Number, default: 20 }
    },
    data() {
        return {
            isOpened: this.defaultOpen
        };
    },
    methods: {
        toggle() {
            this.isOpened = !this.isOpened;
        },

        // --- Transition hooks (JS-управление высотой) ---
        onEnter(el) {
            // старт из 0
            el.style.transition = `height ${this.duration}ms ease, opacity ${this.duration}ms ease`;
            el.style.height = '0px';
            el.style.opacity = '0';
            // следующий кадр — к целевой высоте
            requestAnimationFrame(() => {
                el.style.height = el.scrollHeight + 'px';
                el.style.opacity = '1';
            });
        },
        onAfterEnter(el) {
            // чистим инлайны, чтобы блок снова был авто-высоты
            el.style.height = '';
            el.style.opacity = '';
            el.style.transition = '';
        },
        onBeforeLeave(el) {
            // зафиксировать текущую высоту перед схлопыванием
            el.style.height = el.scrollHeight + 'px';
            el.style.opacity = '1';
            el.style.transition = `height ${this.duration}ms ease, opacity ${this.duration}ms ease`;
            // force reflow, чтобы transition отработал корректно
            void el.offsetHeight;
        },
        onLeave(el) {
            el.style.height = '0px';
            el.style.opacity = '0';
        },
        onAfterLeave(el) {
            el.style.height = '';
            el.style.opacity = '';
            el.style.transition = '';
        }
    }
};
</script>

<style scoped lang="sass">
</style>
