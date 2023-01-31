import { useEffect, useState, useRef } from "react";
import { projectFirestore } from "../firebase/config";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

export const useCollection = (collectionKey, _query, _orderBy) => {
  const [documents, setDocuments] = useState(null);
  const [error, setError] = useState(null);

  const queryRef = useRef(_query).current;
  const orderByRef = useRef(_orderBy).current;

  useEffect(() => {
    let ref = collection(projectFirestore, collectionKey);

    if (queryRef) {
      ref = query(ref, where(...queryRef));
    }
    if (orderByRef) {
      ref = query(ref, orderBy(...orderByRef));
    }

    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        let results = [];
        snapshot.docs.forEach((doc) => {
          results.push({ ...doc.data(), id: doc.id });
        });

        setDocuments(results);
        setError(null);
      },
      (error) => {
        console.log(error);
        setError("could not fetch the data");
      }
    );

    return () => unsubscribe();
  }, [collectionKey, queryRef, orderByRef]);

  return { documents, error };
};
