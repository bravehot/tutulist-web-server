import { UserGenderEnum } from '@/types/user/enum';
import { OmitDto, PickDto, Rule, RuleType } from '@midwayjs/validate';

export class UserDTO {
  @Rule(
    RuleType.string()
      .pattern(/^1[3456789]\d{9}$/)
      .required()
      .error(new Error('手机号格式错误'))
  )
  mobile: string;

  @Rule(RuleType.string().length(4).required())
  code: string;

  @Rule(
    RuleType.string()
      .pattern(/^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,20}$/)
      .required()
      .error(new Error('密码至少包含数字和英文, 长度6-20'))
  )
  password: string;
}

export class SendCodeDTO extends PickDto(UserDTO, ['mobile']) {}

export class LoginDTO extends OmitDto(UserDTO, ['code']) {}

export class UpdatePasswordDTO extends UserDTO {
  @Rule(
    RuleType.string()
      .pattern(/^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,20}$/)
      .required()
      .error(new Error('密码至少包含数字和英文,长度6-20'))
  )
  newPassword: string;
}

export class RefreshTokenDTO {
  @Rule(RuleType.string().required())
  refreshToken: string;
}

export class UserByCodeDTO extends OmitDto(UserDTO, ['password']) {}

export class UserInfoUpdateDTO {
  @Rule(
    RuleType.string().max(20).error(new Error('name 字段限制 20 位以内字符'))
  )
  username: string;

  @Rule(RuleType.string())
  avatar: string;

  @Rule(
    RuleType.number().valid(
      UserGenderEnum.MAN,
      UserGenderEnum.WOMAN,
      UserGenderEnum.SECRECY
    )
  )
  gender: UserGenderEnum;
}
