import { auth, db, googleProvider } from './config';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

// Define valid roles as constants
export const ROLES = {
  ADMIN: "Admin",
  USER: "User"
};

/**
 * Observe authentication state changes.
 * @param {Function} callback - Function to handle auth changes.
 */
export const observeAuthState = (callback) => {
  try {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        const role = await getUserRole(user.uid);
        // Get organization code for ALL users, including admins
        const orgCode = await getOrgCode(user.uid);
        callback({ 
          user, 
          role, 
          organizationCode: orgCode,
          isAuthenticated: true 
        });
      } else {
        callback({ 
          user: null, 
          role: null, 
          organizationCode: null,
          isAuthenticated: false 
        });
      }
    });
  } catch (error) {
    console.error("Auth state observer error:", error);
    callback({ 
      user: null, 
      role: null, 
      organizationCode: null,
      isAuthenticated: false, 
      error: "Authentication service unavailable" 
    });
    return () => {}; // Return empty unsubscribe function
  }
};

/**
 * Login with email & password.
 * @param {string} email
 * @param {string} password
 * @param {boolean} rememberMe - Whether to persist the session
 */
export const loginWithEmail = async (email, password, rememberMe = false) => {
  try {
    // Set persistence based on rememberMe option (implemented in the auth config)
    // Firebase handles this automatically based on the auth config
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const role = await getUserRole(userCredential.user.uid);
    const orgCode = await getOrgCode(userCredential.user.uid); // Get org code for all users
    
    console.log("Authenticated user with role:", role); // Debugging log
    
    return { 
      user: userCredential.user, 
      role, 
      organizationCode: orgCode,
      error: null 
    };
  } catch (error) {
    console.error("Email login error:", error);
    let errorMessage = "Login failed. Please try again.";
    
    switch(error.code) {
      case 'auth/user-not-found':
        errorMessage = "No user found with this email address.";
        break;
      case 'auth/wrong-password':
        errorMessage = "Incorrect password. Please try again.";
        break;
      case 'auth/too-many-requests':
        errorMessage = "Too many unsuccessful login attempts. Please try again later.";
        break;
      case 'auth/invalid-credential':
        errorMessage = "Invalid credentials. Please check your email and password.";
        break;
      case 'auth/invalid-email':
        errorMessage = "Invalid email format.";
        break;
      case 'auth/api-key-not-valid':
        errorMessage = "Authentication configuration issue. Please contact support.";
        break;
      default:
        errorMessage = error.message;
    }
    
    return { 
      user: null, 
      role: null, 
      organizationCode: null,
      error: errorMessage 
    };
  }
};

/**
 * Login with Google with role selection and organization code.
 * @param {string} selectedRole - Role to assign (Admin/User)
 * @param {string} organizationCode - Organization code (required for User role)
 */
export const signInWithGoogle = async (selectedRole = ROLES.USER, organizationCode = null) => {
  try {
    // Validate role selection
    if (selectedRole !== ROLES.ADMIN && selectedRole !== ROLES.USER) {
      selectedRole = ROLES.USER; // Default to USER if invalid
    }
    
    // Validate organization code requirement for Users
    if (selectedRole === ROLES.USER && !organizationCode) {
      return {
        user: null,
        role: null,
        organizationCode: null,
        error: "Organization code is required for regular users"
      };
    }
    
    // For Admin role, ensure no organization code is used
    if (selectedRole === ROLES.ADMIN) {
      organizationCode = null;
    }
    
    // Proceed with Google sign-in
    const result = await signInWithPopup(auth, googleProvider);
    
    // Check if user exists in Firestore
    const userDoc = await getDoc(doc(db, 'users', result.user.uid));
    let role = selectedRole; // Use the selected role
    let orgCode = organizationCode;

    if (!userDoc.exists()) {
      // New user - set their details in Firestore
      const userData = {
        email: result.user.email,
        displayName: result.user.displayName || '',
        role: selectedRole,
        createdAt: new Date().toISOString(),
      };
      
      // Add organization code for non-admin users
      if (selectedRole === ROLES.USER && organizationCode) {
        userData.organizationCode = organizationCode;
        
        // Validate organization code exists (optional)
        const validOrgCode = await validateOrgCode(organizationCode);
        if (!validOrgCode.valid) {
          return {
            user: null,
            role: null,
            organizationCode: null,
            error: "Invalid organization code. Please check and try again."
          };
        }
      }
      
      // Generate organization code for admin users
      if (selectedRole === ROLES.ADMIN) {
        const newOrgCode = generateRandomOrgCode();
        userData.organizationCode = newOrgCode;
        orgCode = newOrgCode;
      }
      
      await setDoc(doc(db, 'users', result.user.uid), userData);
    } else {
      // Existing user - keep their current role and organization code
      const userData = userDoc.data();
      role = userData.role || ROLES.USER;
      orgCode = userData.organizationCode || null;
    }
    
    console.log("Google sign-in user with role:", role); // Debugging log

    return { 
      user: result.user, 
      role, 
      organizationCode: orgCode,
      error: null 
    };
  } catch (error) {
    console.error("Google sign-in error:", error);
    
    let errorMessage = "Failed to sign in with Google.";
    switch(error.code) {
      case 'auth/popup-closed-by-user':
        errorMessage = "Sign-in popup was closed. Please try again.";
        break;
      case 'auth/unauthorized-domain':
        errorMessage = "This domain is not authorized for Google authentication.";
        break;
      case 'auth/cancelled-popup-request':
        errorMessage = "Sign-in process was cancelled. Please try again.";
        break;
      case 'auth/api-key-not-valid':
        errorMessage = "Authentication configuration issue. Please contact support.";
        break;
      case 'auth/operation-not-allowed':
        errorMessage = "Google sign-in is not enabled for this application.";
        break;
      default:
        errorMessage = error.message;
    }
    
    return { 
      user: null, 
      role: null, 
      organizationCode: null,
      error: errorMessage 
    };
  }
};

/**
 * Register a new user.
 * @param {string} email
 * @param {string} password
 * @param {string} role - Either "User" or "Admin"
 * @param {string} organizationCode - Code for organization membership
 */
export const registerUser = async (email, password, role = ROLES.USER, organizationCode = null) => {
  try {
    // Validate role
    if (role !== ROLES.USER && role !== ROLES.ADMIN) {
      role = ROLES.USER; // Default to User if invalid role
    }
    
    // Validate organization code for non-admin users
    if (role === ROLES.USER && !organizationCode) {
      return {
        user: null,
        role: null,
        organizationCode: null,
        error: "Organization code is required for regular users"
      };
    }
    
    // For Admin role, no organization code is needed initially
    if (role === ROLES.ADMIN) {
      organizationCode = null;
    }
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save user details in Firestore
    const userData = {
      email,
      role,
      createdAt: new Date().toISOString(),
    };

    // Add organization code for non-admin users
    if (role === ROLES.USER && organizationCode) {
      // Optionally validate organization code
      const validOrgCode = await validateOrgCode(organizationCode);
      if (!validOrgCode.valid) {
        // Delete the created user if the org code is invalid
        await user.delete();
        return {
          user: null,
          role: null,
          organizationCode: null,
          error: "Invalid organization code. Please check and try again."
        };
      }
      userData.organizationCode = organizationCode;
    }
    
    // Generate organization code for admin users
    if (role === ROLES.ADMIN) {
      const newOrgCode = generateRandomOrgCode();
      userData.organizationCode = newOrgCode;
      organizationCode = newOrgCode;
    }

    await setDoc(doc(db, 'users', user.uid), userData);
    
    console.log("Registered user with role:", role); // Debugging log

    return { 
      user, 
      role, 
      organizationCode, // Return org code for all users
      error: null 
    };
  } catch (error) {
    console.error("Registration error:", error);
    
    let errorMessage = "Registration failed. Please try again.";
    switch(error.code) {
      case 'auth/email-already-in-use':
        errorMessage = "Email is already in use. Please use a different email or sign in.";
        break;
      case 'auth/invalid-email':
        errorMessage = "Invalid email format.";
        break;
      case 'auth/weak-password':
        errorMessage = "Password is too weak. Please use a stronger password.";
        break;
      case 'auth/api-key-not-valid':
        errorMessage = "Authentication configuration issue. Please contact support.";
        break;
      default:
        errorMessage = error.message;
    }
    
    return { 
      user: null, 
      role: null, 
      organizationCode: null,
      error: errorMessage 
    };
  }
};

/**
 * Send password reset email.
 * @param {string} email - The user's email address
 */
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { 
      success: true, 
      error: null 
    };
  } catch (error) {
    console.error("Password reset error:", error);
    
    let errorMessage = "Failed to send password reset email.";
    switch(error.code) {
      case 'auth/user-not-found':
        errorMessage = "No user found with this email address.";
        break;
      case 'auth/invalid-email':
        errorMessage = "Invalid email format.";
        break;
      default:
        errorMessage = error.message;
    }
    
    return { 
      success: false, 
      error: errorMessage 
    };
  }
};

/**
 * Logout the user.
 */
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    console.error("Logout error:", error);
    return { error: "Failed to log out. Please try again." };
  }
};

/**
 * Get the role of a user.
 * @param {string} uid - User ID.
 */
export const getUserRole = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    const role = userDoc.exists() ? userDoc.data().role : null;
    
    // Ensure role is valid
    if (role !== ROLES.ADMIN && role !== ROLES.USER) {
      console.warn(`Invalid role "${role}" for user ${uid}, defaulting to User`);
      return ROLES.USER;
    }
    
    return role;
  } catch (error) {
    console.error('Error fetching user role:', error);
    return null;
  }
};

/**
 * Get organization code for a user.
 * @param {string} uid - User ID.
 */
export const getOrgCode = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    return userDoc.exists() ? userDoc.data().organizationCode : null;
  } catch (error) {
    console.error('Error fetching organization code:', error);
    return null;
  }
};

/**
 * Generate a random organization code.
 * @returns {string} Organization code
 */
export const generateRandomOrgCode = () => {
  return `TDS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
};

/**
 * Generate a new organization code for a user (typically an admin).
 * @param {string} uid - User ID.
 * @returns {Object} Result with organizationCode and error
 */
export const generateOrgCode = async (uid) => {
  try {
    // Check if the user is admin
    const userRole = await getUserRole(uid);
    if (userRole !== ROLES.ADMIN) {
      return { 
        organizationCode: null, 
        error: "Only admins can generate organization codes." 
      };
    }
    
    // Generate a new organization code
    const orgCode = generateRandomOrgCode();

    // Update the user document with the new organization code
    await updateDoc(doc(db, 'users', uid), {
      organizationCode: orgCode,
    });

    console.log(`Generated new organization code ${orgCode} for user ${uid}`);
    return { organizationCode: orgCode, error: null };
  } catch (error) {
    console.error('Error generating organization code:', error);
    return { organizationCode: null, error: error.message };
  }
};

/**
 * Validate organization code.
 * @param {string} orgCode - Organization code to validate
 * @returns {Object} Result with valid boolean and error
 */
export const validateOrgCode = async (orgCode) => {
  try {
    if (!orgCode) {
      return { valid: false, error: "Organization code is required" };
    }
    
    // Query users collection for the organization code
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where("organizationCode", "==", orgCode));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return { valid: false, error: "Invalid organization code" };
    }
    
    return { valid: true, error: null };
  } catch (error) {
    console.error('Error validating organization code:', error);
    return { valid: false, error: error.message };
  }
};

/**
 * Update user profile.
 * @param {Object} profileData - Profile data to update
 */
export const updateUserProfile = async (profileData) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return { success: false, error: "No authenticated user found" };
    }
    
    // Update auth profile (displayName, photoURL)
    if (profileData.displayName || profileData.photoURL) {
      await updateProfile(currentUser, {
        displayName: profileData.displayName,
        photoURL: profileData.photoURL
      });
    }
    
    // Update additional user data in Firestore
    const updateData = {};
    
    // Only include fields that are defined
    if (profileData.displayName !== undefined) updateData.displayName = profileData.displayName;
    if (profileData.photoURL !== undefined) updateData.photoURL = profileData.photoURL;
    if (profileData.phoneNumber !== undefined) updateData.phoneNumber = profileData.phoneNumber;
    
    // Update Firestore if we have data to update
    if (Object.keys(updateData).length > 0) {
      await updateDoc(doc(db, 'users', currentUser.uid), updateData);
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { success: false, error: error.message };
  }
};