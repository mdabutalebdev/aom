import jwt, { SignOptions } from 'jsonwebtoken';
import config from '../../config';
import { User } from '../user/user.model';
import { IUser, TUserRole } from '../user/user.interface';

interface IJwtPayload {
  userId: string;
  role: TUserRole;
  email: string;
}

// Sign a short-lived access token carrying { userId, role, email }.
const createAccessToken = (payload: IJwtPayload): string => {
  return jwt.sign(payload, config.jwt.access_secret, {
    expiresIn: config.jwt.access_expires_in,
  } as SignOptions);
};

// Strip the password from a user document before returning it.
const sanitizeUser = (user: IUser & { password?: string }): IUser => {
  const source = user as unknown as { toObject?: () => unknown };
  const plain = (
    typeof source.toObject === 'function' ? source.toObject() : { ...user }
  ) as Record<string, unknown>;
  delete plain.password;
  return plain as unknown as IUser;
};

// POST /api/auth/register — student self-register.
const register = async (payload: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}) => {
  const existing = await User.findOne({ email: payload.email.toLowerCase() });
  if (existing) {
    throw Object.assign(new Error('A user with this email already exists'), {
      status: 409,
    });
  }

  const user = await User.create({
    ...payload,
    role: 'student' as TUserRole,
  });

  const accessToken = createAccessToken({
    userId: String(user._id),
    role: user.role,
    email: user.email,
  });

  return { accessToken, user: sanitizeUser(user) };
};

// POST /api/auth/login — verify credentials + active status.
const login = async (payload: { email: string; password: string }) => {
  const user = await User.findOne({
    email: payload.email.toLowerCase(),
  }).select('+password');

  if (!user) {
    throw Object.assign(new Error('Invalid email or password'), { status: 401 });
  }

  const isMatched = await user.comparePassword(payload.password);
  if (!isMatched) {
    throw Object.assign(new Error('Invalid email or password'), { status: 401 });
  }

  if (!user.isActive) {
    throw Object.assign(new Error('Your account has been deactivated'), {
      status: 401,
    });
  }

  const accessToken = createAccessToken({
    userId: String(user._id),
    role: user.role,
    email: user.email,
  });

  return { accessToken, user: sanitizeUser(user) };
};

// POST /api/auth/forgot-password — issue a 15m reset token (dev: returned + logged).
const forgotPassword = async (payload: { email: string }) => {
  const user = await User.findOne({ email: payload.email.toLowerCase() });
  if (!user) {
    throw Object.assign(new Error('No account found with this email'), {
      status: 404,
    });
  }

  const resetToken = jwt.sign(
    { userId: String(user._id), email: user.email },
    config.jwt.access_secret,
    { expiresIn: '15m' } as SignOptions,
  );

  // No email service exists yet — surface the token for dev use.
  // eslint-disable-next-line no-console
  console.log(`🔑 Password reset token for ${user.email}: ${resetToken}`);

  return { resetToken };
};

// POST /api/auth/reset-password — verify reset token + set new password.
const resetPassword = async (payload: { token: string; newPassword: string }) => {
  let decoded: { userId: string };
  try {
    decoded = jwt.verify(payload.token, config.jwt.access_secret) as {
      userId: string;
    };
  } catch (_error) {
    throw Object.assign(new Error('Invalid or expired reset token'), {
      status: 401,
    });
  }

  const user = await User.findById(decoded.userId).select('+password');
  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }

  // Assigning triggers the pre-save hook which hashes the password.
  user.password = payload.newPassword;
  await user.save();
};

// POST /api/auth/change-password — authenticated user rotates their password.
// Teachers are blocked from self-service password changes — only Super Admin
// can reset a teacher's password (via PATCH /api/user/:id).
const changePassword = async (
  userId: string,
  role: string,
  payload: { oldPassword: string; newPassword: string },
) => {
  if (role === 'teacher') {
    throw Object.assign(
      new Error(
        'Teachers cannot change their own password — ask a Super Admin to reset it',
      ),
      { status: 403 },
    );
  }

  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }

  const isMatched = await user.comparePassword(payload.oldPassword);
  if (!isMatched) {
    throw Object.assign(new Error('Old password is incorrect'), { status: 400 });
  }

  user.password = payload.newPassword;
  await user.save();
};

export const AuthService = {
  register,
  login,
  forgotPassword,
  resetPassword,
  changePassword,
};
