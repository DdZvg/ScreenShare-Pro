@@ .. @@
-import { useState, useEffect } from 'react';
-import { User } from '../types';
+import { useState, useEffect } from 'react';
+import { User } from '../types';
+import { AuthService } from '../services/authService';
+import { supabase } from '../lib/supabase';
+import toast from 'react-hot-toast';

-interface LoginError {
-  message: string;
-}

 export const useAuth = () => {
   const [user, setUser] = useState<User | null>(null);
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
-    // Check for saved user in localStorage
-    const savedUser = localStorage.getItem('screenShareUser');
-    if (savedUser) {
-      setUser(JSON.parse(savedUser));
-    }
+    // Check for existing session
+    const getInitialSession = async () => {
+      const currentUser = await AuthService.getCurrentUser();
+      setUser(currentUser);
+      setIsLoading(false);
+    };
+
+    getInitialSession();
+
+    // Listen for auth changes
+    const { data: { subscription } } = supabase.auth.onAuthStateChange(
+      async (event, session) => {
+        if (event === 'SIGNED_IN' && session) {
+          const currentUser = await AuthService.getCurrentUser();
+          setUser(currentUser);
+          toast.success('¡Sesión iniciada correctamente!');
+        } else if (event === 'SIGNED_OUT') {
+          setUser(null);
+          toast.success('Sesión cerrada');
+        }
+        setIsLoading(false);
+      }
+    );
+
+    return () => subscription.unsubscribe();
   }, []);

   const login = async (email: string, password: string) => {
     setIsLoading(true);
     setError(null);
     
     try {
-      // Simulate API call with potential failure
-      await new Promise((resolve, reject) => {
-        setTimeout(() => {
-          // Simulate some login failures for demo
-          if (email === 'error@test.com') {
-            reject(new Error('Credenciales incorrectas'));
-          } else {
-            resolve(true);
-          }
-        }, 1000);
-      });
-      
-      const mockUser: User = {
-        id: Math.random().toString(36).substr(2, 9),
-        email,
-        name: email.split('@')[0],
-        createdAt: new Date()
-      };
-      
-      setUser(mockUser);
-      localStorage.setItem('screenShareUser', JSON.stringify(mockUser));
+      await AuthService.signIn(email, password);
     } catch (err) {
-      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
+      const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión';
+      setError(errorMessage);
+      toast.error(errorMessage);
     }
     
     setIsLoading(false);
   };

   const register = async (name: string, email: string, password: string) => {
     setIsLoading(true);
     setError(null);
     
     try {
-      // Simulate API call with potential failure
-      await new Promise((resolve, reject) => {
-        setTimeout(() => {
-          // Simulate email already exists
-          if (email === 'exists@test.com') {
-            reject(new Error('Este email ya está registrado'));
-          } else {
-            resolve(true);
-          }
-        }, 1000);
-      });
-      
-      const mockUser: User = {
-        id: Math.random().toString(36).substr(2, 9),
-        email,
-        name,
-        createdAt: new Date()
-      };
-      
-      setUser(mockUser);
-      localStorage.setItem('screenShareUser', JSON.stringify(mockUser));
+      await AuthService.signUp(email, password, name);
+      toast.success('¡Cuenta creada! Revisa tu email para confirmar.');
     } catch (err) {
-      setError(err instanceof Error ? err.message : 'Error al crear la cuenta');
+      const errorMessage = err instanceof Error ? err.message : 'Error al crear la cuenta';
+      setError(errorMessage);
+      toast.error(errorMessage);
     }
     
     setIsLoading(false);
   };

-  const logout = () => {
-    setUser(null);
-    setError(null);
-    localStorage.removeItem('screenShareUser');
+  const logout = async () => {
+    try {
+      await AuthService.signOut();
+      setUser(null);
+      setError(null);
+    } catch (err) {
+      console.error('Logout error:', err);
+    }
   };

   return {
     user,
     isLoading,
     error,
     login,
     register,
     logout,
     clearError: () => setError(null)
   };
 };