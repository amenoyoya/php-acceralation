/**
 * ssh接続先サーバの情報収集
 *
 * $ docker-compose up -d
 * $ node tests/analyze.js -h <host> -p <port> -u <username> -s <password> -i <privatekey>
 * # ex) $ node tests/analyze.js -p 12256 -i sshkey/id_rsa
 */
const argv = require('yargs').argv
const connectSSH = require('../lib/ssh-connector')

const main = async () => {
  // SSH接続
  const ssh = await connectSSH({
    host: argv.h || '127.0.0.1',
    port: argv.p || 22,
    username: argv.u || 'root',
    password: argv.s,
    privateKey: argv.i,
  })
  // 情報収集
  console.log('[Server Info]')
  console.log(await ssh.getInfo())
  console.log('[PHP Info]')
  console.log(await ssh.getPHPVersion())
  console.log(await ssh.getPHPModules())
  // 切断
  ssh.dispose()
}

main()