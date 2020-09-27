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
  const packageManager = await ssh.getPackageManager()
  const phpVer = await ssh.getPHPVersion()
  console.log(`install OPcache: ${await ssh.installOPcache(packageManager, phpVer.ver)}`)
  console.log(await ssh.getPHPModules())
  // 切断
  ssh.dispose()
}

main()