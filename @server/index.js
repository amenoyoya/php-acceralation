const express = require('express')
const app = express()

const http = require('http').Server(app)
const io = require('socket.io')(http)

const cookieParser = require('cookie-parser')
// const cors = require('cors')

/**
 * process.env form .env
 */
require('dotenv').config()

// ※ Express 4.16 以降、Body-Parser機能は標準搭載されている
// ※ 4.16 未満のバージョンを使っている場合は、別途 body-parser パッケージのインストールが必要
/**
 * クライアントデータを JSON 形式で取得可能にする
 * limit: POSTデータの上限サイズを設定
 */
app.use(express.json({ limit: '50mb' }));

/**
 * limit: POSTデータの上限サイズを設定
 * extended: 配列型のフォームデータを取得可能にする
 */
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ※ Express 4.X 以降 cookie-parser は標準搭載されていないため、別途インストール
app.use(cookieParser())

// CORSセキュリティ: nuxt app からのリクエストのみ許可
// app.use(cors({
//   origin: process.env.APP_URI
// }))

// API base URI
const basepath = ''

/**
 * NeDB REST API: /nedb/*
 */
app.use(`${basepath}/nedb`, require('./api_nedb'))

/**
 * Utility REST API: /util/*
 */
app.use(`${basepath}/util`, require('./api_util'))

/**
 * Nuxt system REST API: /nuxt/*
 */
app.use(`${basepath}/nuxt`, require('./api_nuxt'))

/**
 * socket.io listening: ws://localhost:3333/
 */
io.on('connection', socket => {
  console.log(`WebSocket client connected`)
  require('./api_socket')(io, socket)
})

// const port = process.env.SERVER_PORT || 3333

// listen: http://localhost:3333/
// http.listen(port, () => {
//   console.log(`Backend server\nListening on: http://localhost:${port}/`)
// })

module.exports = {
  path: '/server',
  handle: app,
}
