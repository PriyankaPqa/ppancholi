/* eslint-disable @typescript-eslint/no-explicit-any */

// https://github.com/SpiderLabs/owasp-modsecurity-crs/blob/v3.0/master/util/regexp-assemble/regexp-932115.txt
export const regex932115 = ['odbcad32',
  'odbcconf',
  'openfiles',
  'path@',
  'pathping',
  'perfmon',
  'perl',
  'perl5',
  'perlsh',
  'php',
  'php5',
  'php7',
  'ping',
  'pkgmgr',
  'popd',
  'portqry',
  'powercfg',
  'powershell',
  'powershell_ise',
  'print@',
  'printbrm',
  'prncnfg',
  'prnmngr',
  'prompt',
  'psexec',
  'psfile',
  'psgetsid',
  'psinfo',
  'pskill',
  'pslist',
  'psloggedon',
  'psloglist',
  'pspasswd',
  'psping',
  'psservice',
  'psshutdown',
  'pssuspend',
  'pushd',
  'python',
  'python2',
  'python3',
  'python3m',
  'qgrep',
  'qprocess',
  'query@',
  'qwinsta',
  'rar@',
  'rasdial',
  'rasphone',
  'rd@',
  'recdisc',
  'recover',
  'reg@',
  'regedit',
  'regini',
  'regsvr32',
  'rekeywiz',
  'ren@',
  'rename@',
  'replace@',
  'reset@',
  'rm@',
  'rmdir@',
  'rmtshare',
  'robocopy',
  'route@',
  'rstrui',
  'rsync',
  'ruby1',
  'ruby18',
  'ruby19',
  'ruby20',
  'ruby21',
  'ruby22',
  'runas',
  'rundll32',
  'schtasks',
  'sclist',
  'secpol',
  'select',
  'set@',
  'set',
  'setlocal',
  'setx@',
  'sfc',
  'share',
  'shellrunas',
  'shift',
  'shortcut',
  'showgrps',
  'showmbrs',
  'shrpubw',
  'shutdown',
  'sigverif',
  'sleep',
  'slmgr',
  'sort',
  'start@',
  'subinacl',
  'subst',
  'svn',
  'sysdm',
  'syskey',
  'systeminfo',
  'systempropertiesadvanced',
  'systempropertiesdataexecutionprevention',
  'systempropertieshardware',
  'systempropertiesperformance',
  'takeown',
  'taskkill',
  'tasklist',
  'taskmgr',
  'taskschd',
  'telnet',
  'timeout',
  'tlist',
  'tpminit',
  'tracert',
  'tree',
  'tsdiscon',
  'tsshutdn',
  'type@',
  'typeperf',
  'unrar',
  'unzip',
  'useraccountcontrolsettings',
  'usrstat',
  'verify',
  'vol@',
  'waitfor',
  'wevtutil',
  'wget',
  '#disabled for FP: where@',
  'whoami',
  'windiff',
  'winmsdp',
  'winrm',
  'winrs',
  'winvar',
  'wmic',
  'wmimgmt',
  'wscript',
  'wscui',
  'wuapp',
  'wuauclt',
  'wusa',
  'xcacls',
  'xcopy',
  'zip@'];

export const generateReplaceMap = (array: string[], replaceBy: string) => {
  const replaceMap = {} as Record<string, string>;
  array.forEach((element) => {
    replaceMap[`\n(?=${element})`] = replaceBy;
  });
  return replaceMap;
};

export const searchAndReplace = (targetObject: any, replaceMap: Record<string, string>) => {
  if (targetObject && typeof targetObject === 'object') {
    Object.keys(targetObject).forEach((key) => {
      if (typeof targetObject[key] === 'string') {
        Object.keys(replaceMap).forEach((lookFor) => {
          targetObject[key] = (targetObject[key] as string).replace(new RegExp(lookFor, 'gi'), replaceMap[lookFor]);
        });
      }
      if (typeof targetObject[key] === 'object') {
        searchAndReplace(targetObject[key], replaceMap);
      }
    });
  }
};

export const regex932115ReplaceMap = generateReplaceMap(regex932115, '');

/**
 * It will modify targetObject by replacing any \n by '' if it is followed by a word contained in regex932115
 * @param targetObject
 */
export const sanitize932115 = (targetObject: any): void => {
  searchAndReplace(targetObject, regex932115ReplaceMap);
};
