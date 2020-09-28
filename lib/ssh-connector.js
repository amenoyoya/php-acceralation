const {NodeSSH} = require('node-ssh')

/**
 * SSHサーバ接続
 * @param {*} option {host, port, username, password, privateKey}
 * @param {function[]} plugins
 * @return {NodeSSH}
 */
module.exports = async (option, plugins = [require('./ssh-plugin-php')]) => {
  const ssh = new NodeSSH()
  // 接続
  await ssh.connect(option)

  /**
   * SSHコマンド実行メソッド
   * @param {string} command
   * @return {*} 
   */
  ssh.command = async command => await ssh.execCommand(command, {options: {pty: true}})

  /**
   * OS取得メソッド
   * @return {string} 'centos'|'amazon_linux'|'debian'
   */
  ssh.getOS = async () => {
    const res = await ssh.command(
      `if [ -e /etc/debian_version ] || [ -e /etc/debian_release ]; then echo debian; fi`
    )
    if (res.stdout) {
      return 'debian'
    }
    for (const os of ['amazon_linux', 'centos']) {
      const res = await ssh.command(
        `sudo find /etc/ -name '*-release' | xargs grep '${os}'`
      )
      if (res.stdout) {
        return os
      }
    }
    return ''
  }

  /**
   * パッケージマネージャ取得メソッド
   * @return {{packageManager: string, repositories: string[]} | boolean}
   */
  ssh.getPackageManager = async () => {
    for (const pm of ['yum', 'apt-get']) {
      if ((await ssh.command(`which ${pm}`)).stdout) {
        return {
          packageManager: pm,
          repositories: pm === 'yum'?
            (await ssh.command(`sudo ls -l /etc/yum.repos.d/ | tr -s ' ' | cut -d ' ' -f 9`)).stdout.split('\n').map(row => row.match(/^([^\.]+)/)[1])
            : (await ssh.command('sudo apt-cache policy')).stdout.split('\n').filter(row => row.match(/^\s*\d+/)).map(row => row.match(/^\s*\d+\s*(\S+)/)[1])
        }
      }
    }
    return false
  }

  /**
   * サービスコマンド取得メソッド
   * @return {string} 'systemctl'|'service'
   */
  ssh.getServiceCommand = async () => {
    for (const sc of ['systemctl', 'service']) {
      if ((await ssh.command(`which ${sc}`)).stdout) {
        return sc
      }
    }
    return ''
  }

  /**
   * サーバ基本情報をまとめて取得するメソッド
   * @return {
   *    sudo: boolean // sudoコマンド実行可能?
   *    os: string // OS名
   *    packageManager: string // パッケージマネージャ
   *    repositories: string[] // インストール済みリポジトリ
   *    serviceCommand: string // サービスコマンド
   * }
   */
  ssh.getInfo = async () => {
    return {
      sudo: (await ssh.command('sudo whoami')).stdout === 'root',
      os: await ssh.getOS(),
      ...(await ssh.getPackageManager()),
      serviceCommand: await ssh.getServiceCommand(),
    }
  }

  // プラグイン適用
  for (const plugin of plugins) {
    plugin(ssh)
  }

  return ssh
}
