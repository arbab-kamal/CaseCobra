"use server";

import { db } from "@/db"; // Make sure this is the correct path to your Prisma client
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export const getAuthStatus = async () => {
  try {
    // Get the user session from Kinde
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    // Log user data to verify Kinde response
    console.log("User from Kinde session:", user);

    // Check if the user object has valid ID and email
    if (!user?.id || !user.email) {
      console.error("Invalid user data:", user); // Log the invalid data
      throw new Error("Invalid user data: Missing user ID or email");
    }

    // Check if the user already exists in the database
    console.log("Checking for existing user in database...");
    const existingUser = await db.user.findFirst({
      where: { id: user.id }, // Make sure this is the correct field in your schema
    });

    if (existingUser) {
      console.log("User already exists in the database:", existingUser);
    } else {
      console.log("User not found. Creating new user...");
      // If the user does not exist, create a new user in the database
      const newUser = await db.user.create({
        data: {
          id: user.id, // Ensure this maps to your schema's primary key
          email: user.email,
          kindeId: user.id, // Ensure kindeId is unique in your schema
        },
      });
      console.log("New user created:", newUser);
    }

    // Return success if the user is found or created successfully
    return { success: true };
  } catch (error) {
    // Log any errors encountered
    console.error("Error in getAuthStatus:", error);
    return { success: false, error: error.message };
  }
};
