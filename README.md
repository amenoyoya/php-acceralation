# php-acceralation

OPcache, APCu を導入して PHP 環境を高速化する支援ツール

## Memo

### OS判定
```bash
if [ "$(sudo find /etc/ -name '*-release' | xargs grep 'amazon_linux:2')" != "" ]; then
    os='AmazonLinux2'
elif [ "$(sudo find /etc/ -name '*-release' | xargs grep 'centos:6')" != "" ]; then
    os='CentOS6'
elif [ "$(sudo find /etc/ -name '*-release'  | xargs grep 'centos:7')" != "" ]; then
    os='CentOS7'
elif [ -e /etc/debian_version ] || [ -e /etc/debian_release ]; then
    os='Debian'
fi
```
