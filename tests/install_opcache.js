/**
 * ssh接続先サーバでOPcacheインストール
 *
 * $ docker-compose up -d
 * $ node tests/analyze.js -h <host> -p <port> -u <username> -s <password> -i <privatekey>
 * # ex) $ node tests/analyze_os.js -p 12256 -i sshkey/id_rsa
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
  const info = await ssh.getInfo()
  const phpVer = await ssh.getPHPVersion()
  const phpMods = await ssh.getPHPModules()
  console.log('[Server Info]')
  console.log(info)
  console.log('[PHP Info]')
  console.log(phpVer)
  console.log(phpMods)
  // OPcacheインストール可能か判定
  if (info.sudo && phpVer.ver >= 55) {
    if (phpMods.match(/opcache/i)) {
      console.log('OPcache already installed on this server')
    } else {
      console.log(`install OPcache: ${await ssh.installOPcache(info.packageManager, info.repositories, phpVer.ver)}`)
    }
  } else {
    console.log('Cannot install OPcache on this server')
  }
  // 切断
  ssh.dispose()
}

main()