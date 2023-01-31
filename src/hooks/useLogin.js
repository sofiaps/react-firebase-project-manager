import { useState } from "react";
import { projectAuth, projectFirestore } from "../firebase/config";
import { useAuthContext } from "./useAuthContext";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";

export const useLogin = () => {
  const [error, setError] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const { dispatch } = useAuthContext();

  const login = async (email, password) => {
    setError(null);
    setIsPending(true);

    try {
      const res = await signInWithEmailAndPassword(
        projectAuth,
        email,
        password
      );

      const docRef = doc(projectFirestore, "users", res.user.uid);
      await updateDoc(docRef, { online: true });

      // dispatch login action
      dispatch({ type: "LOGIN", payload: res.user });

      
      setIsPending(false);
      setError(null);
    } catch (err) {
      setIsPending(false);
      setError(null);
    }
  };

  // useEffect(() => {
  //   return () => setIsCancelled(true);
  // }, []);

  return { login, isPending, error };
};
