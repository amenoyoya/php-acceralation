/**
 * node-ssh による ssh 接続テスト
 *
 * $ docker-compose up -d
 * $ node tests/ssh.js -h <host> -p <port> -u <username> -s <password> -i <privatekey>
 * # ex) $ node tests/ssh.js -p 12256 -i sshkey/id_rsa
 */
const argv = require('yargs').argv
const {NodeSSH} = require('node-ssh')

const main = async () => {
  const ssh = new NodeSSH()
  // 接続
  await ssh.connect({
    host: argv.h || '127.0.0.1',
    port: argv.p || 22,
    username: argv.u || 'root',
    password: argv.s,
    privateKey: argv.i,
  })
  // コマンド実行
  const res = await ssh.execCommand('ls -al', {options: {pty: true}})
  console.log(res)
  // 切断
  ssh.dispose()
}

main()