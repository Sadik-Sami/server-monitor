import { IsString, IsEmail } from 'class-validator';
export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;
}
