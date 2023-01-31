import { useState } from "react";
import {
  projectAuth,
  projectStorage,
  projectFirestore,
} from "../firebase/config";
import { useAuthContext } from "./useAuthContext";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";

export const useSignup = () => {
  const [error, setError] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const { dispatch } = useAuthContext();

  const signup = async (email, password, displayName, thumbnail) => {
    setError(null);
    setIsPending(true);

    try {
      // signup
      const res = await createUserWithEmailAndPassword(
        projectAuth,
        email,
        password
      );

      if (!res) {
        throw new Error("Could not complete signup");
      }

      try {
        // upload user thumbnail
        const uploadPath = `thumbnails/${res.user.uid}/${thumbnail.name}`;
        const storageRef = ref(projectStorage, uploadPath);
        await uploadBytes(storageRef, thumbnail);
        const imgUrl = await getDownloadURL(storageRef);
        try {
          // add display AND PHOTO_URL name to user
          await updateProfile(projectAuth.currentUser, {
            displayName,
            photoURL: imgUrl,
          });

          try {
            // create a user document
            await setDoc(doc(projectFirestore, "users", res.user.uid), {
              online: true,
              displayName,
              photoURL: imgUrl,
            });
            // dispatch login action
            dispatch({ type: "LOGIN", payload: res.user });
          } catch (e3) {
            console.log(e3.message);
          }
        } catch (e2) {
          console.log(e2.message);
        }
      } catch (e) {
        console.log(e.message);
      }

      setIsPending(false);
      setError(null);
    } catch (err) {
      setError(err.message);
      setIsPending(false);
    }
  };

  return { signup, error, isPending };
};
