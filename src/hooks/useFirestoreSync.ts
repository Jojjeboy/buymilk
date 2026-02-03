import { useEffect, useState, useCallback } from 'react';
import {
    collection,
    onSnapshot,
    doc,
    setDoc,
    deleteDoc,
    DocumentData,
    QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from '../firebase';

interface UseFirestoreSyncResult<T> {
    data: T[];
    loading: boolean;
    error: string | null;
    addItem: (item: T) => Promise<void>;
    updateItem: (id: string, item: Partial<T>) => Promise<void>;
    deleteItem: (id: string) => Promise<void>;
}

/**
 * Custom hook for syncing a Firestore collection with React state
 * @param collectionPath - Path to the Firestore collection (e.g., 'users/{uid}/categories')
 * @param userId - The authenticated user's ID
 * @returns Object with data, loading state, error, and CRUD operations
 */
export function useFirestoreSync<T extends { id: string }>(
    collectionPath: string,
    userId: string | null | undefined
): UseFirestoreSyncResult<T> {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) {
            setData([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        const path = collectionPath.replace('{uid}', userId);
        const collectionRef = collection(db, path);

        const unsubscribe = onSnapshot(
            collectionRef,
            (snapshot) => {
                const items: T[] = [];
                snapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
                    items.push(doc.data() as T);
                });
                setData(items);
                setLoading(false);
            },
            (err) => {
                console.error(`Firestore sync error for ${path}:`, err);
                setError(err.message);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [collectionPath, userId]);

    const addItem = useCallback(async (item: T) => {
        if (!userId) throw new Error('User not authenticated');
        const path = collectionPath.replace('{uid}', userId);
        const docRef = doc(db, path, item.id);
        await setDoc(docRef, item);
    }, [collectionPath, userId]);

    const updateItem = useCallback(async (id: string, updates: Partial<T>) => {
        if (!userId) throw new Error('User not authenticated');
        const path = collectionPath.replace('{uid}', userId);
        const docRef = doc(db, path, id);
        await setDoc(docRef, updates, { merge: true });
    }, [collectionPath, userId]);

    const deleteItem = useCallback(async (id: string) => {
        if (!userId) throw new Error('User not authenticated');
        const path = collectionPath.replace('{uid}', userId);
        const docRef = doc(db, path, id);
        await deleteDoc(docRef);
    }, [collectionPath, userId]);

    return {
        data,
        loading,
        error,
        addItem,
        updateItem,
        deleteItem
    };
}
