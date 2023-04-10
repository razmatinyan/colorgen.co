<template>
    <div class="c-sel-select" :class="classes">
        <div class="c-sel-header" @click="showOptions = !showOptions" :class="{ 'opened': showOptions }">
            <div class="c-sel-label">{{ selected === '' ? label : selected }}</div>
            <span class="material-icons-outlined">keyboard_arrow_down</span>
        </div>
        <transition name="fade" appear>
            <div class="options" v-if="showOptions">
                <span 
                    v-for="option in options"
                    :key="option"
                    class="option"
                    :class="{ 'selected': selected === option }"
                    @click="selectOption(option)"
                >
                    {{ option }}
                </span>
            </div>
        </transition>
    </div>
</template>

<script>
export default {
    name: 'Select',
    props: {
        label: {
            type: String,
            default() {
                return 'Generate Method'
            }
        },
        options: {
            type: Array,
            default() {
                return []
            }
        },
        classes: {
            type: String,
            default() {
                return ''
            }
        },
        selected: {
            type: String,
            default() {
                return ''
            }
        }
    },
    data() {
        return {
            showOptions: false,
        }
    },
    methods: {
        selectOption(option) {
            this.$emit('select', option);
            this.showOptions = false;
        }
    }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: all var(--time-02);
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateY(-40px);
}

.c-sel-select {
    position: relative;
}
.c-sel-header {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-width: 200px;
    height: 46px;
    padding: 0 10px 0 20px;
    background: #fff;
    line-height: 45px;
    border-radius: 10px;
    border: 1px solid var(--gray);
    outline: none;
    transition: border var(--time-01);
    cursor: pointer;
    z-index: 1002;
}
.c-sel-header:hover,
.c-sel-header.opened {
    border-color: var(--black);
}
.c-sel-header > .c-sel-label {
    max-width: 136px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.c-sel-header > span {

}
.c-sel-select .options {
    position: absolute;
    top: 50px;
    width: 100%;
    z-index: 1001;
    background: #fff;
    padding: 10px;
    border-radius: 10px;
    box-shadow: 0px 0px 13px 0px rgb(0 0 0 / 18%);
}
.c-sel-select .options .option {
    display: block;
    transition: all var(--time-02);
    cursor: pointer;
    margin-bottom: 4px;
    padding: 6px 10px;
    border-radius: 10px;
}
.c-sel-select .options .option:last-child {
    margin-bottom: 0;
}
.c-sel-select .options .option.selected {
    background: var(--blue-low);
    color: var(--blue);
}
.c-sel-select .options .option:hover {
    background: #f2f2f3;
}
.c-sel-select .options .option.selected:hover {
    background: var(--blue-low);
}
</style>