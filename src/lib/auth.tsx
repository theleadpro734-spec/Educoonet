import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';

export interface InstitutionInfo {
  id: string;
  name: string;
  email: string;
  owner_id: string;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isAnonymous: boolean;
  isRepresentative: boolean;
  isInstitution: boolean;
  institution: InstitutionInfo | null;
  signOut: () => Promise<void>;
  linkToEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  linkToGoogle: () => Promise<{ error: string | null }>;
  signInInstitution: (email: string, password: string) => Promise<{ error: string | null }>;
  refreshInstitution: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [institution, setInstitution] = useState<InstitutionInfo | null>(null);

  const ensureAnonymous = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      await supabase.auth.signInAnonymously();
    }
  }, []);

  const refreshInstitution = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setInstitution(null);
      return;
    }
    const isAnon = userData.user.is_anonymous === true;
    const hasInstitutionRole = userData.user.app_metadata?.role === 'institution';
    if (isAnon || !hasInstitutionRole) {
      setInstitution(null);
      return;
    }
    const { data: instData, error } = await supabase.rpc('get_institution_for_user');
    if (error || !instData || instData.length === 0) {
      setInstitution(null);
      return;
    }
    setInstitution(instData[0] as InstitutionInfo);
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      if (data.session) {
        refreshInstitution().finally(() => setLoading(false));
      } else {
        ensureAnonymous().finally(() => setLoading(false));
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      (async () => {
        setSession(newSession);
        if (newSession) {
          await refreshInstitution();
        } else {
          setInstitution(null);
          await ensureAnonymous();
        }
      })();
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [ensureAnonymous, refreshInstitution]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setInstitution(null);
    await ensureAnonymous();
  }, [ensureAnonymous]);

  const linkToEmail = useCallback(async (email: string, password: string): Promise<{ error: string | null }> => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user || !userData.user.is_anonymous) {
      return { error: 'Solo puedes vincular una cuenta desde una sesion anonima.' };
    }
    const { error } = await supabase.auth.updateUser({
      email,
      password,
    });
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  }, []);

  const linkToGoogle = useCallback(async (): Promise<{ error: string | null }> => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user || !userData.user.is_anonymous) {
      return { error: 'Solo puedes vincular una cuenta desde una sesion anonima.' };
    }
    const { error } = await supabase.auth.linkIdentity({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  }, []);

  const signInInstitution = useCallback(async (email: string, password: string): Promise<{ error: string | null }> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) {
      return { error: error.message };
    }
    const hasInstitutionRole = data.user.app_metadata?.role === 'institution';
    const { data: instData, error: instError } = hasInstitutionRole
      ? await supabase.rpc('get_institution_for_user')
      : { data: null, error: new Error('La cuenta no tiene el rol de institucion.') };
    if (instError || !instData || instData.length === 0) {
      await supabase.auth.signOut();
      return { error: 'Esta cuenta no tiene una institucion asociada.' };
    }
    setInstitution(instData[0] as InstitutionInfo);
    return { error: null };
  }, []);

  const user = session?.user ?? null;
  const isAnonymous = user?.is_anonymous === true;
  const isRepresentative = isAnonymous || (user !== null && !institution);
  const isInstitution = institution !== null;

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        isAnonymous,
        isRepresentative,
        isInstitution,
        institution,
        signOut,
        linkToEmail,
        linkToGoogle,
        signInInstitution,
        refreshInstitution,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
