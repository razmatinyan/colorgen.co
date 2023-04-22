<template>
    <transition name="toast">
        <div v-if="messages.length > 0" class="toast">
            <transition-group name="toast" class="messages-list" tag="div">
                <div 
                    class="toast-content"
                    v-for="(message, index) in messages"
                    :key="message.id"
                    :class="[message.type]"
                >
                    <div class="content-text">
                        <span v-if="message.type === 'info'" class="material-icons-outlined icon">info</span>
                        <span v-else-if="message.type === 'success'" class="material-icons-outlined icon">check_circle_outline</span>
                        <span v-else-if="message.type === 'error'" class="material-icons-outlined icon">report</span>
                        <span v-else-if="message.type === 'warn'" class="material-icons-outlined icon">report_problem</span>

                        <span class="name">{{ message.name }}</span>
                    </div>
                    <span class="material-icons-outlined close" @click="close(index)">close</span>
                </div>
            </transition-group>
        </div>
    </transition>
</template>

<script>
export default {
    name: 'Toast',
    props: {
        messages: {
            type: Array,
            default: () => {
                return []
            }
        },
        timeout: {
            type: Number,
            default: 3000
        }
    },
    data() {
        return {

        }
    },
    methods: {
        hideToast() {
            if ( this.messages.length ) {
                setTimeout(() => {
                    this.messages.splice(this.messages.length - 1, 1);
                }, this.timeout);
            }
        },
        close(index) {
            this.messages.splice(index, 1)
        }
    },
    mounted() {
        this.hideToast();
    },
    watch: {
        messages: {
            handler() {
                this.hideToast()
            },
            deep: true
        }
    }
};
</script>

<style scoped>
.toast {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 10;
}
.messages-list {
    display: flex;
    flex-direction: column-reverse;
}
.toast-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-height: 50px;
    margin-top: 16px;
    padding: 16px;
    color: #fff;
    border-radius: 4px;
    background: #000;
    box-shadow: 10px 9px 16px rgba(0, 0, 0, 0.07);
}
.toast-content.info {
    background: #050711;
}
.toast-content.success {
    background: #2eb332;
}
.toast-content.warn {
    background: #e47d00;
}
.toast-content.error {
    background: #d32545;
}

.content-text {
    display: flex;
    align-items: center;
    margin-right: 16px;
}
.name {

}
.icon {
    margin-right: 8px;
}
.close {
    font-size: 18px;
    cursor: pointer;
}

.toast-enter-from {
	transform: translateX(400px);
    opacity: 0;
}
.toast-enter-to {
	transform: translateX(0);
    opacity: 1;
}
.toast-enter-active {
	transition: all .7s cubic-bezier(.7, 0, .3, 1);
}
.toast-leave-active {
	transition: all .7s cubic-bezier(.7, 0, .3, 1);
}
.toast-leave-to {
	transform: translateX(400px);
}
.toast-move {
	transition: transform .4s ease;
}
</style>