import Hapi from '@hapi/hapi'
import { WebSocketServer } from 'ws'

const server = Hapi.server({
    port: 3000,
    // host: 'localhost',
    host: '192.168.8.184',
})

const menuItems = [
    { name: '[堂食] 大厅茶水费', price: 3, disliked: false },
    { name: '[堂食] 包厢茶水费', price: 6, disliked: false },
    { name: '[外卖] 盒饭', price: 4, disliked: false },
    { name: '[外卖] 打包盒', price: 1, disliked: false },
    { name: '蒸翘嘴鱼', price: 56, disliked: false },
    { name: '一桶饭', price: 16, disliked: false },
    { name: '半桶饭', price: 8, disliked: false },
    { name: '一碗饭', price: 2, disliked: false },
    { name: '樟树辣椒炒肉', price: 42, disliked: false },
    { name: '炒萝卜苗', price: 32, disliked: false },
    { name: '红枣糕(大)', price: 36, disliked: false },
    { name: '红枣糕(小)', price: 22, disliked: false },
    { name: '洪湖藕汤(大)', price: 59, disliked: false },
    { name: '洪湖藕汤(小)', price: 32, disliked: false },
    { name: '壹号土猪肉丸', price: 35, disliked: false },
    { name: '酸菜肉沫鸭血', price: 0, disliked: false },
    { name: '酸辣土豆丝', price: 23, disliked: false },
    { name: '油麦菜', price: 29, disliked: false },
    { name: '菜籽油焖豆腐', price: 26, disliked: false },
    { name: '清炒浏阳丝瓜', price: 29, disliked: false },
    { name: '清炒毛白菜', price: 32, disliked: false },
    { name: '小炒花菜', price: 29, disliked: false },
    { name: '青椒炒茄子', price: 29, disliked: false },
    { name: '酸包菜炒粉皮', price: 32, disliked: false },
    { name: '油渣青豆角', price: 32, disliked: false },
    { name: '田田下饭菜', price: 22, disliked: false },
    { name: '家乡土鸡蛋', price: 29, disliked: false },
    { name: '萝卜干腊肉', price: 39, disliked: false },
    { name: '干笋炒腊肉', price: 49, disliked: false },
    { name: '干锅肥肠', price: 66, disliked: false },
    { name: '干锅鱿鱼', price: 49, disliked: false },
    { name: '剁辣椒小炒肉', price: 39, disliked: false },
    { name: '小炒黄牛肉', price: 69, disliked: false },
    { name: '小炒猪肝', price: 32, disliked: false },
    { name: '砂锅鱼头(大)', price: 89, disliked: false },
    { name: '砂锅鱼头(小)', price: 49, disliked: false },
    { name: '鹿茸菌炒肉', price: 39, disliked: false },
    { name: '酸辣鸡杂', price: 39, disliked: false },
    { name: '菜籽油小炒鸡(大)', price: 79, disliked: false },
    { name: '菜籽油小炒鸡(小)', price: 49, disliked: false },
    { name: '山胡椒油牛肚', price: 49, disliked: false },
    { name: '蛋香拆骨肉', price: 39, disliked: false },
    { name: '原味鸡(一只)', price: 118, disliked: false },
    { name: '原味鸡(半只)', price: 59, disliked: false },
    { name: '口味牛腩', price: 65, disliked: false },
    { name: '口味土鸡爪', price: 39, disliked: false },
    { name: '青椒炒甲鱼', price: 88, disliked: false },
    { name: '香辣鸭排', price: 43, disliked: false },
    { name: '肉沫蒸蛋', price: 26, disliked: false },
    { name: '蒜蓉焗蝴蝶虾', price: 59, disliked: false },
    { name: '香辣猪蹄(大)', price: 89, disliked: false },
    { name: '香辣猪蹄(小)', price: 59, disliked: false },
    { name: '丝瓜鱼泡', price: 39, disliked: false },
    { name: '海带龙骨汤(大)', price: 59, disliked: false },
    { name: '海带龙骨汤(小)', price: 32, disliked: false },
    { name: '芹菜叶汤', price: 29, disliked: false },
    { name: '油炸花生', price: 9, disliked: false },
    { name: '凉拌木瓜丝', price: 9, disliked: false },
    { name: '手工芝麻饼(12个)', price: 36, disliked: false },
    { name: '手工芝麻饼(6个)', price: 22, disliked: false },
    { name: '玉米粑粑(12个)', price: 36, disliked: false },
    { name: '玉米粑粑(6个)', price: 22, disliked: false },
]

let orders = []
let clients = []
let peopleCount = 1

server.route({
    method: 'GET',
    path: '/',
    handler: (request, h) => {
        return 'Hapi.js WebSocket Server is running!'
    },
})

const usernames = [
    '多啦A梦',
    '大雄',
    '静香',
    '胖虎',
    '小夫',
    '蜡笔小新',
    '风间彻',
    '妮妮',
    '正男',
    '阿呆',
    '樱桃小丸子',
    '花轮和彦',
    '丸尾末男',
    '野口笑子',
    '富田太郎',
    '海绵宝宝',
    '派大星',
    '章鱼哥',
    '蟹老板',
    '珊迪',
    '汤姆猫',
    '杰瑞鼠',
    '加菲猫',
    '奥迪',
    '米老鼠',
    '唐老鸭',
    '黛丝',
    '高飞',
    '布鲁托',
    '史努比',
    '查理·布朗',
    '露西',
    '史洛德',
    '胡士托',
    '兔八哥',
    '达菲鸭',
    '猪小弟',
    '大力水手',
    '奥利弗',
    '波派',
    '贝蒂',
    '啄木鸟伍迪',
    '黑猫警长',
    '一只耳',
    '蓝精灵',
    '格格巫',
    '阿兹猫',
    '加菲猫',
]

// 选择一个随机的用户名
function getRandomUsername() {
    const randomIndex = Math.floor(Math.random() * usernames.length)
    return usernames[randomIndex]
}

const startServer = async () => {
    try {
        await server.start()
        console.log(`Server running at: ${server.info.uri}`)

        const wss = new WebSocketServer({ server: server.listener })

        wss.on('connection', (socket) => {
            // 随机选择用户名
            const username = getRandomUsername()
            clients.push({ socket, username })

            sendInitialData(socket, username)

            socket.on('message', (message) => {
                const data = JSON.parse(message)
                handleSocketMessage(data, socket)
            })

            socket.on('close', () => {
                clients = clients.filter((client) => client.socket !== socket)
                broadcastPeopleCount()
            })
        })

        console.log('WebSocket Server is running!')
    } catch (err) {
        console.error(err)
    }
}

function sendInitialData(socket, username) {
    socket.send(JSON.stringify({ type: 'menuUpdate', menu: menuItems }))
    socket.send(JSON.stringify({ type: 'orderUpdate', orders }))
    socket.send(JSON.stringify({ type: 'peopleCountUpdate', peopleCount }))
    socket.send(JSON.stringify({ type: 'usernameUpdate', username }))
}

function handleSocketMessage(data, socket) {
    switch (data.type) {
        case 'menuUpdate':
            menuItems.splice(0, menuItems.length, ...data.menu)
            broadcastMenuUpdates()
            break
        case 'orderUpdate':
            orders.splice(0, orders.length, ...data.orders)
            broadcastOrderUpdates()
            break
        case 'peopleCountUpdate':
            peopleCount = data.peopleCount
            broadcastPeopleCount()
            break
        case 'usernameUpdate':
            const client = clients.find((c) => c.socket === socket)
            if (client) {
                client.username = data.username
            }
            break
        default:
            console.warn('Unknown message type:', data.type)
    }
}

function broadcastMenuUpdates() {
    clients.forEach((client) => {
        if (client.socket.readyState === client.socket.OPEN) {
            client.socket.send(
                JSON.stringify({ type: 'menuUpdate', menu: menuItems })
            )
        }
    })
}

function broadcastOrderUpdates() {
    const totalPrice = orders.reduce(
        (sum, order) => sum + order.price * order.quantity,
        0
    )
    const averagePrice = clients.length > 0 ? totalPrice / clients.length : 0

    clients.forEach((client) => {
        if (client.socket.readyState === client.socket.OPEN) {
            client.socket.send(JSON.stringify({ type: 'orderUpdate', orders }))
            client.socket.send(
                JSON.stringify({
                    type: 'totalPriceUpdate',
                    totalPrice: totalPrice.toFixed(2),
                    averagePrice: averagePrice.toFixed(2),
                })
            )
        }
    })
}

function broadcastPeopleCount() {
    clients.forEach((client) => {
        if (client.socket.readyState === client.socket.OPEN) {
            client.socket.send(
                JSON.stringify({ type: 'peopleCountUpdate', peopleCount })
            )
        }
    })
}

startServer()
