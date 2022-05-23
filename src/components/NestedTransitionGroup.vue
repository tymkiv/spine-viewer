<template>
    <!--    height нужно для того, что бы появление нового списка анимировалось как надо-->
    <transition-group name="list" tag="ul" class="super-class">
        <li
            v-for="(item, index) in items"
            :key="item.id"
            :style="{ height: `${40 + getHeight(item, index)}px` + (index === items.length - 1 ? 10 : 0) }"
            class="list-item"
            :class="{
                ['list-item_' + item.type]: true,
                'list-item_parent': item.items?.length,
                'list-item_drag-target': dragTarget === item,
                'list-item_drop-target': dropTarget === item,
                'list-item_drop-target_top': dropTarget === item && dropTargetPlace === 'top',
                'list-item_drop-target_bottom': dropTarget === item && dropTargetPlace === 'bottom',
                'list-item_drop-target_self': dropTarget === item && dropTargetPlace === 'self'
            }"
            :draggable="true"
            @dragstart.stop="dragstart(item)"
            @dragover.stop.prevent="dragover(item, $event)"
            @dragleave.stop="dragleave()"
            @dragend.stop="dragend()"
        >
            <input v-model="item.name" type="text" />

            <nested-transition-group
                v-if="item.items"
                :nested-level="nestedLevel + 1"
                :items="item.items"
                :dragend="dragend"
                :dragleave="dragleave"
                :dragover="dragover"
                :dragstart="dragstart"
                :drag-target="dragTarget"
                :drop-target="dropTarget"
                :drop-target-place="dropTargetPlace"
            />
        </li>
    </transition-group>
</template>

<script>
export default {
    name: "NestedTransitionGroup",
    props: {
        nestedLevel: {
            type: Number,
            required: true
        },
        items: {
            type: Array,
            required: true
        },
        dragTarget: {
            type: Object,
            required: false,
            default: () => null
        },
        dropTarget: {
            type: Object,
            required: false,
            default: () => null
        },
        dropTargetPlace: {
            type: String,
            required: false,
            default: () => null
        },
        dragstart: {
            type: Function,
            required: true
        },
        dragover: {
            type: Function,
            required: true
        },
        dragleave: {
            type: Function,
            required: true
        },
        dragend: {
            type: Function,
            required: true
        }
    },
    methods: {
        getHeight(item) {
            return item.items ? item.items.reduce((height, nestedItem) => height + 40 + this.getHeight(nestedItem), 0) : 0;
        }
    }
};
</script>
