import Vue from 'vue';
import Loading from './Loading.vue';

const LoadingConstructor = Vue.extend(Loading);

export default {
    install: Vue => {
        Vue.directive('loading', {
            bind: (el, binding) => {
                const loading = new LoadingConstructor({
                    el: document.createElement('div'),
                    data: {
                        text: el.getAttribute('loading-text'),
                        fullscreen: !!binding.modifiers.fullscreen
                    }
                });
                el.instance = loading;
                el.loading = loading.$el;
                toggleLoading(el, binding);
            },
            update: (el, binding) => {
                if (binding.oldValue !== binding.value) {
                    toggleLoading(el, binding);
                }
            },
            unbind: (el, binding) => {
                if (el.domInserted) {
                    if (binding.modifiers.fullscreen) {
                        document.body.removeChild(el.loading);
                    } else {
                        el.loading && el.loading.parentNode && el.loading.parentNode.removeChild(el.loading);
                    }
                }
            }
        });
        const toggleLoading = (el, binding) => {
            if (binding.value) {
                Vue.nextTick(() => {
                    if (binding.modifiers.fullscreen) {
                        el.originalPosition = document.body.style.position;
                        el.originalOverflow = document.body.style.overflow;
                        insertDom(document.body, el, binding);
                    } else {
                        el.originalPosition = el.style.position;
                        insertDom(el, el, binding);
                    }
                });
            } else {
                if (el.domVisible) {
                    el.domVisible = false;
                    if (binding.modifiers.fullscreen && el.originalOverflow !== 'hidden') {
                        document.body.style.overflow = el.originalOverflow;
                    }
                    if (binding.modifiers.fullscreen) {
                        document.body.style.position = el.originalPosition;
                    } else {
                        el.style.position = el.originalPosition;
                    }
                    Vue.nextTick(() => {
                        el.instance.visible = false;
                    });
                }
            }
        };
        const insertDom = (parent, el, binding) => {
            if (!el.domVisible) {
                if (el.originalPosition !== 'absolute') {
                    parent.style.position = 'relative';
                }
                if (binding.modifiers.fullscreen) {
                    parent.style.overflow = 'hidden';
                }
                el.domVisible = true;
                if (!el.domInserted) {
                    parent.appendChild(el.loading);
                    el.domInserted = true;
                }
                Vue.nextTick(() => {
                    el.instance.visible = true;
                });
            }
        };
    }
};
