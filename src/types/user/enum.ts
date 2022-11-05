export enum SmsTemplateIdEnum {
  'login' = '1478279',
  'register' = '1501636',
  'changePwd' = '1502349',
  'changeMobile' = '1502613',
  'cancellation' = '1502616',
}

export enum UserKeyEnum {
  'SMS_REDIS_KEY' = 'web:user:smsCode',
  'USER_LOGIN_KEY' = 'web:user:login',
}

export enum UserLockEnum {
  'UNLOCK',
  'LOCK',
}

export enum UserCancelEnum {
  'NOT_CANCEL',
  'CANCEL',
}

export enum UserGenderEnum {
  'MAN' = 0,
  'WOMAN' = 1,
  'SECRECY' = -1,
}
