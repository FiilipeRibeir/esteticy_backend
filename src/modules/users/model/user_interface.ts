interface UserCreateProps {
  name: string;
  nickname: string;
  email: string;
  password: string;
}

interface UserDeleteProps {
  id: string;
}

interface UserUpdateProps {
  id: string;
  name?: string;
  nickname?: string;
  email?: string;
  password?: string;
}

interface UserGetOneProps {
  email: string;
}

export { UserCreateProps, UserDeleteProps, UserGetOneProps, UserUpdateProps };
