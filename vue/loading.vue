<template>
    <div v-show="visible" :class="['loading-mask', fullscreen && 'fullscreen']">
        <div class="loading-spinner">
            <svg class="circular" viewBox="25 25 50 50">
                <circle class="path" cx="50" cy="50" r="20" fill="none"></circle>
            </svg>
            <p v-if="text" class="loading-text">{{ text }}</p>
        </div>
    </div>
</template>

<script>
export default {
    name: 'loading',
    data() {
        return {
            visible: true,
            fullscreen: true,
            text: 'Loading'
        };
    }
};
</script>
<style lang="less">
.loading-mask {
    position: absolute;
    z-index: 100;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    margin: 0;
    background-color: rgba(255, 255, 255, 0.9);
    transition: opacity 0.4s;
    &.fullscreen {
        position: fixed;
    }
    .loading-spinner {
        top: 50%;
        margin-top: -21px;
        width: 100%;
        text-align: center;
        position: absolute;
        .circular {
            height: 42px;
            width: 42px;
            animation: loading-rotate 2s linear infinite;
        }
        .path {
            animation: loading-dash 1.5s ease-in-out infinite;
            stroke-dasharray: 90, 150;
            stroke-dashoffset: 0;
            stroke-width: 2;
            stroke: #017aff;
            stroke-linecap: round;
        }
        .loading-text {
            color: #ccc;
        }
    }
}
@keyframes loading-rotate {
    100% {
        transform: rotate(360deg);
    }
}
@keyframes loading-dash {
    0% {
        stroke-dasharray: 1, 200;
        stroke-dashoffset: 0;
    }
    50% {
        stroke-dasharray: 90, 150;
        stroke-dashoffset: -40px;
    }
    100% {
        stroke-dasharray: 90, 150;
        stroke-dashoffset: -120px;
    }
}
.loading-parent--relative {
    position: relative !important;
}
.loading-parent--hidden {
    overflow: hidden !important;
}
</style>
