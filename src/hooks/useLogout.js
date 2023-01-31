import { useState } from "react";
import { projectAuth, projectFirestore } from "../firebase/config";
import { useAuthContext } from "./useAuthContext";
import { signOut } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";

export const useLogout = () => {
  const [error, setError] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const { dispatch } = useAuthContext();

  const logout = async () => {
    setError(null);
    setIsPending(true);

    try {
      // update online status
      const { uid } = projectAuth.currentUser;
      const docRef = doc(projectFirestore, "users", uid);
      try {
        await updateDoc(docRef, { online: false });
        try {
          await signOut(projectAuth);
          dispatch({ type: "LOGOUT" });
        }catch(e2){
          console.log(e2.message)
        }
      }catch(e){
        console.log(e.message)
      }

      setIsPending(false);
      setError(null);
    } catch (err) {
      setError(err.message);
      setIsPending(false);
    }
  };

  return { logout, error, isPending };
};
