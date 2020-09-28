FROM debian:stretch-slim

COPY ./authorized_keys /root/.ssh/authorized_keys

RUN : 'install packages' && \
    apt-get update && apt-get install -y \
        sudo vim wget gnupg openssh-server locales apt-transport-https && \
    : 'set locale' && \
    locale-gen ja_JP.UTF-8 && \
    localedef -f UTF-8 -i ja_JP ja_JP.utf8 && \
    : 'change root password' && \
    echo 'root:root' | chpasswd && \
    : 'ssh setting' && \
    chmod 600 ~/.ssh/authorized_keys && \
    mkdir -p /var/run/sshd && \
    sed -iE 's/^#\?\s*PubkeyAuthentication.*/PubkeyAuthentication yes/' /etc/ssh/sshd_config && \
    sed -iE 's/^#\?\s*PermitRootLogin.*/PermitRootLogin yes/' /etc/ssh/sshd_config && \
    : 'install apache, php73' && \
    wget -q https://packages.sury.org/php/apt.gpg -O- | apt-key add - && \
    echo "deb https://packages.sury.org/php/ stretch main" | tee /etc/apt/sources.list.d/php.list && \
    apt-get update && apt-get install -y \
        apache2 php7.3 php7.3-mbstring php7.3-gd && \
    : 'clear yum cache' && \
    apt-get clean all

ENV TZ="Asia/Tokyo" \
    LANG="ja_JP.UTF-8" \
    LANGUAGE="ja_JP:ja" \
    LC_ALL="ja_JP.UTF-8"

EXPOSE 22
CMD ["bash", "-c", "/usr/sbin/sshd -D && apachectl -D BACKGROUND"]
