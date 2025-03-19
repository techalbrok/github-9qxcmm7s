import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { toast } from "@/components/ui/use-toast";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Check active sessions and sets the user
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        if (mounted) {
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (mounted) {
          setUser(session?.user ?? null);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Create user profile in public.users table
        const { error: profileError } = await supabase.from("users").insert({
          id: data.user.id,
          email: email,
          full_name: fullName,
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
          role: "user",
          created_at: new Date().toISOString(),
        });

        if (profileError) {
          console.error("Error creating user profile:", profileError);
          throw profileError;
        }

        toast({
          title: "Cuenta creada",
          description: "Tu cuenta ha sido creada exitosamente.",
        });
      }
    } catch (error: any) {
      console.error("Error in signUp:", error);
      toast({
        title: "Error",
        description: error.message || "Error al crear la cuenta",
        variant: "destructive"
      });
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Check if user exists in public.users
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", data.user.id)
          .single();

        if (userError && userError.code !== "PGRST116") {
          console.error("Error checking user profile:", userError);
          throw userError;
        }

        // Create profile if it doesn't exist
        if (!userData) {
          const { error: insertError } = await supabase.from("users").insert({
            id: data.user.id,
            email: email,
            full_name: data.user.user_metadata?.full_name || email.split("@")[0],
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
            role: "user",
            created_at: new Date().toISOString(),
          });

          if (insertError) {
            console.error("Error creating user profile:", insertError);
            throw insertError;
          }
        }

        toast({
          title: "Bienvenido",
          description: "Has iniciado sesión correctamente.",
        });
      }
    } catch (error: any) {
      console.error("Error in signIn:", error);
      toast({
        title: "Error",
        description: error.message || "Error al iniciar sesión",
        variant: "destructive"
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente.",
      });
    } catch (error: any) {
      console.error("Error in signOut:", error);
      toast({
        title: "Error",
        description: error.message || "Error al cerrar sesión",
        variant: "destructive"
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}