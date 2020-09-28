/**
 * yum: disablerepo, enablerepo 付き install コマンド生成
 * @param {string[]} repositories
 * @param {number} phpVer
 * @return {string} yum install --disablerepo=amzn2-core --enablerepo=epel,remi,remi-php<phpVer> 
 */
const yumInstall = (repositories, phpVer) => {
  const remi = `remi-php${phpVer}`
  const disablerepo = repositories.includes('amzn2-core')? '--disablerepo=amzn2-core': ''
  const enablerepo = repositories.includes('epel') && repositories.includes('remi')? `--enablerepo=epel,remi,${remi}`: ''
  return `yum install ${disablerepo} ${enablerepo}`
}

/**
 * yum で PHP モジュールインストール
 * @param {NodeSSH} ssh
 * @param {string[]} repositories
 * @param {number} phpVer
 * @param {string} module
 * @return {boolean}
 */
const yumInstallPHPModule = async (ssh, repositories, phpVer, module) => {
  console.log(`sudo ${yumInstall(repositories, phpVer)} -y php-${module}`)
  await ssh.command(`sudo ${yumInstall(repositories, phpVer)} -y php-${module}`)
  if ((await ssh.getPHPModules()).match(new RegExp(module, 'i'))) {
    return true
  }
  console.log(`sudo yum install -y php${phpVer}-php-${module}`)
  await ssh.command(`sudo yum install -y php${phpVer}-php-${module}`)
  return (await ssh.getPHPModules()).match(new RegExp(module, 'i'))? true: false
}

/**
 * apt-get で PHP モジュールインストール
 * @param {NodeSSH} ssh
 * @param {number} phpVer
 * @param {string} module
 * @return {boolean}
 */
const aptInstallPHPModule = async (ssh, phpVer, module) => {
  phpVer = Math.floor(phpVer / 10) + '.' + (phpVer - Math.floor(phpVer / 10) * 10)
  for (const mod of [`php${phpVer}-php-${module}`, `php-${module}`]) {
    console.log(`sudo apt-get install -y ${mod}`)
    await ssh.command(`sudo apt-get install -y ${mod}`)
    if ((await ssh.getPHPModules()).match(new RegExp(module, 'i'))) {
      return true
    }
  }
  return false
}

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
   * PHPモジュールインストール
   * @param {string} packageManager 'yum'|'apt-get'
   * @param {string[]} repositories
   * @param {number} phpVer 二桁のバージョン: 56, 73, ...etc
   * @param {string} module 'opcache', 'apcu', ...
   * @return {boolean}
   */
  ssh.installPHPModule = async (packageManager, repositories, phpVer, module) => {
    if (packageManager === 'yum') {
      return await yumInstallPHPModule(ssh, repositories, phpVer, module)
    }
    return await aptInstallPHPModule(ssh, phpVer, module)
  }
}