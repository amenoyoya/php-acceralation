/**
 * ssh接続先サーバのOS判定
 *
 * $ docker-compose up -d
 * $ node tests/analyze_os.js -h <host> -p <port> -u <username> -s <password> -i <privatekey>
 * # ex) $ node tests/analyze_os.js -p 12256 -i sshkey/id_rsa
 */
const argv = require('yargs').argv
const {NodeSSH} = require('node-ssh')

/**
 * OS判定コマンド実行
 * @param {NodeSSH} ssh
 * @param {string} os
 * @return {boolean}
 */
const judgeOS = async (ssh, os) => {
  if (os === 'debian') {
    const res = await ssh.execCommand(
      `if [ -e /etc/debian_version ] || [ -e /etc/debian_release ]; then echo ${os}; fi`,
      {options: {pty: true}}
    )
    return res.stdout? true: false
  }
  const res = await ssh.execCommand(
    `sudo find /etc/ -name '*-release' | xargs grep '${os}'`,
    {options: {pty: true}}
  )
  return res.stdout? true: false
}

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
  // OS判定
  for (const os of ['amazon_linux:2', 'centos:6', 'centos:7', 'debian']) {
    if (await judgeOS(ssh, os)) {
      console.log(`The OS is ${os}`)
    }
  }
  // 切断
  ssh.dispose()
}

main()