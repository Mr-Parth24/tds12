// src/services/authService.js
import { auth, db, googleProvider } from '../firebase/config';
import { signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

// Define valid roles as constants for consistency
export const ROLES = {
  ADMIN: "Admin",
  USER: "User"
};

/**
 * Logs in a user using email and password.
 */
export const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userRole = await getUserRole(userCredential.user.uid);
    const orgCode = userRole !== ROLES.ADMIN ? await getOrgCode(userCredential.user.uid) : null;
    
    console.log("Auth service: User logged in with role:", userRole);
    
    return { 
      user: userCredential.user, 
      role: userRole,
      organizationCode: orgCode,
      error: null 
    };
  } catch (error) {
    console.error("Login error:", error);
    return { 
      user: null, 
      role: null, 
      organizationCode: null,
      error: error.message 
    };
  }
};

/**
 * Logs in a user using Google authentication.
 */
export const signInWithGoogle = async () => {
  try {
    const userCredential = await signInWithPopup(auth, googleProvider);
    const user = userCredential.user;

    // Check if user already has a role
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    let userRole = ROLES.USER; // Default role
    let orgCode = null;
    
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        role: ROLES.USER, // Default role
        joinedAt: new Date().toISOString(),
      });
    } else {
      userRole = userDoc.data().role;
      // Validate role
      if (userRole !== ROLES.USER && userRole !== ROLES.ADMIN) {
        userRole = ROLES.USER;
        // Update with valid role if needed
        await updateDoc(doc(db, 'users', user.uid), { role: ROLES.USER });
      }
      orgCode = userRole !== ROLES.ADMIN ? userDoc.data().organizationCode : null;
    }

    console.log("Auth service: Google sign-in with role:", userRole);
    
    return { 
      user, 
      role: userRole,
      organizationCode: orgCode,
      error: null 
    };
  } catch (error) {
    console.error("Google sign-in error:", error);
    return { 
      user: null, 
      role: null,
      organizationCode: null,
      error: error.message 
    };
  }
};

/**
 * Registers a new user with email and password.
 * Assigns role and organization code if applicable.
 */
export const registerUser = async (email, password, role, organizationCode = null) => {
  try {
    // Validate role - ensure we only use valid roles
    if (role !== ROLES.USER && role !== ROLES.ADMIN) {
      console.warn(`Invalid role "${role}" provided, defaulting to User`);
      role = ROLES.USER;
    }
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userData = {
      email,
      role,
      joinedAt: new Date().toISOString(),
    };

    // If user is not an Admin, attach organization code
    if (role !== ROLES.ADMIN && organizationCode) {
      userData.organizationCode = organizationCode;
    }

    await setDoc(doc(db, 'users', user.uid), userData);
    
    console.log("Auth service: Registered user with role:", role);

    return { 
      user, 
      role,
      organizationCode: role !== ROLES.ADMIN ? organizationCode : null,
      error: null 
    };
  } catch (error) {
    console.error("Registration error:", error);
    return { 
      user: null, 
      role: null,
      organizationCode: null,
      error: error.message 
    };
  }
};

/**
 * Logs out the user.
 */
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    console.error("Logout error:", error);
    return { error: error.message };
  }
};

/**
 * Fetches the user's role.
 */
export const getUserRole = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const role = userDoc.data().role;
      
      // Validate role
      if (role !== ROLES.ADMIN && role !== ROLES.USER) {
        console.warn(`Invalid role "${role}" for user ${uid}, defaulting to User`);
        return ROLES.USER;
      }
      
      return role;
    }
    return ROLES.USER; // Default to User if no role found
  } catch (error) {
    console.error('Error fetching user role:', error);
    return ROLES.USER; // Default to User on error
  }
};

/**
 * Fetches the organization code for a user.
 */
export const getOrgCode = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data().organizationCode || null;
    }
    return null;
  } catch (error) {
    console.error('Error fetching organization code:', error);
    return null;
  }
};

/**
 * Generates a new organization code for an admin.
 */
export const generateOrgCode = async (uid) => {
  try {
    const orgCode = `TDS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    await updateDoc(doc(db, 'users', uid), {
      organizationCode: orgCode,
    });

    return { organizationCode: orgCode, error: null };
  } catch (error) {
    console.error('Error generating organization code:', error);
    return { organizationCode: null, error: error.message };
  }
};

/**
 * Validates the organization code.
 */
export const validateOrgCode = async (orgCode) => {
  try {
    // Note: This implementation might not be correct
    // It's trying to get a user document using the orgCode as the ID
    // A better approach would be to query for users with this organization code
    const usersSnapshot = await getDoc(doc(db, 'users', orgCode));

    if (usersSnapshot.exists()) {
      return { valid: true, error: null };
    }

    return { valid: false, error: 'Invalid organization code' };
  } catch (error) {
    console.error('Error validating organization code:', error);
    return { valid: false, error: error.message };
  }
};