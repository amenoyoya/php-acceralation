import Vue from 'vue'

// window.{{globals.loadedCallback}} hook
// Useful for jsdom testing or plugins (https://github.com/tmpvar/jsdom#dealing-with-asynchronous-script-loading)
if (process.client) {
  window.onNuxtReadyCbs = []
  window.onNuxtReady = (cb) => {
    window.onNuxtReadyCbs.push(cb)
  }
}

export function empty () {}

export function globalHandleError (error) {
  if (Vue.config.errorHandler) {
    Vue.config.errorHandler(error)
  }
}

export function interopDefault (promise) {
  return promise.then(m => m.default || m)
}

export function hasFetch(vm) {
  return vm.$options && typeof vm.$options.fetch === 'function' && !vm.$options.fetch.length
}
export function getChildrenComponentInstancesUsingFetch(vm, instances = []) {
  const children = vm.$children || []
  for (const child of children) {
    if (child.$fetch) {
      instances.push(child)
      continue; // Don't get the children since it will reload the template
    }
    if (child.$children) {
      getChildrenComponentInstancesUsingFetch(child, instances)
    }
  }
  return instances
}

export function applyAsyncData (Component, asyncData) {
  if (
    // For SSR, we once all this function without second param to just apply asyncData
    // Prevent doing this for each SSR request
    !asyncData && Component.options.__hasNuxtData
  ) {
    return
  }

  const ComponentData = Component.options._originDataFn || Component.options.data || function () { return {} }
  Component.options._originDataFn = ComponentData

  Component.options.data = function () {
    const data = ComponentData.call(this, this)
    if (this.$ssrContext) {
      asyncData = this.$ssrContext.asyncData[Component.cid]
    }
    return { ...data, ...asyncData }
  }

  Component.options.__hasNuxtData = true

  if (Component._Ctor && Component._Ctor.options) {
    Component._Ctor.options.data = Component.options.data
  }
}

export function sanitizeComponent (Component) {
  // If Component already sanitized
  if (Component.options && Component._Ctor === Component) {
    return Component
  }
  if (!Component.options) {
    Component = Vue.extend(Component) // fix issue #6
    Component._Ctor = Component
  } else {
    Component._Ctor = Component
    Component.extendOptions = Component.options
  }
  // If no component name defined, set file path as name, (also fixes #5703)
  if (!Component.options.name && Component.options.__file) {
    Component.options.name = Component.options.__file
  }
  return Component
}

export function getMatchedComponents (route, matches = false, prop = 'components') {
  return Array.prototype.concat.apply([], route.matched.map((m, index) => {
    return Object.keys(m[prop]).map((key) => {
      matches && matches.push(index)
      return m[prop][key]
    })
  }))
}

export function getMatchedComponentsInstances (route, matches = false) {
  return getMatchedComponents(route, matches, 'instances')
}

export function flatMapComponents (route, fn) {
  return Array.prototype.concat.apply([], route.matched.map((m, index) => {
    return Object.keys(m.components).reduce((promises, key) => {
      if (m.components[key]) {
        promises.push(fn(m.components[key], m.instances[key], m, key, index))
      } else {
        delete m.components[key]
      }
      return promises
    }, [])
  }))
}

export function resolveRouteComponents (route, fn) {
  return Promise.all(
    flatMapComponents(route, async (Component, instance, match, key) => {
      // If component is a function, resolve it
      if (typeof Component === 'function' && !Component.options) {
        Component = await Component()
      }
      match.components[key] = Component = sanitizeComponent(Component)
      return typeof fn === 'function' ? fn(Component, instance, match, key) : Component
    })
  )
}

export async function getRouteData (route) {
  if (!route) {
    return
  }
  // Make sure the components are resolved (code-splitting)
  await resolveRouteComponents(route)
  // Send back a copy of route with meta based on Component definition
  return {
    ...route,
    meta: getMatchedComponents(route).map((Component, index) => {
      return { ...Component.options.meta, ...(route.matched[index] || {}).meta }
    })
  }
}

export async function setContext (app, context) {
  // If context not defined, create it
  if (!app.context) {
    app.context = {
      isStatic: process.static,
      isDev: true,
      isHMR: false,
      app,

      payload: context.payload,
      error: context.error,
      base: '/',
      env: {"LESSOPEN":"| /usr/bin/lesspipe %s","npm_package_dependencies_nedb_promises":"^4.0.4","USER":"user","npm_package_dependencies_bcryptjs":"^2.4.3","npm_config_version_commit_hooks":"true","npm_config_user_agent":"yarn/1.22.4 npm/? node/v12.18.2 linux x64","npm_package_scripts_start_frontend":"nuxt","npm_package_dependencies_socket_io":"^2.3.0","npm_package_dependencies_postcss_import":"^12.0.1","npm_config_bin_links":"true","npm_config_wrap_output":"","GIT_ASKPASS":"/home/user/.vscode-server/bin/58bb7b2331731bf72587010e943852e13e6fd3cf/extensions/git/dist/askpass.sh","npm_node_execpath":"/home/user/.anyenv/envs/nodenv/versions/12.18.2/bin/node","npm_package_dependencies_vue_ctk_date_time_picker":"^2.5.0","npm_package_dependencies__nuxtjs_toast":"^3.3.1","npm_config_init_version":"1.0.0","SHLVL":"1","HOME":"/home/user","NODENV_HOOK_PATH":"/home/user/.anyenv/envs/nodenv/nodenv.d:/usr/local/etc/nodenv.d:/etc/nodenv.d:/usr/lib/nodenv/hooks:/home/user/.anyenv/envs/nodenv/plugins/nodenv-default-packages/etc/nodenv.d:/home/user/.anyenv/envs/nodenv/plugins/nodenv-vars/etc/nodenv.d:/home/user/.anyenv/envs/nodenv/plugins/nodenv-yarn-install/etc/nodenv.d","TERM_PROGRAM_VERSION":"1.49.2","VSCODE_IPC_HOOK_CLI":"/tmp/vscode-ipc-ba16111a-f9d6-44d4-8d5c-e6e9d7e783c2.sock","npm_package_scripts_start_backend":"node @server/index.js","npm_package_dependencies_vuejs_dialog":"^1.4.2","PYENV_SHELL":"bash","npm_config_init_license":"MIT","VSCODE_GIT_ASKPASS_MAIN":"/home/user/.vscode-server/bin/58bb7b2331731bf72587010e943852e13e6fd3cf/extensions/git/dist/askpass-main.js","YARN_WRAP_OUTPUT":"false","npm_package_dependencies_nuxt_purgecss":"^1.0.0","npm_config_version_tag_prefix":"v","VSCODE_GIT_ASKPASS_NODE":"/home/user/.vscode-server/bin/58bb7b2331731bf72587010e943852e13e6fd3cf/node","npm_package_scripts_serve":"nuxt start","NODENV_VERSION":"12.18.2","npm_package_dependencies_dayjs":"^1.8.35","npm_package_dependencies_node_ssh":"^11.1.0","COLORTERM":"truecolor","WSL_DISTRO_NAME":"ubuntu-focal","PIPE_LOGGING":"true","npm_package_description":"OPcache, APCu を導入して PHP 環境を高速化する支援ツール","npm_package_dependencies__fortawesome_free_solid_svg_icons":"^5.14.0","npm_package_readmeFilename":"README.md","npm_package_dependencies_nuxt":"^2.14.4","npm_package_scripts_dev":"nuxt","GTK_IM_MODULE":"fcitx","LOGNAME":"user","npm_package_dependencies_vue2_editor":"^2.10.2","npm_package_dependencies_node_schedule":"^1.3.2","npm_package_dependencies_maildev":"^1.1.0","NAME":"MSI","WSL_INTEROP":"/run/WSL/13564_interop","npm_package_dependencies_express":"^4.17.1","npm_package_dependencies_vue2_ace_editor":"^0.0.15","npm_config_registry":"https://registry.yarnpkg.com","TERM":"xterm-256color","npm_package_dependencies_postcss_nested":"^4.2.3","NODENV_ROOT":"/home/user/.anyenv/envs/nodenv","npm_package_scripts_start":"run-p start:*","npm_config_ignore_scripts":"","npm_package_scripts_start_smtp":"maildev -s 3025 -w 3080 --base-pathname /maildev","npm_package_dependencies_nuxt_basic_auth_module":"^1.3.2","npm_package_dependencies_axios":"^0.20.0","npm_package_dependencies__fortawesome_fontawesome_free_webfonts":"^1.0.9","PATH":"/tmp/yarn--1601132370074-0.3882194422365204:/home/user/app/nodejs/php-acceralation/node_modules/.bin:/home/user/.config/yarn/link/node_modules/.bin:/home/user/.anyenv/envs/nodenv/versions/12.18.2/libexec/lib/node_modules/npm/bin/node-gyp-bin:/home/user/.anyenv/envs/nodenv/versions/12.18.2/lib/node_modules/npm/bin/node-gyp-bin:/home/user/.anyenv/envs/nodenv/versions/12.18.2/bin/node_modules/npm/bin/node-gyp-bin:/tmp/yarn--1601132369821-0.7579421820956149:/home/user/app/nodejs/php-acceralation/node_modules/.bin:/home/user/.config/yarn/link/node_modules/.bin:/home/user/.anyenv/envs/nodenv/versions/12.18.2/libexec/lib/node_modules/npm/bin/node-gyp-bin:/home/user/.anyenv/envs/nodenv/versions/12.18.2/lib/node_modules/npm/bin/node-gyp-bin:/home/user/.anyenv/envs/nodenv/versions/12.18.2/bin/node_modules/npm/bin/node-gyp-bin:/home/user/.anyenv/envs/nodenv/versions/12.18.2/bin:/home/user/.anyenv/envs/nodenv/libexec:/home/user/.anyenv/envs/nodenv/plugins/nodenv-vars/bin:/home/user/.anyenv/envs/nodenv/plugins/nodenv-default-packages/bin:/home/user/.anyenv/envs/nodenv/plugins/node-build/bin:/home/user/.kusanagi/bin:/home/user/.anyenv/envs/pyenv/shims:/home/user/.yarn/bin:/home/user/.anyenv/envs/pyenv/shims:/home/user/.anyenv/envs/pyenv/bin:/home/user/.anyenv/envs/nodenv/shims:/home/user/.anyenv/envs/nodenv/bin:/home/linuxbrew/.linuxbrew/bin:/home/user/.vscode-server/bin/e5e9e69aed6e1984f7499b7af85b3d05f9a6883a/bin:/home/linuxbrew/.linuxbrew/opt/python@3.8/bin:/home/linuxbrew/.linuxbrew/opt/python@3.8/bin:/home/user/.kusanagi/bin:/home/user/.anyenv/envs/pyenv/shims:/home/user/.yarn/bin:/home/user/.anyenv/envs/pyenv/shims:/home/user/.anyenv/envs/pyenv/bin:/home/user/.anyenv/envs/nodenv/shims:/home/user/.anyenv/envs/nodenv/bin:/home/linuxbrew/.linuxbrew/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/mnt/c/Program Files/NVIDIA GPU Computing Toolkit/CUDA/v10.0/bin:/mnt/c/Program Files/NVIDIA GPU Computing Toolkit/CUDA/v10.0/libnvvp:/mnt/c/Windows/system32:/mnt/c/Windows:/mnt/c/Windows/System32/Wbem:/mnt/c/Windows/System32/WindowsPowerShell/v1.0/:/mnt/c/Windows/System32/OpenSSH/:/mnt/c/Program Files (x86)/NVIDIA Corporation/PhysX/Common:/mnt/c/Program Files/NVIDIA Corporation/NVIDIA NvDLISR:/mnt/c/ProgramData/chocolatey/bin:/mnt/c/App/win-dev-tools/bin:/mnt/c/App/win-dev-tools/bin/nodejs:/mnt/c/App/cuda/bin:/mnt/c/Program Files (x86)/Calibre2/:/mnt/c/Program Files/OpenJDK/jdk-13.0.2/bin:/mnt/c/Users/user/AppData/Local/Yarn/bin:/mnt/c/Program Files/Microsoft VS Code/bin:/mnt/c/Program Files/Git/cmd:/mnt/c/WINDOWS/system32:/mnt/c/WINDOWS:/mnt/c/WINDOWS/System32/Wbem:/mnt/c/WINDOWS/System32/WindowsPowerShell/v1.0/:/mnt/c/WINDOWS/System32/OpenSSH/:/mnt/c/tools/lxrunoffline:/mnt/c/Windows/system32:/mnt/c/Windows:/mnt/c/Windows/System32/Wbem:/mnt/c/Windows/System32/WindowsPowerShell/v1.0/:/mnt/c/Windows/System32/OpenSSH/:/mnt/c/Program Files (x86)/NVIDIA Corporation/PhysX/Common:/mnt/c/Program Files/NVIDIA Corporation/NVIDIA NGX:/mnt/c/Program Files/NVIDIA Corporation/NVIDIA NvDLISR:/mnt/c/ProgramData/chocolatey/bin:/mnt/c/App/win-dev-tools/bin:/mnt/c/App/win-dev-tools/bin/nodejs:/mnt/c/Users/user/AppData/Local/Microsoft/WindowsApps:/mnt/c/Users/user/go/bin:/mnt/c/Program Files/Oracle/VirtualBox:/mnt/c/Users/user/AppData/Roaming/Composer/vendor/bin/usr/bin/mingw64/bin:/mnt/c/Users/user/AppData/Local/Programs/Microsoft VS Code/bin:/mnt/c/Users/user/AppData/Local/Microsoft/WindowsApps","NODE":"/home/user/.anyenv/envs/nodenv/versions/12.18.2/bin/node","npm_package_name":"","npm_package_dependencies_nodemailer":"^6.4.11","npm_package_dependencies_yargs":"^16.0.3","DISPLAY":"172.19.16.1:0.0","npm_package_scripts_buildup":"nuxt build && run-p serve start:backend start:smtp","npm_package_dependencies_npm_run_all":"^4.1.5","LANG":"ja_JP.UTF-8","XMODIFIERS":"@im=fcitx","LS_COLORS":"rs=0:di=01;34:ln=01;36:mh=00:pi=40;33:so=01;35:do=01;35:bd=40;33;01:cd=40;33;01:or=40;31;01:mi=00:su=37;41:sg=30;43:ca=30;41:tw=30;42:ow=34;42:st=37;44:ex=01;32:*.tar=01;31:*.tgz=01;31:*.arc=01;31:*.arj=01;31:*.taz=01;31:*.lha=01;31:*.lz4=01;31:*.lzh=01;31:*.lzma=01;31:*.tlz=01;31:*.txz=01;31:*.tzo=01;31:*.t7z=01;31:*.zip=01;31:*.z=01;31:*.dz=01;31:*.gz=01;31:*.lrz=01;31:*.lz=01;31:*.lzo=01;31:*.xz=01;31:*.zst=01;31:*.tzst=01;31:*.bz2=01;31:*.bz=01;31:*.tbz=01;31:*.tbz2=01;31:*.tz=01;31:*.deb=01;31:*.rpm=01;31:*.jar=01;31:*.war=01;31:*.ear=01;31:*.sar=01;31:*.rar=01;31:*.alz=01;31:*.ace=01;31:*.zoo=01;31:*.cpio=01;31:*.7z=01;31:*.rz=01;31:*.cab=01;31:*.wim=01;31:*.swm=01;31:*.dwm=01;31:*.esd=01;31:*.jpg=01;35:*.jpeg=01;35:*.mjpg=01;35:*.mjpeg=01;35:*.gif=01;35:*.bmp=01;35:*.pbm=01;35:*.pgm=01;35:*.ppm=01;35:*.tga=01;35:*.xbm=01;35:*.xpm=01;35:*.tif=01;35:*.tiff=01;35:*.png=01;35:*.svg=01;35:*.svgz=01;35:*.mng=01;35:*.pcx=01;35:*.mov=01;35:*.mpg=01;35:*.mpeg=01;35:*.m2v=01;35:*.mkv=01;35:*.webm=01;35:*.ogm=01;35:*.mp4=01;35:*.m4v=01;35:*.mp4v=01;35:*.vob=01;35:*.qt=01;35:*.nuv=01;35:*.wmv=01;35:*.asf=01;35:*.rm=01;35:*.rmvb=01;35:*.flc=01;35:*.avi=01;35:*.fli=01;35:*.flv=01;35:*.gl=01;35:*.dl=01;35:*.xcf=01;35:*.xwd=01;35:*.yuv=01;35:*.cgm=01;35:*.emf=01;35:*.ogv=01;35:*.ogx=01;35:*.aac=00;36:*.au=00;36:*.flac=00;36:*.m4a=00;36:*.mid=00;36:*.midi=00;36:*.mka=00;36:*.mp3=00;36:*.mpc=00;36:*.ogg=00;36:*.ra=00;36:*.wav=00;36:*.oga=00;36:*.opus=00;36:*.spx=00;36:*.xspf=00;36:","VSCODE_GIT_IPC_HANDLE":"/tmp/vscode-git-64a71818df.sock","TERM_PROGRAM":"vscode","npm_lifecycle_script":"nuxt","DefaultIMModule":"fcitx","npm_package_dependencies_rand_token":"^1.0.1","npm_config_version_git_message":"v%s","SHELL":"/bin/bash","npm_lifecycle_event":"start:frontend","npm_package_version":"","npm_package_dependencies_vee_validate":"^3.3.9","npm_package_dependencies_rison":"^0.1.1","npm_package_dependencies__nuxtjs_proxy":"^2.0.1","npm_package_dependencies__nuxtjs_dotenv":"^1.4.1","VERBOSE_LOGGING":"true","npm_config_argv":"{\"remain\":[],\"cooked\":[\"run\",\"start\"],\"original\":[\"start\"]}","npm_package_scripts_build":"nuxt build","npm_package_dependencies_crypto":"^1.0.1","npm_package_dependencies_cors":"^2.8.5","npm_package_dependencies_cookie_universal_nuxt":"^2.1.4","LESSCLOSE":"/usr/bin/lesspipe %s %s","npm_package_dependencies__fortawesome_free_brands_svg_icons":"^5.14.0","npm_package_dependencies_cron_parser":"^2.16.3","npm_config_version_git_tag":"true","npm_config_version_git_sign":"","npm_package_scripts_generate":"nuxt generate","npm_config_strict_ssl":"true","NODENV_SHELL":"bash","QT_IM_MODULE":"fcitx","npm_package_dependencies__fortawesome_free_regular_svg_icons":"^5.14.0","PWD":"/home/user/app/nodejs/php-acceralation","npm_execpath":"/home/user/.anyenv/envs/nodenv/versions/12.18.2/lib/node_modules/yarn/bin/yarn.js","npm_package_dependencies_globby":"^11.0.1","PYENV_ROOT":"/home/user/.anyenv/envs/pyenv","npm_package_dependencies_vue_sidebar_menu":"^4.7.1","NODENV_DIR":"/home/user/app/nodejs/php-acceralation","AMD_ENTRYPOINT":"vs/server/remoteExtensionHostProcess","npm_package_dependencies_cookie_parser":"^1.4.5","npm_config_save_prefix":"^","npm_config_ignore_optional":"","npm_package_dependencies__nuxtjs_axios":"^5.12.2","HOSTTYPE":"x86_64","npm_package_dependencies_tailwindcss":"^1.7.6","npm_package_dependencies__fortawesome_fontawesome_svg_core":"^1.2.30","INIT_CWD":"/home/user/app/nodejs/php-acceralation","WSLENV":"VSCODE_WSL_EXT_LOCATION/up","NODE_ENV":"development","_applied":"true","APP_PORT":"3000","APP_URI":"http://localhost:3000","SERVER_PORT":"3333","SERVER_URI":"http://localhost:3333","MAILDEV_WEB_PORT":"3080","MAILDEV_URI":"http://localhost:3080","MAILDEV_SMTP_PORT":"3025","NEDB_ADMIN_ID":"admin@nedb.id","NEDB_ADMIN_PWD":"nedb/Admin.pwd","ADMIN_ID":"admin@cron.id","ADMIN_PWD":"cron/Admin.pwd","_AXIOS_BASE_URL_":"http://localhost:3000/","VUE_ENV":"server"}
    }
    // Only set once
    if (!process.static && context.req) {
      app.context.req = context.req
    }
    if (!process.static && context.res) {
      app.context.res = context.res
    }
    if (context.ssrContext) {
      app.context.ssrContext = context.ssrContext
    }
    app.context.redirect = (status, path, query) => {
      if (!status) {
        return
      }
      app.context._redirected = true
      // if only 1 or 2 arguments: redirect('/') or redirect('/', { foo: 'bar' })
      let pathType = typeof path
      if (typeof status !== 'number' && (pathType === 'undefined' || pathType === 'object')) {
        query = path || {}
        path = status
        pathType = typeof path
        status = 302
      }
      if (pathType === 'object') {
        path = app.router.resolve(path).route.fullPath
      }
      // "/absolute/route", "./relative/route" or "../relative/route"
      if (/(^[.]{1,2}\/)|(^\/(?!\/))/.test(path)) {
        app.context.next({
          path,
          query,
          status
        })
      } else {
        path = formatUrl(path, query)
        if (process.server) {
          app.context.next({
            path,
            status
          })
        }
        if (process.client) {
          // https://developer.mozilla.org/en-US/docs/Web/API/Location/replace
          window.location.replace(path)

          // Throw a redirect error
          throw new Error('ERR_REDIRECT')
        }
      }
    }
    if (process.server) {
      app.context.beforeNuxtRender = fn => context.beforeRenderFns.push(fn)
    }
    if (process.client) {
      app.context.nuxtState = window.__NUXT__
    }
  }

  // Dynamic keys
  const [currentRouteData, fromRouteData] = await Promise.all([
    getRouteData(context.route),
    getRouteData(context.from)
  ])

  if (context.route) {
    app.context.route = currentRouteData
  }

  if (context.from) {
    app.context.from = fromRouteData
  }

  app.context.next = context.next
  app.context._redirected = false
  app.context._errored = false
  app.context.isHMR = Boolean(context.isHMR)
  app.context.params = app.context.route.params || {}
  app.context.query = app.context.route.query || {}
}

export function middlewareSeries (promises, appContext) {
  if (!promises.length || appContext._redirected || appContext._errored) {
    return Promise.resolve()
  }
  return promisify(promises[0], appContext)
    .then(() => {
      return middlewareSeries(promises.slice(1), appContext)
    })
}

export function promisify (fn, context) {
  let promise
  if (fn.length === 2) {
      console.warn('Callback-based asyncData, fetch or middleware calls are deprecated. ' +
        'Please switch to promises or async/await syntax')

    // fn(context, callback)
    promise = new Promise((resolve) => {
      fn(context, function (err, data) {
        if (err) {
          context.error(err)
        }
        data = data || {}
        resolve(data)
      })
    })
  } else {
    promise = fn(context)
  }

  if (promise && promise instanceof Promise && typeof promise.then === 'function') {
    return promise
  }
  return Promise.resolve(promise)
}

// Imported from vue-router
export function getLocation (base, mode) {
  let path = decodeURI(window.location.pathname)
  if (mode === 'hash') {
    return window.location.hash.replace(/^#\//, '')
  }
  // To get matched with sanitized router.base add trailing slash
  if (base && (path.endsWith('/') ? path : path + '/').startsWith(base)) {
    path = path.slice(base.length)
  }
  return (path || '/') + window.location.search + window.location.hash
}

// Imported from path-to-regexp

/**
 * Compile a string to a template function for the path.
 *
 * @param  {string}             str
 * @param  {Object=}            options
 * @return {!function(Object=, Object=)}
 */
export function compile (str, options) {
  return tokensToFunction(parse(str, options), options)
}

export function getQueryDiff (toQuery, fromQuery) {
  const diff = {}
  const queries = { ...toQuery, ...fromQuery }
  for (const k in queries) {
    if (String(toQuery[k]) !== String(fromQuery[k])) {
      diff[k] = true
    }
  }
  return diff
}

export function normalizeError (err) {
  let message
  if (!(err.message || typeof err === 'string')) {
    try {
      message = JSON.stringify(err, null, 2)
    } catch (e) {
      message = `[${err.constructor.name}]`
    }
  } else {
    message = err.message || err
  }
  return {
    ...err,
    message,
    statusCode: (err.statusCode || err.status || (err.response && err.response.status) || 500)
  }
}

/**
 * The main path matching regexp utility.
 *
 * @type {RegExp}
 */
const PATH_REGEXP = new RegExp([
  // Match escaped characters that would otherwise appear in future matches.
  // This allows the user to escape special characters that won't transform.
  '(\\\\.)',
  // Match Express-style parameters and un-named parameters with a prefix
  // and optional suffixes. Matches appear as:
  //
  // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
  // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
  // "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
  '([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^\\\\()])+)\\))?|\\(((?:\\\\.|[^\\\\()])+)\\))([+*?])?|(\\*))'
].join('|'), 'g')

/**
 * Parse a string for the raw tokens.
 *
 * @param  {string}  str
 * @param  {Object=} options
 * @return {!Array}
 */
function parse (str, options) {
  const tokens = []
  let key = 0
  let index = 0
  let path = ''
  const defaultDelimiter = (options && options.delimiter) || '/'
  let res

  while ((res = PATH_REGEXP.exec(str)) != null) {
    const m = res[0]
    const escaped = res[1]
    const offset = res.index
    path += str.slice(index, offset)
    index = offset + m.length

    // Ignore already escaped sequences.
    if (escaped) {
      path += escaped[1]
      continue
    }

    const next = str[index]
    const prefix = res[2]
    const name = res[3]
    const capture = res[4]
    const group = res[5]
    const modifier = res[6]
    const asterisk = res[7]

    // Push the current path onto the tokens.
    if (path) {
      tokens.push(path)
      path = ''
    }

    const partial = prefix != null && next != null && next !== prefix
    const repeat = modifier === '+' || modifier === '*'
    const optional = modifier === '?' || modifier === '*'
    const delimiter = res[2] || defaultDelimiter
    const pattern = capture || group

    tokens.push({
      name: name || key++,
      prefix: prefix || '',
      delimiter,
      optional,
      repeat,
      partial,
      asterisk: Boolean(asterisk),
      pattern: pattern ? escapeGroup(pattern) : (asterisk ? '.*' : '[^' + escapeString(delimiter) + ']+?')
    })
  }

  // Match any characters still remaining.
  if (index < str.length) {
    path += str.substr(index)
  }

  // If the path exists, push it onto the end.
  if (path) {
    tokens.push(path)
  }

  return tokens
}

/**
 * Prettier encoding of URI path segments.
 *
 * @param  {string}
 * @return {string}
 */
function encodeURIComponentPretty (str, slashAllowed) {
  const re = slashAllowed ? /[?#]/g : /[/?#]/g
  return encodeURI(str).replace(re, (c) => {
    return '%' + c.charCodeAt(0).toString(16).toUpperCase()
  })
}

/**
 * Encode the asterisk parameter. Similar to `pretty`, but allows slashes.
 *
 * @param  {string}
 * @return {string}
 */
function encodeAsterisk (str) {
  return encodeURIComponentPretty(str, true)
}

/**
 * Escape a regular expression string.
 *
 * @param  {string} str
 * @return {string}
 */
function escapeString (str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, '\\$1')
}

/**
 * Escape the capturing group by escaping special characters and meaning.
 *
 * @param  {string} group
 * @return {string}
 */
function escapeGroup (group) {
  return group.replace(/([=!:$/()])/g, '\\$1')
}

/**
 * Expose a method for transforming tokens into the path function.
 */
function tokensToFunction (tokens, options) {
  // Compile all the tokens into regexps.
  const matches = new Array(tokens.length)

  // Compile all the patterns before compilation.
  for (let i = 0; i < tokens.length; i++) {
    if (typeof tokens[i] === 'object') {
      matches[i] = new RegExp('^(?:' + tokens[i].pattern + ')$', flags(options))
    }
  }

  return function (obj, opts) {
    let path = ''
    const data = obj || {}
    const options = opts || {}
    const encode = options.pretty ? encodeURIComponentPretty : encodeURIComponent

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]

      if (typeof token === 'string') {
        path += token

        continue
      }

      const value = data[token.name || 'pathMatch']
      let segment

      if (value == null) {
        if (token.optional) {
          // Prepend partial segment prefixes.
          if (token.partial) {
            path += token.prefix
          }

          continue
        } else {
          throw new TypeError('Expected "' + token.name + '" to be defined')
        }
      }

      if (Array.isArray(value)) {
        if (!token.repeat) {
          throw new TypeError('Expected "' + token.name + '" to not repeat, but received `' + JSON.stringify(value) + '`')
        }

        if (value.length === 0) {
          if (token.optional) {
            continue
          } else {
            throw new TypeError('Expected "' + token.name + '" to not be empty')
          }
        }

        for (let j = 0; j < value.length; j++) {
          segment = encode(value[j])

          if (!matches[i].test(segment)) {
            throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '", but received `' + JSON.stringify(segment) + '`')
          }

          path += (j === 0 ? token.prefix : token.delimiter) + segment
        }

        continue
      }

      segment = token.asterisk ? encodeAsterisk(value) : encode(value)

      if (!matches[i].test(segment)) {
        throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
      }

      path += token.prefix + segment
    }

    return path
  }
}

/**
 * Get the flags for a regexp from the options.
 *
 * @param  {Object} options
 * @return {string}
 */
function flags (options) {
  return options && options.sensitive ? '' : 'i'
}

/**
 * Format given url, append query to url query string
 *
 * @param  {string} url
 * @param  {string} query
 * @return {string}
 */
function formatUrl (url, query) {
  let protocol
  const index = url.indexOf('://')
  if (index !== -1) {
    protocol = url.substring(0, index)
    url = url.substring(index + 3)
  } else if (url.startsWith('//')) {
    url = url.substring(2)
  }

  let parts = url.split('/')
  let result = (protocol ? protocol + '://' : '//') + parts.shift()

  let path = parts.join('/')
  if (path === '' && parts.length === 1) {
    result += '/'
  }

  let hash
  parts = path.split('#')
  if (parts.length === 2) {
    [path, hash] = parts
  }

  result += path ? '/' + path : ''

  if (query && JSON.stringify(query) !== '{}') {
    result += (url.split('?').length === 2 ? '&' : '?') + formatQuery(query)
  }
  result += hash ? '#' + hash : ''

  return result
}

/**
 * Transform data object to query string
 *
 * @param  {object} query
 * @return {string}
 */
function formatQuery (query) {
  return Object.keys(query).sort().map((key) => {
    const val = query[key]
    if (val == null) {
      return ''
    }
    if (Array.isArray(val)) {
      return val.slice().map(val2 => [key, '=', val2].join('')).join('&')
    }
    return key + '=' + val
  }).filter(Boolean).join('&')
}

export function addLifecycleHook(vm, hook, fn) {
  if (!vm.$options[hook]) {
    vm.$options[hook] = []
  }
  if (!vm.$options[hook].includes(fn)) {
    vm.$options[hook].push(fn)
  }
}

export function urlJoin () {
  return [].slice
    .call(arguments)
    .join('/')
    .replace(/\/+/g, '/')
    .replace(':/', '://')
}

export function stripTrailingSlash (path) {
  return path.replace(/\/+$/, '') || '/'
}

export function isSamePath (p1, p2) {
  return stripTrailingSlash(p1) === stripTrailingSlash(p2)
}
