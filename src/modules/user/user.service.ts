import { prisma } from "../../lib/prisma";
import config from "../../config";
import bcrypt from "bcryptjs";
import { User } from "./user.interface";

const registerUserInDB = async (payload: User) => {
    const { name, email, password, profilePhoto } = payload;

    const doUserExist = await prisma.user.findUnique({
    where: { email },
  });

  if (doUserExist) {
    throw new Error("User already exists");
  }

  const hashPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds),
  );

  
  // creating user
  const createdUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashPassword,
      profile: {
        create: {
            profilePhoto
        }
      }
    },
  });


  // creating user profile alternate way
//   await prisma.profile.create({
//     data: {
//         userId: createdUser.id,
//         profilePhoto
//     }
//   })

  
  // finding user
  const user = await prisma.user.findUnique({
    where: {
      id: createdUser.id,
      email: createdUser.email || email
    },
    // to avoid showing password
    omit: {
      password: true
    },
    include: {
      profile: true
    }
  })

  return user;
}


const getMyProfileFromDB = async (userId: string) => {
    const user = await prisma.user.findUniqueOrThrow({
        where: {
            id: userId
        },
        omit: {
            password: true
        },
        include: {
            profile: true
        }
    });

    return user
}


const updateMyProfileInDB = async (userId : string, payload: any) => {
  const {name, email, profilePhoto, bio} = payload;

  const updateUser = await prisma.user.update({
    where: {
      id: userId
    },
    data: {
      name,
      email,
      profile: {
        update: {
          profilePhoto,
          bio
        }
      }
    },
    omit: {
      password: true,
    },
    include: {
      profile: true
    }
  })

  return updateUser;
}

export const userService = {
    registerUserInDB, getMyProfileFromDB, updateMyProfileInDB
}