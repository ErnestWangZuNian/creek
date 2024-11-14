const spawn = require('cross-spawn');

function isValidCommand(command: string) {
  // 用正则表达式验证命令是否只包含字母和数字
  return /^[a-zA-Z0-9@/-]+$/.test(command);
}

function isValidCommandParams(commandParams: string[] = []) {
  // 用正则表达式验证命令是否只包含字母和数字
  return commandParams.every((command) => /^[a-zA-Z0-9@/-]+$/.test(command));
}

//  执行spawn命令
function spawnCommand(
  command: string,
  commandParams: string[] = [],
  spawnConfig = { stdio: 'inherit' },
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    if (isValidCommand(command) && isValidCommandParams(commandParams)) {
      const child = spawn(command, commandParams, spawnConfig);
      child.on('exit', (code: string, signal: boolean) => {
        if (code) {
          reject(new Error(`${command}失败，退出码：${code}`));
        } else if (signal) {
          reject(new Error(`${command}被信号中断，信号：${signal}`));
        } else {
          resolve(true);
        }
      });
    } else {
      reject(`${command}不是一个有效的命令`);
    }
  });
}

//  判断是否全局安装了某个模块

function isGlobalInstallModule(moduleName: string) {
  const child = spawn('pnpm', ['list', '-g']);

  return new Promise((resolve, reject) => {
    child.stdout.on('data', (data: any) => {
      const output = data.toString();
      if (output.includes(moduleName)) {
        resolve(true);
      } else {
        resolve(false);
      }
    });

    child.stderr.on('data', (data: any) => {
      reject(`命令执行出错：${data}`);
    });
  });
}
export { isGlobalInstallModule, spawnCommand };
