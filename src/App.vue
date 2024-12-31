<template>
    <div class="main" :class="isMobile ? 'mobile' : ''">
        <div class="left">
            <div class="part1">
                <span class="title">湘田田菜单</span>
                <div class="menu-list">
                    <div
                        class="item"
                        v-for="(item, index) in menuItems"
                        :key="index"
                        :class="[
                            item.disliked ? 'dislike' : '',
                            index % 2 === 0 ? 'double' : '',
                        ]"
                    >
                        <span class="name">{{ item.name }}</span>
                        <span class="price">{{ item.price }}元</span>
                        <button
                            @click="orderItem(index)"
                            :disabled="item.disliked"
                        >
                            点单
                        </button>
                        <button @click="toggleDislike(index)">
                            {{ item.disliked ? '喜欢' : '不喜欢' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div class="right" :class="isShowOrders ? '' : 'hidden'">
            <div class="part2">
                <div class="head">
                    <span class="title">订单</span>
                    <div class="input">
                        <span>人数</span>
                        <input
                            v-model.number="peopleCount"
                            type="number"
                            @input="updatePeopleCount"
                        />
                    </div>
                    <div class="input">
                        <span>点单人</span>
                        <input
                            v-model="username"
                            @change="updateUsername"
                            type="text"
                        />
                    </div>
                </div>
                <div class="order-list">
                    <span class="empty" v-if="orderList.length === 0"
                        >好饿，不知道吃什么</span
                    >
                    <div
                        class="item"
                        v-for="(item, index) in orderList"
                        :key="index"
                    >
                        <span class="name">{{ item.name }}</span>
                        <span class="num">{{ item.quantity }}份</span>
                        <span class="price">{{ item.price }}元</span>
                        <span class="person">{{ item.person }}</span>
                        <button @click="removeOrder(index)">删除</button>
                    </div>
                </div>
                <div class="total" :class="isMobile ? 'hidden' : ''">
                    <span>共计</span>
                    <span class="nums">{{ totalQuantity }}份</span>
                    <span class="price">{{ totalPrice }}元</span>
                    <span>人均消费 {{ averagePrice }}元</span>
                </div>
            </div>
        </div>
    </div>
    <div class="bar" @click="showOrders" :class="isMobile ? '' : 'hidden'">
        <span>共计</span>
        <span>{{ totalPrice }}元</span>
        <span>{{ peopleCount }}人</span>
        <span>人均消费 {{ averagePrice }}元</span>
        <button>{{ isShowOrders ? '关闭' : '查看订单' }}</button>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

// 核心参数
// const ip = ref('ws://localhost:3000')
const ip = ref('ws://192.168.8.184:3000')

// 数据定义
const menuItems = ref([]) // 菜单数据
const orderList = ref([]) // 订单数据

const username = ref('匿名') // 用户名
const peopleCount = ref(1) // 当前人数

const isMobile = ref(false) // 是否为移动端模式
const isShowOrders = ref(false) // 是否显示订单

function detectClientType() {
    
    let isSmallScreen = window.innerWidth <= 768

    let userAgent = navigator.userAgent
    let _ismobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            userAgent
        )

    if (isSmallScreen && _ismobile) {
        isMobile.value = true
    } else {
        isMobile.value = false
    }
}

// 执行判断函数
detectClientType()

// 是否显示订单
function showOrders() {
    isShowOrders.value = isShowOrders.value ? false : true
}

// 计算总消费、总数量和平均消费
const totalPrice = computed(() =>
    orderList.value
        .reduce((sum, order) => sum + order.price * order.quantity, 0)
        .toFixed(2)
)

const totalQuantity = computed(() =>
    orderList.value.reduce((sum, order) => sum + order.quantity, 0)
)

const averagePrice = computed(() =>
    peopleCount.value > 0
        ? (totalPrice.value / peopleCount.value).toFixed(2)
        : 0
)

// WebSocket 连接
let socket

onMounted(() => {
    socket = new WebSocket(ip.value)

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data)
        handleSocketMessage(data)
    }

    socket.onerror = (error) => {
        console.error('WebSocket Error:', error)
    }
})

onUnmounted(() => {
    if (socket) {
        socket.close()
    }
})

function handleSocketMessage(data) {
    switch (data.type) {
        case 'menuUpdate':
            menuItems.value = data.menu
            break
        case 'orderUpdate':
            orderList.value = data.orders
            break
        case 'peopleCountUpdate':
            peopleCount.value = data.peopleCount
            break
        case 'usernameUpdate':
            username.value = data.username
            break
        case 'totalPriceUpdate':
            // Do not directly modify computed properties
            break
        default:
            console.warn('Unknown message type:', data.type)
    }
}

function updateUsername() {
    sendToServer('usernameUpdate', { username: username.value })
}

function updatePeopleCount() {
    sendToServer('peopleCountUpdate', { peopleCount: peopleCount.value })
}

// 点单函数
function orderItem(index) {
    const item = menuItems.value[index]
    const order = orderList.value.find(
        (order) => order.name === item.name && order.person === username.value
    )
    if (order) {
        order.quantity += 1
    } else {
        orderList.value.push({ ...item, quantity: 1, person: username.value })
    }
    syncOrders()
}

function removeOrder(index) {
    orderList.value.splice(index, 1)
    syncOrders()
}

function toggleDislike(index) {
    const item = menuItems.value[index]
    item.disliked = !item.disliked
    syncMenu()
}

function sendToServer(type, payload) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type, ...payload }))
    }
}

// 同步订单数据到服务器
function syncOrders() {
    sendToServer('orderUpdate', { orders: orderList.value })
}

// 同步菜单数据到服务器
function syncMenu() {
    sendToServer('menuUpdate', { menu: menuItems.value })
}

watch(orderList, () => {}, { deep: true })
watch(peopleCount, () => {})
</script>

<style scoped>
.main {
    display: flex;
    justify-content: space-between;
    border: 1px solid var(--border-weak, #e5e6eb);
    background: var(--bg, #fff);
    height: 800px;
    max-width: 1200px;
    margin: 0 auto;
}

.main.mobile,
.main.mobile .left {
    border: none;
}

.main.mobile .right {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    top: 0;
    background: rgba(0, 0, 0, 0.6);
}

.main.mobile .right.hidden {
    display: none;
}

.main.mobile .right .part2 {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    border-top: 1px solid var(--border-weak, #e5e6eb);
    background: var(--bg, #fff);
    max-height: 600px;
    overflow-y: scroll;
    overflow-x: hidden;
    margin-bottom: 64px;
}

.main span,
.main button {
    white-space: nowrap;
}

.left,
.right {
    flex: 1;
}

.left {
    overflow-y: scroll;
    height: 100%;
}

.left::-webkit-scrollbar {
    display: none;
}

.part1 {
    display: flex;
    padding: 20px 16px;
    flex-direction: column;
    border-right: 1px solid var(--border-weak, #e5e6eb);
    background: var(--bg, #fff);
}

.main.mobile .left .part1 {
    padding-bottom: 80px;
    border: none;
}

.part2 {
    display: flex;
    padding: 20px 16px;
    flex-direction: column;
}

.part2 .head {
    width: 100%;
    display: flex;
    padding-left: 8px;
    justify-content: space-between;
    align-items: center;
    align-self: stretch;
    margin-bottom: 8px;
}

.part2 .input {
    display: flex;
    width: 60px;
    height: 32px;
    padding: 0px 8px;
    align-items: center;
    gap: 8px;
    border-radius: 2px;
    border: 1px solid var(--border-weak, #e5e6eb);
    background: var(--bg, #fff);
}

.part2 .input:last-child {
    width: 120px;
    margin-right: 16px;
    margin-left: 16px;
}

.part2 .input span {
    color: var(--text-weaker, #86909c);
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: 16.4px; /* 136.667% */
}

.part2 .input input {
    width: 100%;
    color: var(--text, #272e3b);
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: 16.4px; /* 136.667% */
    border: none;
}

.title {
    display: flex;
    padding: 0px 0px 4px 8px;
    align-items: center;
    align-self: stretch;
    color: var(--text, #272e3b);
    font-size: 16px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
}

.part1 .title {
    margin-bottom: 8px;
}

.part2 .title {
    margin-right: auto;
}

.item {
    display: flex;
    height: 40px;
    padding: 0px 8px;
    align-items: center;
    gap: 24px;
    flex-shrink: 0;
    align-self: stretch;
    border-radius: 4px;
}

.part1 .item.double {
    background: var(--bg-weak, #f7f8fa);
}

.item .name {
    margin-right: auto;
}

.item span {
    color: var(--text, #272e3b);
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: 16.4px; /* 136.667% */
    text-align: center;
    min-width: 30px;
}

.item span:first-child {
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
}

.item span:nth-child(4) {
    width: 60px;
    overflow: hidden;
    text-overflow: ellipsis;
}

.item button {
    color: var(--text-brand, #2562d8);
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: 16.4px; /* 136.667% */
}

.item button:last-child {
    width: 40px;
}

.dislike {
    opacity: 0.5;
    text-decoration: line-through;
}

.total {
    display: flex;
    padding: 12px 8px 0px 8px;
    justify-content: flex-end;
    align-items: center;
    gap: 24px;
    align-self: stretch;
    border-top: 1px dashed var(--border-weak, #e5e6eb);
    margin-top: 8px;
}

.total.hidden {
    display: none;
}

.total span {
    color: var(--orange-6, #ff7200);
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: 16.4px; /* 136.667% */
    text-align: center;
    min-width: 40px;
}

.total span:first-child {
    color: var(--text, #272e3b);
    margin-right: auto;
    text-align: left;
}

span.empty {
    display: block;
    color: var(--text-weaker, #86909c);
    text-align: center;
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: 16.4px; /* 136.667% */
    text-align: center;
    margin: 40px 0;
}

.bar {
    position: fixed;
    display: flex;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 12px 16px 24px 24px;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid var(--border-weak, #e5e6eb);
    background: var(--bg, #fff);
}

.bar.hidden {
    display: none;
}

.bar span {
    color: var(--text-weak, #4e5969);
    text-align: center;
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: 16.4px; /* 136.667% */
}

.bar button {
    display: flex;
    width: 100px;
    height: 32px;
    justify-content: center;
    align-items: center;
    border-radius: 2px;
    background: var(--blue-1, #e8f4ff);
    color: var(--text-brand, #2562d8);
    text-align: center;
    font-size: 12px;
    font-style: normal;
    font-weight: 500;
    line-height: 16.4px; /* 136.667% */
}
</style>
