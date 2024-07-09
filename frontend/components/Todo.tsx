import { View, Text, Pressable } from 'react-native';
import { useEffect, useState } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values'
import { nanoid } from 'nanoid';
import { saveOnlineTodo, loadOnlineTodos, deleteOnlineTodo } from '@/api';
import type { Todo } from '@/api';

const STORAGE_KEY = "todos";

type TodoProps = { handleMarkAsDone: () => void } & Todo;

export function Todo({ value, handleMarkAsDone }: TodoProps) {
    return (
        <View style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 16,
            width: "80%"
        }}>
            <Pressable
                style={{
                    borderRadius: 100,
                    alignItems: "center",
                    justifyContent: "center",
                }}
                onPress={handleMarkAsDone}
                accessibilityLabel="Mark as done"
            >
                <FontAwesome size={32} style={{ paddingTop: 0 }} name="circle-thin" />
            </Pressable>
            <Text style={{ color: "black", fontSize: 24 }}>{value}</Text>
        </View>
    );
}

async function loadLocalStorageTodos(): Promise<Todo[]> {
    const value = await AsyncStorage.getItem(STORAGE_KEY);
    if (value === null) return [];
    return JSON.parse(value);
}

async function loadTodos(setTodos: React.Dispatch<React.SetStateAction<Todo[]>>, setLoaded: React.Dispatch<React.SetStateAction<boolean>>) {
    let serverTodos;
    try {
        serverTodos = await loadOnlineTodos();
    } catch (err) {
        console.error(err);
    }

    let localTodos;
    try {
        localTodos = await loadLocalStorageTodos();
    } catch (err) {
        console.error(err);
        // TODO err, the app cannot work if this fail
    }

    if (!localTodos) {
        setLoaded(true);
        return;
    }

    if (!serverTodos) {
        setTodos(localTodos);
        setLoaded(true);
        return;
    }

    // Server and local storage sync
    const serverTodosMap = new Map(serverTodos.map(todo => [todo.id, todo]));

    const toDelete = localTodos.filter(todo => todo.deleted && serverTodosMap.has(todo.id));
    const toSave = localTodos.filter(todo => !todo.saved && !serverTodosMap.has(todo.id));

    const deletedResults = await Promise.allSettled(toDelete.map(todo => deleteOnlineTodo(todo.id)));
    for (let i = 0; i < deletedResults.length; i++) {
        const result = deletedResults[i];
        if (result.status === "fulfilled") {
            const deletedId = toDelete[i].id;
            serverTodosMap.delete(deletedId);
        }
    }

    const savedResults = await Promise.allSettled(toSave.map(todo => saveOnlineTodo(todo)));
    for (let i = 0; i < savedResults.length; i++) {
        const result = savedResults[i];
        if (result.status === "fulfilled") {
            const savedTodo = toSave[i];
            savedTodo.saved = true;
            savedTodo.saving = false;
            serverTodosMap.set(savedTodo.id, savedTodo);
        }
    }

    setTodos([...serverTodosMap.values()]);
    setLoaded(true);
}

interface UseTodos {
    synced: boolean;
    loaded: boolean;
    todos: Todo[];
    addTodo: (value: string) => void;
    removeTodo: (id: string) => void;
}

export function useTodos(): UseTodos {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        loadTodos(setTodos, setLoaded);
    }, []);

    useEffect(() => {
        if (!loaded) return;

        async function saveTodos() {
            try {
                const value = JSON.stringify(todos);
                await AsyncStorage.setItem(STORAGE_KEY, value);
            } catch (err) {
                console.error(err);
                // TODO error
            }
        }

        saveTodos();
    }, [loaded, todos]);

    const addTodo: UseTodos["addTodo"] = (value) => {
        if (!loaded) return;

        const newTodo = {
            id: nanoid(),
            value,
            saved: false,
            saving: true,
            deleted: false
        }

        saveOnlineTodo(newTodo)
            .then(() => {
                newTodo.saved = true;
                newTodo.saving = false;
                setTodos(prev => [...prev]); // state has changed, rerender
            })
            .catch(() => newTodo.saving = false);

        setTodos(prev => [...prev, newTodo]);
    }

    const removeTodo: UseTodos["removeTodo"] = (id) => {
        if (!loaded) return;

        setTodos(prev => {
            const item = prev.find(todo => todo.id === id);
            if (!item) return prev;
            // item is not saved on the server so it can be deleted directly
            if (!item.saved && !item.saving) return prev.filter(todo => todo.id !== id);

            item.deleted = true;
            item.saving = true;
            deleteOnlineTodo(item.id)
                .then(() => setTodos(prev => prev.filter(todo => todo.id !== item.id)))
                .catch(() => item.saving = false);

            return [...prev];
        });
    }

    const visibleTodos = todos.filter(todo => !todo.deleted);
    const unsavedTodos = todos.find(todo => !todo.saved)
    return {
        synced: !unsavedTodos,
        loaded,
        todos: visibleTodos,
        addTodo,
        removeTodo
    };
}
