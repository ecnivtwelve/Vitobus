<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'LineIcon',
    props: ['line'],
    data() {
        let color = "#888888";

        if (this.line == "A") {
            color = "#E51A1A";
        } else if (this.line == "B") {
            color = "#1A91E5";
        } else if (this.line == "C") {
            color = "#E5801A";
        }

        return {
            color: color,
        };
    },
});
</script>

<template>
    <div class="lineIcon">
        <p class="lineText">{{ line }}</p>
    </div>
</template>

<style scoped>
    .lineIcon {
        background: v-bind(color);
        border: 1px solid #ffffff50;

        border-radius: 5px;

        width: 32px;
        height: 32px;

        display: flex;
        align-items: center;
        justify-content: center;
    }

    .lineIcon * {
        margin: 0;
        padding: 0;
    }

    .lineText {
        font-weight: 600;
        font-size: 22px;
        color: #fff;
        text-shadow: 0px 1px 1px rgba(0, 0, 0, 0.25);
    }
</style>