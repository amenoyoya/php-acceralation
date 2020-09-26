const schedule = require('node-schedule')
const parser = require('cron-parser')
const nedb = require('./lib/nedb')
const omit = require('./lib/omit')
const dayjs = require('dayjs')

dayjs.locale('ja')

/**
 * NeDB.@crons.schedule を cron-parser で解析し、NeDB.@jobs にジョブを追加する
 * @schedule every 30 seconds
 * @note NeDB.@crons: {
 *   _id: string,
 *   schedule: string, // cron書式の定期実行スケジュール
 *   ... // その他ジョブとして登録したい情報
 * }
 */
schedule.scheduleJob('*/30 * * * * *', async () => {
  const jobs = nedb('@jobs')
  for (const cron of await nedb('@crons').find()) {
    try {
      // job 未登録か判定
      if (await jobs.count({cron_id: cron._id}) > 0) {
        continue
      }
      const interval = parser.parseExpression(cron.schedule)
      const job = omit(cron, ['_id']) // cron オブジェクトから _id プロパティを抜いたものを取得
      // 次の実行スケジュールを schedule にセットして NeDB.@jobs に挿入
      job.schedule = dayjs(interval.next().toString()).format()
      job.cron_id = cron._id
      await jobs.insert(job)
    } catch (err) {
      console.log(err)
      continue
    }
  }
})

/**
 * WebSocket event handler
 */
module.exports = (io, socket) => {
  /**
   * 動作確認用
   * @event message
   * @action クライアントから受信したデータをそのまま送信
   */
  socket.on('message', msg => {
    console.log('get message: ', msg)
    io.emit('message', msg)
  })

  /**
   * NeDB.@jobs.schedule が現在日時より過去のデータをクライアントに送信
   * @schedule every minutes
   * @note NeDB.@jobs: {
   *   _id: string,
   *   cron_id: string, // cron定期実行ジョブの場合、参照元の NeDB.@crons._id
   *   schedule: string, // 送信する予定日時
   *   ... // その他送信したい情報
   * }
   */
  schedule.scheduleJob('* * * * *', async () => {
    const jobs = nedb('@jobs')
    for (const job of await jobs.find({schedule: {$lte: dayjs().format()}})) {
      // 'cron'イベントとして job データを送信
      io.emit('cron', job)
      // NeDB.@jobs から NeDB.@end_jobs にデータ移行
      const end_job = omit(job, ['_id']) // job オブジェクトから _id プロパティを抜いたものを取得
      await jobs.remove({_id: job._id})
      await nedb('@end_jobs').insert(end_job)
    }
  })
}
