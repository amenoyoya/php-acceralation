/**
 * PHP関連プラグイン
 */
module.exports = ssh => {
  /**
   * PHPバージョン取得
   * @return {{fullver: string, ver: number} | boolean}
   */
  ssh.getPHPVersion = async () => {
    const ver = (await ssh.command('php -v')).stdout.match(/PHP\s+(\d+\.\d+\.\d+)/)
    if (!ver) {
      return false
    }
    const vers = ver[1].split('.')
    return {
      fullver: ver[1],
      ver: parseInt(vers[0] + vers[1]),
    }
  }

  /**
   * PHPモジュール取得
   * @return {string}
   */
  ssh.getPHPModules = async () => (await ssh.command('php -m')).stdout

  /**
   * OPcache インストール
   * @param {string} packageManager 'yum'|'apt-get'
   * @param {number} phpVer 二桁のバージョン: 56, 73, ...etc
   * @return {boolean}
   */
  ssh.installOPcache = async (packageManager, phpVer) => {
    if (packageManager === 'apt-get') {
      phpVer = Math.floor(phpVer / 10) + '.' + (phpVer - Math.floor(phpVer / 10) * 10)
    }
    for (const mod of [`php${phpVer}-php-opcache`, 'php-opcache']) {
      // console.log(`sudo ${packageManager} install -y ${mod}`)
      // console.log((await ssh.command(`sudo ${packageManager} install -y ${mod}`)).stdout)
      if ((await ssh.getPHPModules()).match(/opcache/i)) {
        return true
      }
    }
    return false
  }
}