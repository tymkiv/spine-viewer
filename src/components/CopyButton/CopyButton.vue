<template>
    <div class="copy-button">
        <span
            class="copy-button__copy-popup"
            :class="{ 'is-visible': copied }"
            role="status"
            aria-live="polite"
        >
            <template v-if="error">Error!</template>
            <template v-else>Copied!</template>

        </span>

        <!-- кнопка копирования -->
        <span
            class="copy-button__copy-icon"
            role="button"
            tabindex="0"
            aria-label="Copy"
            @click="copy(value)"
            @keydown.enter.prevent="copy(value)"
            @keydown.space.prevent="copy(value)"
        ></span>
    </div>
</template>

<script>
export default {
    name: "CopyButton",
    props: {
        value: { type: String, required: true }
    },
    data: () => ({
        copied: false,
        error: false,
        copyTimer: null
    }),
    beforeUnmount() {
        if (this.copyTimer) clearTimeout(this.copyTimer);
    },
    methods: {
        async copy(text) {
            const str = String(text ?? "");
            try {
                if (navigator.clipboard?.writeText) {
                    await navigator.clipboard.writeText(str);
                } else {
                    // фоллбек для старых браузеров/несекьюрного контекста
                    const ta = document.createElement("textarea");
                    ta.value = str;
                    ta.setAttribute("readonly", "");
                    ta.style.position = "fixed";
                    ta.style.left = "-9999px";
                    document.body.appendChild(ta);
                    ta.select();
                    document.execCommand("copy");
                    document.body.removeChild(ta);
                }
                this.showCopied();
            } catch {
                this.error = true;
                this.showCopied();
            }
        },
        showCopied() {
            this.copied = true;
            if (this.copyTimer) clearTimeout(this.copyTimer);
            this.copyTimer = setTimeout(() => {
                this.copied = false;
                this.error = false;
            }, 1000);
        }
    }
};
</script>

<style scoped lang="sass">
.copy-button
    position: relative
    &__copy-icon
        position: relative
        display: inline-block
        width: 20px
        height: 20px
        cursor: pointer
        flex-shrink: 0
        &:before
            content: ""
            position: absolute
            width: 14px
            height: 14px
            top: 3px
            left: 3px
            background-image: url("../../resources/copy.svg")
            background-position: center
            background-repeat: no-repeat
            background-size: contain
        &:hover
            transform: scale(1.05)
        &:active
            transform: scale(0.95)
        &:focus-visible
            outline: 2px solid rgba(0, 113, 227, .35)
            border-radius: 4px

    &__copy-popup
        position: absolute
        left: 26px
        top: -6px
        transform: translateY(-8px) scale(.96)
        background-color: var(--color-light)
        border: 1px solid var(--color-dark)
        border-radius: 5px
        padding: 4px 8px
        font-size: 12px
        line-height: 1
        box-shadow: 0 4px 10px rgba(0,0,0,.15)
        opacity: 0
        pointer-events: none
        transition: opacity .16s ease, transform .16s ease, visibility .16s step-end
        visibility: hidden
        z-index: 1

        &.is-visible
            opacity: 1
            transform: translateY(-12px) scale(1)
            visibility: visible
            transition: opacity .16s ease, transform .16s ease, visibility 0s step-start
</style>