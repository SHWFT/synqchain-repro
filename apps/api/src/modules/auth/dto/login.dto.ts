import { IsEmail, IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ 
    description: 'User email address',
    example: 'demo@demo.com'
  })
  @IsEmail()
  email: string;

  @ApiProperty({ 
    description: 'User password',
    example: 'demo'
  })
  @IsString()
  @MinLength(4)
  password: string;
}

export class RegisterDto {
  @ApiProperty({ 
    description: 'User email address',
    example: 'user@example.com'
  })
  @IsEmail()
  email: string;

  @ApiProperty({ 
    description: 'User password (min 8 chars, must contain lowercase, uppercase, and number)',
    example: 'SecurePass123'
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]+$/, {
    message: 'Password must contain at least one lowercase letter, one uppercase letter, and one number'
  })
  password: string;
}
