<template>
	<div class="toast">
        <transition-group name="toast" class="messages-list" tag="div">
            <div 
                class="toast-content"
                v-for="message in messages"
                :key="message.id"
            >
                <div class="content-text">
                    <span class="material-icons-outlined icon">check_circle_outline</span>
                    <span class="name">{{ message.name }}</span>
                </div>
                <span class="material-icons-outlined close">close</span>
            </div>
        </transition-group>
    </div>
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
                    this.messages.splice(this.messages[0], 1);
                }, this.timeout);
            }
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
    flex-direction: column;
}
.toast-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-height: 50px;
    margin-bottom: 16px;
    padding: 16px;
    color: #fff;
    border-radius: 4px;
    background: var(--green);
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
	transition: all .7s ease;
}
.toast-leave-active {
	transition: all .7s ease;
}
.toast-leave-to {
	transform: translateX(400px);
}
.toast-move {
	transition: transform .7s ease;
}
</style>